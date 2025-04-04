import { Hono } from "hono";
import { JwtVariables } from "hono/jwt";
import db from "@/db";
import { and, eq, sql } from "drizzle-orm";
import {
  subjectsTable,
  departmentsTable,
  userToDepartmentsTable,
} from "@/db/schema";
import { departmentRole } from "@/types/roles";
import { slugify } from "@/utils";
import { z } from "zod";
import { authMiddleware } from "@/middleware/auth";

const createDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
});

const deleteDepartmentsSchema = z.object({
  ids: z.array(z.string()),
});

const assignUserToDepartmentSchema = z.object({
  userId: z.string().min(1, {
    message: "User Must be selected",
  }),
  departmentId: z.string().min(1, {
    message: "Department Must be selected",
  }),
  departmentRole: z.nativeEnum(departmentRole).default(departmentRole.LECTURER),
});

const unassignUsersToDeprtmentSchema = z.object({
  idObject: z.array(z.object({ userId: z.string(), departmentId: z.string() })),
});

const departments = new Hono<{ Variables: JwtVariables }>();
departments.use("*", authMiddleware);

departments
  .get("/", async (ctx) => {
    const searchQuery = ctx.req.query("search");

    if (searchQuery) {
      // Perform a filtered search
      const data = await db.query.departmentsTable.findMany({
        where: (departmentsTable, { ilike }) =>
          ilike(departmentsTable.name, `%${searchQuery}%`),
      });
      return ctx.json({ data });
    }

    // Fetch role IDs in parallel
    const [leaderRole, lecturerRole, students] = await Promise.all([
      db.query.departmentRolesTable.findFirst({
        where: (departmentRolesTable, { eq }) =>
          eq(departmentRolesTable.name, departmentRole.LEADER),
        columns: { id: true },
      }),
      db.query.departmentRolesTable.findFirst({
        where: (departmentRolesTable, { eq }) =>
          eq(departmentRolesTable.name, departmentRole.LECTURER),
        columns: { id: true },
      }),
      db.query.departmentRolesTable.findFirst({
        where: (departmentRolesTable, { eq }) =>
          eq(departmentRolesTable.name, departmentRole.STUDENT),
        columns: { id: true },
      }),
    ]);

    if (!leaderRole?.id || !lecturerRole?.id || !students?.id) {
      throw new Error("Required department roles not found.");
    }

    const leaderRoleId = leaderRole.id;
    const lecturerRoleId = lecturerRole.id;
    const studentRoleId = students.id;

    // Fetch departments with counts
    const data = await db
      .select({
        id: departmentsTable.id,
        name: departmentsTable.name,
        slug: departmentsTable.slug,
        createdAt: departmentsTable.createdAt,
        updatedAt: departmentsTable.updatedAt,
        leadersCount: sql<number>`
        (SELECT COUNT(*) 
         FROM ${userToDepartmentsTable} 
         WHERE ${eq(userToDepartmentsTable.departmentRoleId, leaderRoleId)} 
         AND ${eq(userToDepartmentsTable.departmentId, departmentsTable.id)}
        )`.as("leaders_count"),
        lecturersCount: sql<number>`
        (SELECT COUNT(*) 
         FROM ${userToDepartmentsTable} 
         WHERE ${eq(userToDepartmentsTable.departmentRoleId, lecturerRoleId)} 
         AND ${eq(userToDepartmentsTable.departmentId, departmentsTable.id)}
        )`.as("lecturers_count"),
        subjectsCount: sql<number>`
        (SELECT COUNT(*) 
         FROM ${subjectsTable} 
         WHERE ${eq(subjectsTable.departmentId, departmentsTable.id)}
        )`.as("subjects_count"),
        studentsCount: sql<number>`
        (SELECT COUNT(*) 
         FROM ${userToDepartmentsTable} 
         WHERE ${eq(userToDepartmentsTable.departmentRoleId, studentRoleId)} 
         AND ${eq(userToDepartmentsTable.departmentId, departmentsTable.id)}
        )`.as("sstudents_count"),
      })
      .from(departmentsTable)
      .orderBy(departmentsTable.name)
      .execute();

    return ctx.json({ data });
  })
  .patch("/", async (ctx) => {
    try {
      const body = await ctx.req.json(); // Get request body
      const validatedData = deleteDepartmentsSchema.safeParse(body); // Validate input
      console.log(validatedData.data);
      if (!validatedData.success) {
        return ctx.json({ error: validatedData.error.format() }, 400);
      }

      const { ids } = validatedData.data;

      const data = await Promise.all(
        ids.map((departmentId) =>
          db
            .delete(departmentsTable)
            .where(eq(departmentsTable.id, departmentId))
        )
      );

      return ctx.json({ data }, 200);
    } catch (error) {
      console.error("Error deleting departments:", error);
      return ctx.json({ error: "Internal Server Error" }, 500);
    }
  })
  .post("/", async (ctx) => {
    try {
      const body = await ctx.req.json(); // Get request body
      const validatedData = createDepartmentSchema.safeParse(body); // Validate input

      if (!validatedData.success) {
        return ctx.json({ error: validatedData.error.format() }, 400);
      }

      const { name } = validatedData.data;

      var slug = slugify(name);

      let baseSlug = slug;
      let counter = 1;
      while (
        await db.query.departmentsTable.findFirst({
          where: (department, { eq }) => eq(department.slug, slug),
        })
      ) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const data = await db.insert(departmentsTable).values({
        name: capitalizeFirstLetter(name),
        slug: slugify(name),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return ctx.json({ data }, 201);
    } catch (error) {
      console.error("Error creating department:", error);
      return ctx.json({ error: "Internal Server Error" }, 500);
    }
  })
  .get("/roles", async (ctx) => {
    const data = await db.query.departmentRolesTable.findMany({
      columns: {
        id: true,
        name: true,
      },
    });

    return ctx.json({ data });
  })
  .get("/:slug", async (ctx) => {
    const { slug } = ctx.req.param();

    const data = await db.query.departmentsTable.findFirst({
      where: (department, { eq }) => eq(department.slug, slug),
      with: {
        members: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
            role: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
        subjects: {
          columns: {
            id: true,
            name: true,
            slug: true,
            createdAt: true,
          },
        },
      },
    });

    return ctx.json({ data });
  })
  .put("/:slug", async (ctx) => {
    const { slug } = ctx.req.param();
    try {
      const body = await ctx.req.json(); // Get request body
      const validatedData = createDepartmentSchema.safeParse(body); // Validate input

      if (!validatedData.success) {
        return ctx.json({ error: validatedData.error.format() }, 400);
      }

      const { name } = validatedData.data;

      const data = await db
        .update(departmentsTable)
        .set({
          name: capitalizeFirstLetter(name),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(departmentsTable.slug, slug))
        .execute();

      return ctx.json({ data }, 200);
    } catch (error) {
      console.error("Error updating department:", error);
      return ctx.json({ error: "Internal Server Error" }, 500);
    }
  })
  .post("/members", async (ctx) => {
    try {
      const body = await ctx.req.json(); // Get request body
      const validatedData = assignUserToDepartmentSchema.safeParse(body); // Validate input

      if (!validatedData.success) {
        return ctx.json({ error: validatedData.error.format() }, 400);
      }

      const { userId, departmentId, departmentRole } = validatedData.data;

      const [{ id: departmentRoleId }] =
        await db.query.departmentRolesTable.findMany({
          where: (departmentRolesTable, { eq }) =>
            eq(departmentRolesTable.name, departmentRole),
        });

      const data = await db.insert(userToDepartmentsTable).values({
        userId,
        departmentId,
        departmentRoleId,
      });

      return ctx.json({ data }, 200);
    } catch (error) {
      console.error("Error attaching user to department:", error);
      return ctx.json({ error: "Internal Server Error" }, 500);
    }
  })
  .patch("/members", async (ctx) => {
    try {
      const body = await ctx.req.json();
      const validatedData = unassignUsersToDeprtmentSchema.safeParse(body); // Validate input

      if (!validatedData.success) {
        return ctx.json({ error: validatedData.error.format() }, 400);
      }

      const { idObject } = validatedData.data;

      console.log("idObject", idObject);

      const data = await Promise.all(
        idObject.map(({ userId, departmentId }) =>
          db
            .delete(userToDepartmentsTable)
            .where(
              and(
                eq(userToDepartmentsTable.userId, userId),
                eq(userToDepartmentsTable.departmentId, departmentId)
              )
            )
        )
      );

      return ctx.json({ data }, 200);
    } catch (error) {
      console.error("Error attaching user to department:", error);
      return ctx.json({ error: "Internal Server Error" }, 500);
    }
  });

export default departments;

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
