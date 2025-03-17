import { Hono } from "hono";
import { cors } from "hono/cors";
import departments from "./routes/departments";
import me from "./routes/me";
import auth from "./routes/auth";
import users from "./routes/users";
import courses from "./routes/courses";
import lessonRosters from "./routes/lesson-rosters";

const app = new Hono();
app.use("*", cors());

app
  .get("/", (c) => {
    return c.json({ message: "Hi School Manager!" });
  })
  .route("/auth", auth)
  .route("/me", me)
  .route("/courses", courses)
  .route("/departments", departments)
  .route("/lesson-rosters", lessonRosters)
  .route("/users", users);

export default {
  port: 8000,
  fetch: app.fetch,
};
