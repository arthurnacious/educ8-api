import { Hono } from "hono";
import { JwtVariables } from "hono/jwt";
import { authMiddleware } from "../middleware/auth";
import db from "@/db";
import { eq, sql } from "drizzle-orm";
import { auditLogsTable, rolesTable, usersTable } from "@/db/schema";

const auditLogs = new Hono<{ Variables: JwtVariables }>();
auditLogs.use("*", authMiddleware);

auditLogs
  .get("/", async (ctx) => {
    const limit = 1000; // Adjust based on your needs
    const offset = Number(ctx.req.query("offset") || 0);

    const data = await db.query.auditLogsTable.findMany({
      columns: {
        id: true,
        model: true,
        action: true,
        createdAt: true,
      },
      with: {
        user: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: (auditLogs, { desc }) => [desc(auditLogs.createdAt)], // Descending is usually better for logs
      limit,
      offset,
    });

    return ctx.json({ data });
  })
  .get("/:id", async (ctx) => {
    const id = ctx.req.param("id");
    const data = await db
      .select({
        id: auditLogsTable.id,
        action: auditLogsTable.action,
        model: auditLogsTable.model,
        createdAt: auditLogsTable.createdAt,
        user: {
          id: usersTable.id,
          ame: usersTable.name,
          name: rolesTable.name,
        },
      })
      .from(auditLogsTable)
      .leftJoin(usersTable, eq(auditLogsTable.userId, usersTable.id)) // Join with users
      .leftJoin(rolesTable, eq(usersTable.roleId, rolesTable.id)) // Join with roles
      .where(eq(auditLogsTable.id, id))
      .limit(1); // Find first equivalent

    return ctx.json({ data });
  });

export default auditLogs;
