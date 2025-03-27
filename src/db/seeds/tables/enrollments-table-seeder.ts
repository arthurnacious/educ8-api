import db from "@/db";
import { coursesTable, enrollmentsTable, usersTable } from "@/db/schema";
import { faker } from "@faker-js/faker";

interface SeederOptions {
  batch?: number;
  customFields?: Record<string, (index: number) => any>;
}

export async function enrollmentsTableSeeder(
  count: number,
  options: SeederOptions = {}
) {
  const { batch = 100, customFields = {} } = options;
  await db.delete(enrollmentsTable);
  console.log(
    `Seeding ${count} enrollments course associations in batches of ${batch}...`
  );

  const courses = await db.select().from(coursesTable);
  const users = await db.select().from(usersTable);

  if (courses.length === 0) {
    console.error("No courses found. Please seed courses first.");
    return;
  }

  if (users.length === 0) {
    console.error("No users found. Please seed users first.");
    return;
  }

  const courseIds = courses.map((course) => course.id);
  const userIds = users.map((user) => user.id);

  // Set to track unique combinations
  const usedCombinations = new Set();
  const generatedAssociations = [];

  // Generate unique combinations
  while (generatedAssociations.length < count) {
    const studentId = faker.helpers.arrayElement(userIds);
    const courseId = faker.helpers.arrayElement(courseIds);
    const combinationKey = `${studentId}-${courseId}`;

    // Skip if this combination already exists
    if (usedCombinations.has(combinationKey)) {
      continue;
    }

    // Add to tracking set
    usedCombinations.add(combinationKey);

    // Create the association
    generatedAssociations.push({
      studentId,
      courseId,
    });

    // If we've reached the maximum possible combinations, break
    if (usedCombinations.size === userIds.length * courseIds.length) {
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
    await db.insert(enrollmentsTable).values(associationBatch);
  }

  console.log(
    `Successfully seeded ${generatedAssociations.length} enrollments.`
  );
}
