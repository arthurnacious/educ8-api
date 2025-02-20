import { Hono } from "hono";
import { JwtVariables } from "hono/jwt";
import { authMiddleware } from "../middleware/auth";
import db from "@/db";

const users = new Hono<{ Variables: JwtVariables }>();
users.use("*", authMiddleware);

users
  .get("/", async (ctx) => {
    const data = await db.query.usersTable.findMany();

    return ctx.json({ data });
  })
  .get("/:id", async (ctx) => {
    const { id } = ctx.req.param();

    const data = await db.query.usersTable.findFirst({
      where: (user, { eq }) => eq(user.id, id),
    });

    return ctx.json({ data });
  });

export default users;
