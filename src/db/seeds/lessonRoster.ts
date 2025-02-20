import { faker } from "@faker-js/faker";
import db from "..";
import { lessonRostersTable, usersTable } from "../schema";
import { userRole } from "@/types/roles";
import { eq } from "drizzle-orm";
import { slugify } from "@/utils";

export async function lessonRosterSeeder(count = 500) {
  console.log(`Starting lesson roster seeding (${count} records)...`);

  // Get all courses
  const courses = await db.query.coursesTable.findMany({
    columns: { id: true },
  });

  if (courses.length === 0) {
    console.log("No courses found. Please seed courses first.");
    return;
  }

  // Get staff users (as creators)
  const staffUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.role, userRole.STAFF));

  if (staffUsers.length === 0) {
    console.log("No staff users found. Please seed users first.");
    return;
  }

  console.log(
    `Found ${courses.length} courses and ${staffUsers.length} staff users for roster creation`
  );

  const lessonRosterData = [];

  // Generate lesson rosters
  for (let i = 0; i < count; i++) {
    const name = faker.string.alpha(10);

    lessonRosterData.push({
      id: crypto.randomUUID(),
      courseId: courses[Math.floor(Math.random() * courses.length)].id,
      creatorId: staffUsers[Math.floor(Math.random() * staffUsers.length)].id,
      name: name,
      slug: slugify(name + " " + i),
      notes: faker.lorem.sentence(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    });
  }

  // Insert in batches of 100
  const batchSize = 100;
  let totalInserted = 0;

  for (let i = 0; i < lessonRosterData.length; i += batchSize) {
    const batch = lessonRosterData.slice(i, i + batchSize);
    await db.insert(lessonRostersTable).values(batch);
    totalInserted += batch.length;
    console.log(
      `Batch inserted: ${batch.length} lesson rosters (Total: ${totalInserted}/${lessonRosterData.length})`
    );
  }

  console.log(
    `Seeding complete: ${totalInserted} lesson rosters inserted in batches`
  );
}
