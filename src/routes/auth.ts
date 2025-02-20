import { Hono } from "hono";
import { sign } from "hono/jwt";

const auth = new Hono();

auth
  .post("/login", async (c) => {
    const { username, password, remember_me } = await c.req.json();

    // Validate user credentials (dummy check)
    if (username !== "arthurnacious@gmail.com" || password !== "password") {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const expiresIn = remember_me ? 60 * 24 * 7 * 4 : 60; // Adjust expiration
    const token = await sign(
      { username, role: "user" },
      process.env.JWT_SECRET!
    );

    return c.json({ token });
  })
  .get("/", async (c) => {
    return c.json({ message: "Hi School Manager!" });
  });

export default auth;
