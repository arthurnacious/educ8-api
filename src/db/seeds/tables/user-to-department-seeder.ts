import db from "@/db";
import { departmentsTable, usersTable, userToDepartment } from "@/db/schema";
import { departmentUserRole } from "@/types/roles";
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
  await db.delete(userToDepartment);
  console.log(
    `Seeding ${count} user-department associations in batches of ${batch}...`
  );

  const departments = await db.select().from(departmentsTable);
  const users = await db.select().from(usersTable);
  if (departments.length === 0) {
    console.error("No departments found Please seed departments first.");
    return;
  }
  if (users.length === 0) {
    console.error("No users found. Please seed users first.");
    return;
  }
  const departmentIds = departments.map((department) => department.id);

  const userIds = users.map((user) => user.id);

  for (let i = 0; i < count; i += batch) {
    const batchSize = Math.min(batch, count - i);
    const associationData = Array.from({ length: batchSize }, (_, index) => {
      return {
        departmentId: faker.helpers.arrayElement(departmentIds),
        userId: faker.helpers.arrayElement(userIds),
        role: faker.helpers.arrayElement(Object.values(departmentUserRole)),
      };
    });

    console.log(
      `Inserting batch ${i / batch + 1} (${
        associationData.length
      } associations)...`
    );
    await db.insert(userToDepartment).values(associationData);
  }

  console.log(`Successfully seeded ${count} user-department associations.`);
}
