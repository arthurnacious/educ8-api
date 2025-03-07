import { rolesTable, usersTable } from "@/db/schema";
import { rolesTableSeeder } from "./roles-table-seeder";
import db from "@/db";
import { faker } from "@faker-js/faker";

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
    const defaultPassword = await Bun.password.hash("password123");

    const userData = Array.from({ length: batchSize }, (_, index) => {
      const actualIndex = i + index;
      // Assign a random role to the user
      const role = roles[Math.floor(Math.random() * roles.length)];

      const uniqueSuffix = `${Date.now()}-${Math.floor(
        Math.random() * 100000
      )}`;
      return {
        name: customFields.name?.(actualIndex) || faker.person.fullName(),
        email:
          customFields.email?.(actualIndex) ||
          `${faker.internet
            .displayName()
            .toLowerCase()}-${uniqueSuffix}@example.com`,
        emailVerified:
          customFields.emailVerified?.(actualIndex) ||
          (Math.random() > 0.3 ? faker.date.past() : null),
        passwordHash:
          customFields.passwordHash?.(actualIndex) || defaultPassword,
        roleId: customFields.roleId?.(actualIndex) || role?.id || null,
        image:
          customFields.image?.(actualIndex) ||
          (Math.random() > 0.5 ? faker.image.avatar() : null),
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
