import { Hono } from "hono";
import { cors } from "hono/cors";

import auth from "./routes/auth";
import auditLogs from "./routes/audit-logs";
import classes from "./routes/classes";
import subjects from "./routes/subjects";
import departments from "./routes/departments";
import lessonRosters from "./routes/lesson-rosters";
import personal from "./routes/personal";
import users from "./routes/users";
import db from "./db";

const app = new Hono();
app.use("*", cors());

app
  .get("/", (c) => {
    return c.json({ message: "Hi School Manager!" });
  })
  .route("/auth", auth)
  .route("/audit-logs", auditLogs)
  .route("/classes", classes)
  .route("/subjects", subjects)
  .route("/departments", departments)
  .route("/lesson-rosters", lessonRosters)
  .route("/personal", personal)
  .route("/users", users)
  .get("/test", async (c) => {
    const subject = await db.query.subjectsTable.findFirst({
      with: {
        fields: true,
      },
    });

    return c.json({ subject });
  });

export default {
  port: 8000,
  fetch: app.fetch,
};
