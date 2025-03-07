import { marks } from "@/db/schema";
import { usersTable, fields } from "@/db/schema";
import db from "@/db";
import { faker } from "@faker-js/faker";

interface SeederOptions {
  batch?: number;
  customFields?: Record<string, (index: number) => any>;
}

export async function marksTableSeeder(
  count: number,
  options: SeederOptions = {}
) {
  const { batch = 50, customFields = {} } = options;
  await db.delete(marks);
  console.log(`Seeding ${count} marks in batches of ${batch}...`);

  const fieldsList = await db.select().from(fields);
  const students = await db.select().from(usersTable);
  if (fieldsList.length === 0 || students.length === 0) {
    throw new Error("Ensure fields and users are seeded before seeding marks.");
  }

  for (let i = 0; i < count; i += batch) {
    const batchSize = Math.min(batch, count - i);
    const marksData = Array.from({ length: batchSize }, (_, index) => {
      const actualIndex = i + index;
      return {
        fieldId:
          customFields.fieldId?.(actualIndex) ||
          fieldsList[Math.floor(Math.random() * fieldsList.length)].id,
        studentId:
          customFields.studentId?.(actualIndex) ||
          students[Math.floor(Math.random() * students.length)].id,
        amount:
          customFields.amount?.(actualIndex) ||
          faker.number.float({ min: 0, max: 100, fractionDigits: 0.01 }),
      };
    });

    console.log(
      `Inserting batch ${i / batch + 1} (${marksData.length} marks)...`
    );
    await db.insert(marks).values(marksData);
  }

  console.log(`Successfully seeded ${count} marks.`);
  return await db.select().from(marks);
}
