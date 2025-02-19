import { faker } from "@faker-js/faker";
import db from "..";
import { fields, coursesTable } from "../schema";

export async function fieldsSeeder(fieldsPerCourse: number) {
  await db.delete(fields);

  // Get all course IDs
  const courses = await db.select({ id: coursesTable.id }).from(coursesTable);

  if (courses.length === 0) {
    console.log("No courses found. Please seed courses first.");
    return;
  }

  const fieldsData = [];

  // Create fields for each course
  for (const course of courses) {
    // Generate unique field names for this course
    const usedNames = new Set<string>();

    for (let i = 0; i < fieldsPerCourse; i++) {
      let fieldName = faker.word.noun() + " " + faker.word.adjective();
      let attempts = 0;

      // Ensure name uniqueness within this course
      while (usedNames.has(fieldName) && attempts < 5) {
        fieldName = faker.word.noun() + " " + faker.word.adjective();
        attempts++;
      }

      // If still not unique, add a counter
      if (usedNames.has(fieldName)) {
        fieldName = `${fieldName} ${i}`;
      }

      usedNames.add(fieldName);

      fieldsData.push({
        courseId: course.id,
        name: fieldName,
      });
    }
  }

  // Insert all fields
  const result = await db.insert(fields).values(fieldsData).returning();
  console.log(`${result.length} new fields seeded!`);
}
