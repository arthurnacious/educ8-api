import { Hono } from "hono";
import { JwtVariables } from "hono/jwt";
import { authMiddleware } from "../middleware/auth";
import db from "@/db";

const departments = new Hono<{ Variables: JwtVariables }>();

departments.get("/", authMiddleware, async (ctx) => {
  const data = await db.query.departmentsTable.findMany();

  return ctx.json({ data });
});

export default departments;
