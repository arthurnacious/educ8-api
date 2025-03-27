import { coursesTable, sessionsTable } from "@/db/schema";
import db from "@/db";
import { faker } from "@faker-js/faker";

interface SeederOptions {
  batch?: number;
  customFields?: Record<string, (index: number) => any>;
}

export async function sessionsTableSeeder(
  count: number,
  options: SeederOptions = {}
) {
  const { batch = 100, customFields = {} } = options;
  await db.delete(sessionsTable);
  console.log(`Seeding ${count} sessions in batches of ${batch}...`);

  const curses = await db.select().from(coursesTable);

  const courseIds = curses.map((course) => course.id);

  for (let i = 0; i < count; i += batch) {
    const batchSize = Math.min(batch, count - i);
    const sessionData = Array.from({ length: batchSize }, (_, index) => {
      return {
        courseId: faker.helpers.arrayElement(courseIds),
        name: customFields.name?.(index) || faker.lorem.words(3),
      };
    });

    console.log(
      `Inserting batch ${i / batch + 1} (${sessionData.length} sessions)...`
    );
    await db.insert(sessionsTable).values(sessionData);
  }

  console.log(`Successfully seeded ${count} sessions.`);
}
