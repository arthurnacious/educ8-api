import db from "@/db";
import {
  lessonRostersTable,
  studentsToLessonRosters,
  usersTable,
} from "@/db/schema";
import { faker } from "@faker-js/faker";

interface SeederOptions {
  batch?: number;
  customFields?: Record<string, (index: number) => any>;
}

export async function studentsToLessonRostersSeeder(
  count: number,
  options: SeederOptions = {}
) {
  const { batch = 100, customFields = {} } = options;
  await db.delete(studentsToLessonRosters);
  console.log(
    `Seeding ${count} student-lesson roster associations in batches of ${batch}...`
  );
  const lessonRosters = await db.select().from(lessonRostersTable);
  const users = await db.select().from(usersTable);

  const lessonRosterIds = lessonRosters.map((lessonRoster) => lessonRoster.id);
  const userIds = users.map((user) => user.id);

  for (let i = 0; i < count; i += batch) {
    const batchSize = Math.min(batch, count - i);
    const associationData = Array.from({ length: batchSize }, (_, index) => {
      return {
        studentId: faker.helpers.arrayElement(userIds),
        lessonRosterId: faker.helpers.arrayElement(lessonRosterIds),
      };
    });

    console.log(
      `Inserting batch ${i / batch + 1} (${
        associationData.length
      } associations)...`
    );
    await db.insert(studentsToLessonRosters).values(associationData);
  }

  console.log(
    `Successfully seeded ${count} student-lesson roster associations.`
  );
}
