import { lessonRostersTable, coursesTable, usersTable } from "@/db/schema";
import db from "@/db";
import { faker } from "@faker-js/faker";
import { slugify } from "@/utils";

interface SeederOptions {
  batch?: number;
  customFields?: Record<string, (index: number) => any>;
}

function getRandomWithinFixedPercentages(base: number): number {
  const percentages = [2, 3, 4, 5];
  const randomPercentage =
    percentages[Math.floor(Math.random() * percentages.length)];
  return Math.round(base * (1 + randomPercentage / 100));
}

export async function lessonRostersTableSeeder(
  count: number,
  options: SeederOptions = {}
) {
  const { batch = 50, customFields = {} } = options;
  await db.delete(lessonRostersTable);
  console.log(`Seeding lesson rosters in batches of ${batch}...`);

  const courses = await db.select().from(coursesTable);
  const users = await db.select().from(usersTable);
  if (courses.length === 0) {
    throw new Error("Ensure courses are seeded before seeding lesson rosters.");
  }
  if (users.length === 0) {
    throw new Error("Ensure users are seeded before seeding lesson rosters.");
  }

  for (const course of courses) {
    const totalLessonRosters = getRandomWithinFixedPercentages(count);
    console.log(
      `Generating ${totalLessonRosters} lesson rosters for course ${course.name}...`
    );

    for (let i = 0; i < totalLessonRosters; i += batch) {
      const batchSize = Math.min(batch, totalLessonRosters - i);
      const lessonRosters = Array.from({ length: batchSize }, (_, index) => {
        const actualIndex = i + index;
        const lecturer = faker.helpers.arrayElement(users);
        return {
          courseId: course.id,
          lecturerId: lecturer.id,
          slug: slugify(
            `${course.name} ${faker.lorem.slug()} ${faker.date.past()}`
          ),
          notes: customFields.notes?.(actualIndex) || faker.lorem.sentence(),
        };
      });

      console.log(
        `Inserting batch ${i / batch + 1} (${
          lessonRosters.length
        } lesson rosters for course ${course.name})...`
      );
      await db.insert(lessonRostersTable).values(lessonRosters);
    }
  }

  console.log(`Successfully seeded lesson rosters.`);
  return await db.select().from(lessonRostersTable);
}
