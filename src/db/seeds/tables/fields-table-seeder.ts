import db from "@/db";
import { subjectsTable, fields } from "@/db/schema";
import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";

interface FieldSeederOptions {
  batch?: number;
  customFields?: Record<string, (index: number) => any>;
}

export async function fieldsTableSeeder(
  count: number,
  options: FieldSeederOptions = {}
) {
  const { batch = 100, customFields = {} } = options;
  await db.delete(fields);
  console.log(`Seeding ${count} fields in batches of ${batch}...`);

  // Get all subjects
  const subjects = await db.select().from(subjectsTable);
  if (subjects.length === 0) {
    console.error("No subjects found. Please seed subjects first.");
    return;
  }

  // Sample field names
  const fieldNames = [
    "Midterm Exam",
    "Final Exam",
    "Project",
    "Participation",
    "Quiz 1",
    "Quiz 2",
    "Assignment 1",
    "Assignment 2",
    "Presentation",
    "Research Paper",
    "Lab Report",
    "Group Work",
    "Practical Assessment",
    "Homework",
    "Attendance",
  ];

  // Distribute count across subjects with ±5% variance
  let totalSeeded = 0;
  const subjectFieldCounts = subjects.map((subject) => {
    const baseCount = Math.round(count / subjects.length);
    const variation = Math.max(1, Math.round(baseCount * 0.05)); // At least 1
    const finalCount = faker.number.int({
      min: Math.max(1, baseCount - variation),
      max: baseCount + variation,
    });
    totalSeeded += finalCount;
    return { subject, finalCount };
  });

  console.log(`Total fields to be seeded (after ±5% variance): ${totalSeeded}`);

  for (const { subject, finalCount } of subjectFieldCounts) {
    for (let i = 0; i < finalCount; i += batch) {
      const batchSize = Math.min(batch, finalCount - i);
      const fieldData = Array.from({ length: batchSize }, () => ({
        subjectId: subject.id,
        passRate: faker.number.int({ min: 50, max: 100 }).toString(),
        name: faker.helpers.arrayElement(fieldNames),
      }));

      console.log(
        `Inserting ${batchSize} fields for subject ${subject.id} (Total for subject: ${finalCount})...`
      );
      //update lastFieldAddedAt for subject
      await db
        .update(subjectsTable)
        .set({ lastFieldAddedAt: new Date() })
        .where(eq(subjectsTable.id, subject.id));
      await db.insert(fields).values(fieldData);
    }
  }

  console.log(`Successfully seeded ~${totalSeeded} fields.`);
  return await db.select().from(fields);
}
