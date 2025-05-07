import { Hono } from "hono";
import { cors } from "hono/cors";

import auth from "./routes/auth";
import auditLogs from "./routes/audit-logs";
import courses from "./routes/courses";
import subjects from "./routes/subjects";
import departments from "./routes/departments";
import courses from "./routes/courses";
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
  .route("/courses", courses)
  .route("/subjects", subjects)
  .route("/departments", departments)
  .route("/courses", courses)
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
