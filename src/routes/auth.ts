import { hash, verify as verifyPassword } from "@/auth";
import db from "@/db";
import { usersTable } from "@/db/schema";
import { password } from "bun";
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
  .get("/", async (c) => {
    return c.json({ message: "Hi School Manager!" });
  })
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
      return c.json({ error: "Invalid Credentialss" }, 401);
    }

    const isMatch = verifyPassword(
      validatedData.data.password,
      user.passwordHash
    );
    if (!isMatch) {
      return c.json({ error: "Invalid Credentials" }, 401);
    }

    const expiresIn = validatedData.data.remember_me ? 60 * 24 * 7 * 4 : 60; // Adjust expiration
    const token = await sign(
      { id: user.id, email: user.email, role: "user" },
      process.env.JWT_SECRET!
    );

    const { passwordHash, ...userPayload } = user;

    return c.json({ user: userPayload, token });
  })
  .get("/test", async (c) => {
    const password = "12345678910";
    const hashed = hash(password);
    const data = {
      hash: hashed,
      isMatch: verifyPassword(password, hashed),
    };
    return c.json({ data });
  });

export default auth;
