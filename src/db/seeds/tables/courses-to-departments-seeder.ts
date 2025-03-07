import {
  coursesTable,
  coursesToDepartments,
  departmentsTable,
} from "@/db/schema";
import db from "@/db";
import { faker } from "@faker-js/faker";

interface SeederOptions {
  batch?: number;
  customFields?: Record<string, (index: number) => any>;
}

export async function coursesToDepartmentsSeeder(
  count: number,
  options: SeederOptions = {}
) {
  const { batch = 100, customFields = {} } = options;
  await db.delete(coursesToDepartments);
  console.log(
    `Seeding ${count} course-department associations in batches of ${batch}...`
  );

  const courses = await db.select().from(coursesTable);
  const departments = await db.select().from(departmentsTable);

  const courseIds = courses.map((course) => course.id);
  const departmentIds = departments.map((department) => department.id);

  for (let i = 0; i < count; i += batch) {
    const batchSize = Math.min(batch, count - i);
    const associationData = Array.from({ length: batchSize }, (_, index) => {
      return {
        courseId: faker.helpers.arrayElement(courseIds),
        departmentId: faker.helpers.arrayElement(departmentIds),
      };
    });

    console.log(
      `Inserting batch ${i / batch + 1} (${
        associationData.length
      } associations)...`
    );
    await db.insert(coursesToDepartments).values(associationData);
  }

  console.log(`Successfully seeded ${count} course-department associations.`);
}
