import { Hono } from "hono";
import type { JwtVariables } from "hono/jwt";
import { authMiddleware } from "../middleware/auth";

const me = new Hono<{ Variables: JwtVariables }>();
me.get("/", authMiddleware, (c) => {
  const user = c.get("jwtPayload");
  return c.json({ message: `Access granted to ${user.username}` });
});

export default me;
