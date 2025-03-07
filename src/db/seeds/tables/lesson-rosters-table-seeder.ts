import { lessonRostersTable } from "@/db/schema";
import { coursesTable, usersTable } from "@/db/schema";
import db from "@/db";
import { faker } from "@faker-js/faker";

interface SeederOptions {
  batch?: number;
  customFields?: Record<string, (index: number) => any>;
}

export async function lessonRostersTableSeeder(
  count: number,
  options: SeederOptions = {}
) {
  const { batch = 50, customFields = {} } = options;
  await db.delete(lessonRostersTable);
  console.log(`Seeding ${count} lesson rosters in batches of ${batch}...`);

  const courses = await db.select().from(coursesTable);
  const users = await db.select().from(usersTable);
  if (courses.length === 0) {
    throw new Error("Ensure courses are seeded before seeding lesson rosters.");
  }

  if (users.length === 0) {
    throw new Error("Ensure users are seeded before seeding lesson rosters.");
  }

  for (let i = 0; i < count; i += batch) {
    const batchSize = Math.min(batch, count - i);
    const lessonRosters = Array.from({ length: batchSize }, (_, index) => {
      const actualIndex = i + index;
      return {
        courseId:
          customFields.courseId?.(actualIndex) ||
          courses[Math.floor(Math.random() * courses.length)].id,
        creatorId:
          customFields.creatorId?.(actualIndex) ||
          users[Math.floor(Math.random() * users.length)].id,
        name: customFields.name?.(actualIndex) || faker.lorem.words(3),
        slug: customFields.slug?.(actualIndex) || faker.lorem.slug(),
        notes: customFields.notes?.(actualIndex) || faker.lorem.sentence(),
      };
    });

    console.log(
      `Inserting batch ${i / batch + 1} (${
        lessonRosters.length
      } lesson rosters)...`
    );
    await db.insert(lessonRostersTable).values(lessonRosters);
  }

  console.log(`Successfully seeded ${count} lesson rosters.`);
  return await db.select().from(lessonRostersTable);
}
