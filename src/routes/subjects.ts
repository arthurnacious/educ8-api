import { Hono } from "hono";
import { JwtVariables } from "hono/jwt";
import { authMiddleware } from "../middleware/auth";
import db from "@/db";
import { z } from "zod";
import { subjectsTable } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

const subjects = new Hono<{ Variables: JwtVariables }>();
// subjects.use("*", authMiddleware);

const deleteSubjectsIds = z.object({
  idsArray: z.array(z.string()),
});

subjects
  .get("/", async (ctx) => {
    const data = await db.query.subjectsTable.findMany({
      with: {
        department: true,
      },
    });

    return ctx.json({ data });
  })
  .get("/:slug", async (ctx) => {
    const { slug } = ctx.req.param();

    const data = await db.query.subjectsTable.findFirst({
      where: (subject, { eq }) => eq(subject.slug, slug),
      with: {
        fields: true,
        department: true,
      },
    });

    return ctx.json({ data });
  })
  .put("/:slug", async (ctx) => {
    const { slug } = ctx.req.param();
    const body = await ctx.req.json();

    const validatedData = z
      .object({
        name: z
          .string()
          .min(2, { message: "Name must be at least 2 characters." }),
        description: z.string(),
        departmentId: z.string(),
      })
      .parse(body);

    const updatedSubject = await db
      .update(subjectsTable)
      .set({
        name: validatedData.name,
        description: validatedData.description,
        departmentId: validatedData.departmentId,
      })
      .where(eq(subjectsTable.slug, slug))
      .returning();

    return ctx.json({ data: updatedSubject[0] }, 200);
  })
  .patch("/multi-delete", async (ctx) => {
    try {
      const body = await ctx.req.json();
      const validatedData = deleteSubjectsIds.safeParse(body);

      if (!validatedData.success) {
        return ctx.json({ error: validatedData.error.format() }, 400);
      }

      const { idsArray } = validatedData.data;

      const data = await db
        .delete(subjectsTable)
        .where(inArray(subjectsTable.id, idsArray));

      return ctx.json({ data }, 200);
    } catch (error) {
      console.error("Error deleting subjects:", error);
      return ctx.json({ error: "Internal Server Error" }, 500);
    }
  });

export default subjects;
