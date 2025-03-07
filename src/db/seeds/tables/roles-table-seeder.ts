import { faker } from "@faker-js/faker";
import { userRole } from "@/types/roles";
import db from "@/db";
import { rolesTable } from "@/db/schema";

interface RoleSeederOptions {
  batch?: number;
  customFields?: Record<string, (index: number) => any>;
}

export async function rolesTableSeeder(options: RoleSeederOptions = {}) {
  const { batch = 100, customFields = {} } = options;

  await db.delete(rolesTable);

  // We'll seed all the roles defined in the userRole enum
  const roleValues = Object.values(userRole);
  console.log(`Seeding ${roleValues.length} roles...`);

  const roleData = roleValues.map((role, index) => {
    return {
      name: customFields.name?.(index) || role,
      description:
        customFields.description?.(index) ||
        faker.lorem.sentence({ min: 10, max: 20 }),
      createdAt: customFields.createdAt?.(index) || faker.date.past(),
      updatedAt: customFields.updatedAt?.(index) || new Date(),
    };
  });

  console.log(`Inserting ${roleData.length} roles...`);
  await db.insert(rolesTable).values(roleData);

  console.log(`Successfully seeded ${roleData.length} roles.`);

  // Return the created roles for reference in other seeders
  return await db.select().from(rolesTable);
}
