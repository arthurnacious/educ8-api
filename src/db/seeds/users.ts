import { faker } from "@faker-js/faker";
import db from "..";
import { slugify } from "@/utils";
import { usersTable } from "../schema";
import { RoleName } from "@/types/roles";

export async function userSeeder(length: number) {
  await db.delete(usersTable);
  const users = Array.from({ length: length }, (_, idx) => ({
    name: faker.person.fullName(),
    email: idx + faker.internet.email(),
    emailVerified: faker.date.recent(),
    passwordHash: faker.internet.password(),
    role: faker.helpers.arrayElement([
      ...Object.values(RoleName),
      RoleName.STUDENT,
      RoleName.STUDENT,
    ]),
    image: faker.image.avatar(),
  }));

  await db.insert(usersTable).values(users).returning();
  console.log(`${length} new users seeded!`);
}
