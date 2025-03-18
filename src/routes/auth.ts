import { hash, verify as verifyPassword } from "@/auth";
import db from "@/db";
import { usersTable } from "@/db/schema";
import { authMiddleware } from "@/middleware/auth";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { z } from "zod";

const auth = new Hono();

const loginSchema = z.object({
  email: z.string().min(1).max(100),
  password: z.string().min(1).max(100),
  remember_me: z.boolean().optional(),
});

auth
  .post("/login", async (c) => {
    const body = await c.req.json(); // Get request body
    const validatedData = loginSchema.safeParse(body); // Validate input

    if (!validatedData.success) {
      return c.json({ error: validatedData.error.format() }, 400);
    }

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, validatedData.data.email),
      with: {
        role: {
          columns: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return c.json({ error: "Invalid Credentials" }, 401);
    }

    const isMatch = verifyPassword(
      validatedData.data.password,
      user.passwordHash
    );

    if (!isMatch) {
      return c.json({ error: "Invalid Credentials" }, 401);
    }

    const token = await sign(
      {
        id: user.id, email: user.email, role: "user", 
        exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1 hour from now,
      },
      process.env.JWT_SECRET!
    );

    const { passwordHash, roleId, ...userPayload } = user;

    return c.json({ user: userPayload, accessToken: token });
  })
  .get("/refresh", authMiddleware, async (c) => {
    const { user: decoded } = c.get("jwtPayload");

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, decoded.id),
      with: {
        role: {
          columns: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }

    const { passwordHash, role, ...userPayload } = user;

    const expiresIn = 60 * 24 * 7 * 4; // Adjust expiration
    const newToken = await sign(
      { ...userPayload, role: user.role.name },
      process.env.JWT_SECRET!
    );

    return c.json({ token: newToken });
  })
  .post("/logout", (c) => {
    //do stuff

    return c.json({ message: "Logged out successfully" });
  });

export default auth;
