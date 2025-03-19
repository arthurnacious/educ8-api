import db from "@/db";
import {
  departmentRolesTable,
  departmentsTable,
  usersTable,
  userToDepartmentsTable,
} from "@/db/schema";
import { faker } from "@faker-js/faker";

interface SeederOptions {
  batch?: number;
  customFields?: Record<string, (index: number) => any>;
}

export async function userToDepartmentSeeder(
  count: number,
  options: SeederOptions = {}
) {
  const { batch = 100, customFields = {} } = options;
  await db.delete(userToDepartmentsTable);
  console.log(
    `Seeding ${count} user-department associations in batches of ${batch}...`
  );

  const departments = await db.select().from(departmentsTable);
  const users = await db.select().from(usersTable);
  const roles = await db.select().from(departmentRolesTable);

  if (departments.length === 0) {
    console.error("No departments found. Please seed departments first.");
    return;
  }

  if (users.length === 0) {
    console.error("No users found. Please seed users first.");
    return;
  }

  const departmentIds = departments.map(({ id }) => id);
  const userIds = users.map(({ id }) => id);
  const roleIds = roles.map(({ id }) => id);

  // Set to track unique combinations
  const usedCombinations = new Set();
  const generatedAssociations = [];

  // Generate unique combinations
  while (generatedAssociations.length < count) {
    const departmentId = faker.helpers.arrayElement(departmentIds);
    const userId = faker.helpers.arrayElement(userIds);
    const combinationKey = `${departmentId}-${userId}`;

    // Skip if this combination already exists
    if (usedCombinations.has(combinationKey)) {
      continue;
    }

    // Add to tracking set
    usedCombinations.add(combinationKey);

    // Create the association
    generatedAssociations.push({
      departmentId,
      userId,
      departmentRoleId: faker.helpers.arrayElement(roleIds),
    });

    // If we've reached the maximum possible combinations, break
    if (usedCombinations.size === departmentIds.length * userIds.length) {
      console.log(
        `Maximum possible combinations reached: ${usedCombinations.size}`
      );
      break;
    }
  }

  // Insert in batches
  for (let i = 0; i < generatedAssociations.length; i += batch) {
    const associationBatch = generatedAssociations.slice(i, i + batch);
    console.log(
      `Inserting batch ${Math.floor(i / batch) + 1} (${
        associationBatch.length
      } associations)...`
    );
    await db.insert(userToDepartmentsTable).values(associationBatch);
  }

  console.log(
    `Successfully seeded ${generatedAssociations.length} user-department associations.`
  );
}
