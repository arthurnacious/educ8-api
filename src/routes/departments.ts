import { Hono } from "hono";
import { JwtVariables } from "hono/jwt";
import { authMiddleware } from "../middleware/auth";
import db from "@/db";
import { and, eq, sql } from "drizzle-orm";
import {
  coursesTable,
  coursesToDepartments,
  departmentsTable,
  userToDepartment,
  userToDepartmentRelations,
} from "@/db/schema";
import { departmentUserRole } from "@/types/roles";
import { slugify } from "@/utils";
import { z } from "zod";

const departmentSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
});

const departments = new Hono<{ Variables: JwtVariables }>();
// departments.use("*", authMiddleware);

departments
  .get("/", async (ctx) => {
    const data = await db
      .select({
        id: departmentsTable.id,
        name: departmentsTable.name,
        slug: departmentsTable.slug,
        createdAt: departmentsTable.createdAt,
        updatedAt: departmentsTable.updatedAt,
        leadersCount: sql<number>`
        (SELECT COUNT(*) 
         FROM ${userToDepartment} 
         WHERE ${userToDepartment.role} = ${departmentUserRole.LEADER} AND ${userToDepartment.departmentId} = ${departmentsTable.id}
        )`.as("leaders_count"),
        lecturersCount: sql<number>`
        (SELECT COUNT(*) 
         FROM ${userToDepartment} 
         WHERE ${userToDepartment.role} = ${departmentUserRole.LECTURER} AND ${userToDepartment.departmentId} = ${departmentsTable.id}
        )`.as("lecturers_count"),
        coursesCount: sql`count(distinct ${coursesTable.id})`.as(
          "courses_count"
        ),
      })
      .from(departmentsTable)
      .leftJoin(
        coursesTable,
        eq(departmentsTable.id, coursesTable.departmentId)
      )
      .leftJoin(
        userToDepartment,
        eq(departmentsTable.id, userToDepartment.departmentId)
      )
      .groupBy(departmentsTable.id)
      .execute();

    return ctx.json({ data });
  })
  .get("/:slug", async (ctx) => {
    const { slug } = ctx.req.param();

    const data = await db.query.departmentsTable.findFirst({
      where: (department, { eq }) => eq(department.slug, slug),
    });

    return ctx.json({ data });
  })
  .post("/", async (ctx) => {
    try {
      const body = await ctx.req.json(); // Get request body
      const validatedData = departmentSchema.safeParse(body); // Validate input

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
  });

export default departments;

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
