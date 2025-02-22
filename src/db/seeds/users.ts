import { faker } from "@faker-js/faker";
import db from "..";
import { usersTable } from "../schema";
import { userRole } from "@/types/roles";

export async function userSeeder(length: number) {
  await db.delete(usersTable);

  const batchSize = 1000;
  let totalInserted = 0;

  while (totalInserted < length) {
    // Calculate current batch size
    const currentBatchSize = Math.min(batchSize, length - totalInserted);

    // Generate batch of users
    const users = Array.from({ length: currentBatchSize }, (_, idx) => ({
      name: faker.person.fullName(),
      email: totalInserted + idx + faker.internet.email(),
      emailVerified: faker.date.recent(),
      passwordHash: faker.internet.password(),
      role: faker.helpers.arrayElement([
        ...Object.values(userRole),
        userRole.STUDENT,
        userRole.STUDENT,
      ]),
      image: faker.image.avatar(),
    }));

    // Insert current batch
    await db.insert(usersTable).values(users);

    totalInserted += currentBatchSize;
    console.log(
      `Batch inserted: ${currentBatchSize} users (Total: ${totalInserted}/${length})`
    );
  }

  console.log(
    `Seeding complete: ${totalInserted} users inserted in batches of ${batchSize}`
  );
}
