import { Hono } from "hono";
import { JwtVariables } from "hono/jwt";
import { authMiddleware } from "../middleware/auth";
import db from "@/db";

const courses = new Hono<{ Variables: JwtVariables }>();
// courses.use("*", authMiddleware);

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
  });

export default courses;
