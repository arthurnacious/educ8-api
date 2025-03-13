import { Hono } from "hono";
import { JwtVariables } from "hono/jwt";
import { authMiddleware } from "../middleware/auth";
import db from "@/db";
import { z } from "zod";
import { coursesTable } from "@/db/schema";
import { inArray } from "drizzle-orm";

const courses = new Hono<{ Variables: JwtVariables }>();
// courses.use("*", authMiddleware);

const deleteCoursesIds = z.object({
  idsArray: z.array(z.string()),
});

courses
  .get("/", async (ctx) => {
    const data = await db.query.coursesTable.findMany();

    return ctx.json({ data });
  })
  .get("/:slug", async (ctx) => {
    const { slug } = ctx.req.param();

    const data = await db.query.coursesTable.findFirst({
      where: (course, { eq }) => eq(course.slug, slug),
      with: {
        fields: true,
      },
    });

    return ctx.json({ data });
  })
  .patch("/multi-delete", async (ctx) => {
    try {
      const body = await ctx.req.json();
      const validatedData = deleteCoursesIds.safeParse(body);

      if (!validatedData.success) {
        return ctx.json({ error: validatedData.error.format() }, 400);
      }

      const { idsArray } = validatedData.data;

      const data = await db
        .delete(coursesTable)
        .where(inArray(coursesTable.id, idsArray));

      return ctx.json({ data }, 200);
    } catch (error) {
      console.error("Error deleting courses:", error);
      return ctx.json({ error: "Internal Server Error" }, 500);
    }
  });

export default courses;
