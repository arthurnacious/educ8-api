import { marksTable } from "@/db/schema";
import { usersTable } from "@/db/schema";
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
  const { batch = 50 } = options;
  await db.delete(marksTable);
  console.log(`Seeding ${count} marks in batches of ${batch}...`);

  // Fetch lesson rosters with fields
  const lessonRosters = await db.query.lessonRostersTable.findMany({
    columns: { id: true },
    with: {
      subject: {
        columns: {},
        with: {
          fields: { columns: { name: true, passRate: true } },
        },
      },
    },
  });

  // Fetch students once
  const students = await db.select().from(usersTable).limit(20);
  if (!lessonRosters.length || !students.length) {
    console.error(
      "Error: Ensure fields and users are seeded before seeding marks."
    );
    throw new Error("Missing required lesson rosters or students.");
  }

  for (let i = 0; i < count; i += batch) {
    const batchSize = Math.min(batch, count - i);
    const marksData: any[] = [];

    for (const lessonRoster of lessonRosters) {
      if (!lessonRoster.subject?.fields?.length) {
        console.warn(
          `Skipping lessonRosterId ${lessonRoster.id} due to missing fields.`
        );
        continue;
      }

      for (const field of lessonRoster.subject.fields) {
        for (const student of students.slice(0, batchSize)) {
          marksData.push({
            lessonRosterId: lessonRoster.id,
            name: field.name,
            passRate: field.passRate,
            studentId: student.id,
            amount: String(faker.number.int({ min: 1, max: 100 })), // Generate per student
          });

          // Prevent exceeding max call stack
          if (marksData.length >= batch) {
            console.log(`Inserting batch (${marksData.length} marks)...`);
            await db.insert(marksTable).values(marksData);
            marksData.length = 0; // Clear the array after insertion
          }
        }
      }
    }

    // Insert any remaining data
    if (marksData.length > 0) {
      console.log(`Inserting final batch (${marksData.length} marks)...`);
      await db.insert(marksTable).values(marksData);
    }
  }

  console.log(`Successfully seeded ${count} marks.`);
  return await db.select().from(marksTable);
}
