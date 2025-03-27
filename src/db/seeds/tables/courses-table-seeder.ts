import { coursesTable, subjectsTable, usersTable } from "@/db/schema";
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

export async function coursesTableSeeder(
  count: number,
  options: SeederOptions = {}
) {
  const { batch = 50, customFields = {} } = options;
  await db.delete(coursesTable);
  console.log(`Seeding courses in batches of ${batch}...`);

  const subjects = await db.select().from(subjectsTable);
  const users = await db.select().from(usersTable);
  if (subjects.length === 0) {
    throw new Error("Ensure subjects are seeded before seeding courses.");
  }
  if (users.length === 0) {
    throw new Error("Ensure users are seeded before seeding courses.");
  }

  for (const subject of subjects) {
    const totalCourses = getRandomWithinFixedPercentages(count);
    console.log(
      `Generating ${totalCourses} courses for subject ${subject.name}...`
    );

    for (let i = 0; i < totalCourses; i += batch) {
      const batchSize = Math.min(batch, totalCourses - i);
      const Courses = Array.from({ length: batchSize }, (_, index) => {
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
          Courses.length
        } courses for subject ${subject.name})...`
      );
      await db.insert(coursesTable).values(Courses);
    }
  }

  console.log(`Successfully seeded courses.`);
  return await db.select().from(coursesTable);
}
