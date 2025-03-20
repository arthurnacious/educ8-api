import { marksTable } from "@/db/schema";
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
  await db.delete(marksTable);
  console.log(`Seeding ${count} marks in batches of ${batch}...`);

  const fieldsList = await db.select().from(fields);
  const students = await db.select().from(usersTable);

  const fieldIds = fieldsList.map((field) => field.id);
  const studentIds = students.map((student) => student.id);

  if (fieldsList.length === 0 || students.length === 0) {
    throw new Error("Ensure fields and users are seeded before seeding marks.");
  }

  for (let i = 0; i < count; i += batch) {
    const batchSize = Math.min(batch, count - i);
    const marksData = Array.from({ length: batchSize }, () => {
      return {
        fieldId: faker.helpers.arrayElement(fieldIds),
        studentId: faker.helpers.arrayElement(studentIds),
        amount: (Math.floor(Math.random() * 100) + 1) as unknown as string,
      };
    });

    console.log(
      `Inserting batch ${i / batch + 1} (${marksData.length} marks)...`
    );
    await db.insert(marksTable).values(marksData);
  }

  console.log(`Successfully seeded ${count} marks.`);
  return await db.select().from(marksTable);
}
