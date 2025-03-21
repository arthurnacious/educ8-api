import { Hono } from "hono";
import { JwtVariables } from "hono/jwt";
import { authMiddleware } from "../middleware/auth";
import db from "@/db";

const users = new Hono<{ Variables: JwtVariables }>();
users.use("*", authMiddleware);

users
  .get("/", async (ctx) => {
    // Get the 'search' query parameter from the request
    const searchQuery = ctx.req.query("search");

    let data;
    if (searchQuery) {
      // If a search query exists, filter users based on the search term
      data = await db.query.usersTable.findMany({
        where: (user, { ilike }) => ilike(user.name, `%${searchQuery}%`), // Adjust 'name' if you're searching by another field
      });
    } else {
      // If no search query exists, fetch all users
      data = await db.query.usersTable.findMany();
    }

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
