import { rolesTable, usersTable } from "@/db/schema";
import { rolesTableSeeder } from "./roles-table-seeder";
import db from "@/db";
import { faker } from "@faker-js/faker";
import { hash } from "@/auth";
interface UserSeederOptions {
  batch?: number;
  customFields?: Record<string, (index: number) => any>;
}

export async function usersTableSeeder(
  count: number,
  options: UserSeederOptions = {}
) {
  const { batch = 100, customFields = {} } = options;
  await db.delete(usersTable);
  console.log(`Seeding ${count} users in batches of ${batch}...`);

  // Get all roles (or create them if they don't exist)
  let roles = await db.select().from(rolesTable);
  if (roles.length === 0) {
    roles = await rolesTableSeeder();
  }

  for (let i = 0; i < count; i += batch) {
    const batchSize = Math.min(batch, count - i);

    // Generate password hash once for all users in this batch to improve performance
    const defaultPassword = hash("password123");

    const userData = Array.from({ length: batchSize }, (_, index) => {
      const actualIndex = i + index;
      // Assign a random role to the user
      const role = roles[Math.floor(Math.random() * roles.length)];

      const uniqueSuffix = `${Date.now()}-${Math.floor(
        Math.random() * 100000
      )}`;
      return {
        name: faker.person.fullName(),
        email: `${faker.internet
          .displayName()
          .toLowerCase()}-${uniqueSuffix}@example.com`,
        emailVerified: Math.random() > 0.3 ? faker.date.past() : null,
        passwordHash: defaultPassword,
        roleId: role?.id,
        image: Math.random() > 0.5 ? faker.image.avatar() : null,
      };
    });

    console.log(
      `Inserting batch ${i / batch + 1} (${userData.length} users)...`
    );
    await db.insert(usersTable).values(userData);
  }

  console.log(`Successfully seeded ${count} users.`);
  return await db.select().from(usersTable);
}
