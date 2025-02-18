import { Hono } from "hono";
import departments from "./routes/departments";
import me from "./routes/me";
import auth from "./routes/auth";

const app = new Hono()
  .route("/", auth)
  .route("/departments", departments)
  .route("/me", me);

export default app;
