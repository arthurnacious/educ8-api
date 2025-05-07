// import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const ssl =
  process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : {};

// Set up the pg Pool and drizzle instance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl,
});

const db = drizzle(pool, { schema });

export default db;
