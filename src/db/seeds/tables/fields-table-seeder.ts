import db from "@/db";
import { coursesTable, fields } from "@/db/schema";
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

  // Get all courses
  const courses = await db.select().from(coursesTable);
  if (courses.length === 0) {
    console.error("No courses found. Please seed courses first.");
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

  // Distribute count across courses with ±5% variance
  let totalSeeded = 0;
  const courseFieldCounts = courses.map((course) => {
    const baseCount = Math.round(count / courses.length);
    const variation = Math.max(1, Math.round(baseCount * 0.05)); // At least 1
    const finalCount = faker.number.int({
      min: Math.max(1, baseCount - variation),
      max: baseCount + variation,
    });
    totalSeeded += finalCount;
    return { course, finalCount };
  });

  console.log(`Total fields to be seeded (after ±5% variance): ${totalSeeded}`);

  for (const { course, finalCount } of courseFieldCounts) {
    for (let i = 0; i < finalCount; i += batch) {
      const batchSize = Math.min(batch, finalCount - i);
      const fieldData = Array.from({ length: batchSize }, () => ({
        courseId: course.id,
        passRate: faker.number.int({ min: 50, max: 100 }).toString(),
        name: faker.helpers.arrayElement(fieldNames),
      }));

      console.log(
        `Inserting ${batchSize} fields for course ${course.id} (Total for course: ${finalCount})...`
      );
      //update lastFieldAddedAt for course
      await db
        .update(coursesTable)
        .set({ lastFieldAddedAt: new Date() })
        .where(eq(coursesTable.id, course.id));
      await db.insert(fields).values(fieldData);
    }
  }

  console.log(`Successfully seeded ~${totalSeeded} fields.`);
  return await db.select().from(fields);
}
