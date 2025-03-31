import { Context, Next } from "hono";
import { jwt } from "hono/jwt";

// Custom error-handling middleware
export const authMiddleware = async (c: Context, next: Next) => {
  try {
    // Apply JWT middleware to verify the token
    await jwt({
      secret: process.env.JWT_SECRET!,
    })(c, next);

    // Extract user data from the token
    const user = c.get("jwtPayload"); // 'jwtPayload' is the correct key, not 'jwt'

    if (!user) {
      return c.json({ error: "Unauthorized: No user found" }, 401);
    }

    // Add user to the context for downstream handlers
    c.set("user", user);

    // Call next without await - the jwt middleware already called next
    return await next();
  } catch (err) {
    return c.json({ error: "Unauthorized: Invalid or expired token" }, 401);
  }
};
