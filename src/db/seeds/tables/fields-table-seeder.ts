import db from "@/db";
import { coursesTable, fields } from "@/db/schema";

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

  for (let i = 0; i < count; i += batch) {
    const batchSize = Math.min(batch, count - i);
    const fieldData = Array.from({ length: batchSize }, (_, index) => {
      const actualIndex = i + index;

      // Assign to a random course
      const course = courses[Math.floor(Math.random() * courses.length)];

      // Generate field name
      const name =
        customFields.name?.(actualIndex) ||
        fieldNames[Math.floor(Math.random() * fieldNames.length)];

      return {
        courseId: customFields.courseId?.(actualIndex) || course.id,
        name,
      };
    });

    console.log(
      `Inserting batch ${i / batch + 1} (${fieldData.length} fields)...`
    );
    await db.insert(fields).values(fieldData);
  }

  console.log(`Successfully seeded ${count} fields.`);
  return await db.select().from(fields);
}
