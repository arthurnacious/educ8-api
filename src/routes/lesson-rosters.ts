import { Hono } from "hono";
import { JwtVariables } from "hono/jwt";
import { authMiddleware } from "../middleware/auth";
import db from "@/db";

const lessonRosters = new Hono<{ Variables: JwtVariables }>();
lessonRosters.use("*", authMiddleware);

lessonRosters
  .get("/", async (ctx) => {
    const data = await db.query.lessonRostersTable.findMany();

    return ctx.json({ data });
  })
  .get("/:slug", async (ctx) => {
    const { slug } = ctx.req.param();

    const data = await db.query.lessonRostersTable.findFirst({
      where: (roster, { eq }) => eq(roster.slug, slug),
    });

    return ctx.json({ data });
  });

export default lessonRosters;
