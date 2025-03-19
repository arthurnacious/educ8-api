import { hash, verify as verifyPassword } from "@/auth";
import db from "@/db";
import { usersTable } from "@/db/schema";
import { setCookie, getCookie } from "hono/cookie";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { z } from "zod";

const auth = new Hono();

const refreshTokens = new Map();

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
          with: {
            permissions: {
              columns: {
                name: true,
              },
            },
          },
        },
        permissions: {
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

    const permissions = [
      ...(user?.role?.permissions?.map((p) => p.name) || []),
      ...(user?.permissions?.map((p) => p.name) || []),
    ];

    const token = await sign(
      {
        id: user.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour from now,
      },
      process.env.JWT_SECRET!
    );

    // Exclude sensitive/unnecessary fields
    const {
      passwordHash,
      roleId,
      permissions: userPerms,
      role,
      ...rest
    } = user;
    const userPayload = {
      ...rest,
      role: role ? { name: role.name } : null, // Keep role name only
      permissions,
    };

    return c.json({ user: userPayload, accessToken: token });
  })
  .post("/refresh", async (c) => {
    const refreshTokenId = getCookie(c, "refreshToken");

    if (!refreshTokenId) {
      return c.json({ error: "Refresh token required" }, 401);
    }

    // Verify refresh token exists in our store
    const userData = refreshTokens.get(refreshTokenId);
    if (!userData) {
      return c.json({ error: "Invalid refresh token" }, 403);
    }

    // Generate new access token
    const payload = {
      id: userData.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour from now,
    };
    const accessToken = await sign(payload, process.env.JWT_SECRET!);

    const newRefreshTokenId = generateRandomString(64);
    // Store new refresh token
    refreshTokens.set(newRefreshTokenId, {
      ...userData,
      createdAt: Date.now(),
    });

    // Delete old refresh token
    refreshTokens.delete(refreshTokenId);

    // Set new refresh token cookie
    setCookie(c, "refreshToken", newRefreshTokenId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return c.json({ accessToken });
  })
  .post("/logout", (c) => {
    //do stuff

    return c.json({ message: "Logged out successfully" });
  });

export default auth;

function generateRandomString(length = 64) {
  // Use crypto.getRandomValues for cryptographically strong random values
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  // Convert to a string using base64 encoding and remove non-alphanumeric characters
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, length); // Ensure exact length
}
