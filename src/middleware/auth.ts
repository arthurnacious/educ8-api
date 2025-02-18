import { Context, Next } from "hono";
import { jwt } from "hono/jwt";
import type { JwtVariables } from "hono/jwt";

// Custom error-handling middleware
export const authMiddleware = async (c: Context, next: Next) => {
  try {
    await jwt({ secret: process.env.JWT_SECRET! })(c, next);
    await next();
  } catch (err) {
    return c.json({ error: "Unauthorized: Invalid or expired token" }, 401);
  }
};
