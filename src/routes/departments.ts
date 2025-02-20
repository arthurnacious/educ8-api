import { Hono } from "hono";
import { JwtVariables } from "hono/jwt";
import { authMiddleware } from "../middleware/auth";
import db from "@/db";

const departments = new Hono<{ Variables: JwtVariables }>();
departments.use("*", authMiddleware);

departments
  .get("/", async (ctx) => {
    const data = await db.query.departmentsTable.findMany();

    return ctx.json({ data });
  })
  .get("/:slug", async (ctx) => {
    const { slug } = ctx.req.param();

    const data = await db.query.departmentsTable.findFirst({
      where: (department, { eq }) => eq(department.slug, slug),
    });

    return ctx.json({ data });
  });

export default departments;
