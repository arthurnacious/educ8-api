import {
  int,
  timestamp,
  mysqlTable,
  primaryKey,
  varchar,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";
import type { AdapterAccount } from "next-auth/adapters";

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { RoleName } from "@/types/roles";
import { AttendanceName } from "@/types/attendance";

const poolConnection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
});

export const db = drizzle(poolConnection);
const roles: string[] = Object.values(RoleName);

export const users = mysqlTable("user", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }),
  image: varchar("image", { length: 255 }),
  role: mysqlEnum("role", roles as [string, ...string[]])
    .default("Student")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date()),
});
