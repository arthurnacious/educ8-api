import { verify as verifyPassword } from "@/auth";
import db from "@/db";
import { refreshTokensTable, usersTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
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

    // Create access token
    const tokenExpiresIn = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now
    const accessToken = await sign(
      {
        id: user.id,
        exp: tokenExpiresIn,
      },
      process.env.JWT_SECRET!
    );

    // Create refresh token
    const refreshToken = await sign(
      {
        id: user.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 1 week from now
      },
      process.env.JWT_SECRET!
    );

    // Store refresh token in the database
    await db.insert(refreshTokensTable).values({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week from now
    });

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
      role: role.name,
      permissions,
      expiresIn: tokenExpiresIn,
    };

    // Send both tokens as headers
    c.status(200);
    c.header("Authorization", `Bearer ${accessToken}`);
    c.header("X-Refresh-Token", refreshToken);
    return c.json({ user: userPayload });
  })
  .post("/refresh", async (c) => {
    try {
      const { refreshToken } = await c.req.json();
      if (!refreshToken) {
        return c.json({ message: "Refresh token is required" }, 400);
      }

      // Validate the refresh token
      const { id } = await verify(refreshToken, process.env.JWT_SECRET!);

      if (!id) {
        return c.json({ message: "Invalid refresh token" }, 401);
      }

      const oldRefreshToken = await db.query.refreshTokensTable.findFirst({
        where: and(
          eq(refreshTokensTable.userId, id as string),
          eq(refreshTokensTable.token, refreshToken as string)
        ),
        columns: {
          userId: true,
        },
      });

      if (!oldRefreshToken) {
        return c.json({ message: "Invalid refresh token" }, 401);
      }

      // Fetch user from database
      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, id as string),
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

      const newRefreshToken = await sign(
        {
          id: id,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 * 4, // 1 week from now
        },
        process.env.JWT_SECRET!
      );

      await db
        .update(refreshTokensTable)
        .set({
          token: newRefreshToken,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week from now
        })
        .where(
          and(
            eq(refreshTokensTable.userId, id as string),
            eq(refreshTokensTable.token, refreshToken as string)
          )
        );

      if (!user) {
        return c.json({ message: "User not found" }, 404);
      }

      const permissions = [
        ...(user?.role?.permissions?.map((p) => p.name) || []),
        ...(user?.permissions?.map((p) => p.name) || []),
      ];

      // Generate new tokens
      const accessToken = await sign(
        {
          id: user.id,
          exp: Math.floor(Date.now() / 1000) + 60 * 10, // 10 minutes from now
        },
        process.env.JWT_SECRET!
      );

      const {
        passwordHash,
        roleId,
        permissions: userPerms,
        role,
        ...rest
      } = user;
      const userPayload = {
        ...rest,
        role: role.name,
        permissions,
      };

      c.status(200);
      c.header("Authorization", `Bearer ${accessToken}`);
      c.header("X-Refresh-Token", newRefreshToken);

      return c.json({ user: userPayload });
    } catch (error) {
      console.error("Error refreshing token:", error);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  })
  .post("/logout", async (c) => {
    try {
      const { refreshToken } = await c.req.json();

      if (!refreshToken) {
        return c.json({ message: "Refresh token is required" }, 400);
      }

      // Remove the refresh token from active storage
      await db
        .delete(refreshTokensTable)
        .where(eq(refreshTokensTable.token, refreshToken));

      return c.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Error logging out:", error);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  });

export default auth;
