import db from "@/db";
import { userToDepartment } from "@/db/schema";
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

  for (let i = 0; i < count; i += batch) {
    const batchSize = Math.min(batch, count - i);
    const associationData = Array.from({ length: batchSize }, (_, index) => {
      return {
        departmentId: customFields.departmentId?.(index) || faker.string.uuid(),
        userId: customFields.userId?.(index) || faker.string.uuid(),
        role: customFields.role?.(index) || "member",
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
