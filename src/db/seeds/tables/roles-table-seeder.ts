import { faker } from "@faker-js/faker";
import { userRole, departmentRole } from "@/types/roles";
import db from "@/db";
import { departmentRolesTable, rolesTable } from "@/db/schema";

interface RoleSeederOptions {
  batch?: number;
  customFields?: Record<string, (index: number) => any>;
}

export async function rolesTableSeeder(options: RoleSeederOptions = {}) {
  await db.delete(rolesTable);
  await db.delete(departmentRolesTable);

  // We'll seed all the roles defined in the userRole enum
  const roleValues = Object.values(userRole);
  const departmentRoleValues = Object.values(departmentRole);
  console.log(`Seeding ${roleValues.length} roles...`);

  const roleData = roleValues.map((role, index) => {
    const date = faker.date.past();
    return {
      name: role,
      description: faker.lorem.sentence({ min: 10, max: 20 }),
      createdAt: date,
      updatedAt: date,
    };
  });

  const departmentRoleData = departmentRoleValues.map((role, index) => {
    const date = faker.date.past();
    return {
      name: role,
      description: faker.lorem.sentence({ min: 10, max: 50 }),
      createdAt: date,
      updatedAt: date,
    };
  });

  console.log(`Inserting ${roleData.length} roles...`);
  await db.insert(rolesTable).values(roleData);

  console.log(`Inserting ${departmentRoleData.length} department roles...`);
  await db.insert(departmentRolesTable).values(departmentRoleData);

  console.log(`Successfully seeded ${roleData.length} roles.`);

  // Return the created roles for reference in other seeders
  return await db.select().from(rolesTable);
}
