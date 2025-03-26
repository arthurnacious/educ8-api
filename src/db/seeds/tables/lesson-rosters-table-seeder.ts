import { lessonRostersTable, subjectsTable, usersTable } from "@/db/schema";
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

  const subjects = await db.select().from(subjectsTable);
  const users = await db.select().from(usersTable);
  if (subjects.length === 0) {
    throw new Error(
      "Ensure subjects are seeded before seeding lesson rosters."
    );
  }
  if (users.length === 0) {
    throw new Error("Ensure users are seeded before seeding lesson rosters.");
  }

  for (const subject of subjects) {
    const totalLessonRosters = getRandomWithinFixedPercentages(count);
    console.log(
      `Generating ${totalLessonRosters} lesson rosters for subject ${subject.name}...`
    );

    for (let i = 0; i < totalLessonRosters; i += batch) {
      const batchSize = Math.min(batch, totalLessonRosters - i);
      const lessonRosters = Array.from({ length: batchSize }, (_, index) => {
        const actualIndex = i + index;
        const lecturer = faker.helpers.arrayElement(users);
        return {
          subjectId: subject.id,
          lecturerId: lecturer.id,
          effectiveSubjectPrice: subject.price,
          slug: slugify(
            `${subject.name} ${faker.lorem.slug()} ${faker.date.past()}`
          ),
          notes: customFields.notes?.(actualIndex) || faker.lorem.sentence(),
        };
      });

      console.log(
        `Inserting batch ${i / batch + 1} (${
          lessonRosters.length
        } lesson rosters for subject ${subject.name})...`
      );
      await db.insert(lessonRostersTable).values(lessonRosters);
    }
  }

  console.log(`Successfully seeded lesson rosters.`);
  return await db.select().from(lessonRostersTable);
}
