import { faker } from "@faker-js/faker";
import { sessionsTable } from "../schema";
import db from "..";

export async function sessionsSeeder(count = 500) {
  console.log(`Starting sessions seeding (${count} records)...`);

  // Get all lesson rosters
  const lessonRosters = await db.query.lessonRostersTable.findMany({
    columns: { id: true },
  });

  if (lessonRosters.length === 0) {
    console.log("No lesson rosters found. Please seed lesson rosters first.");
    return;
  }

  console.log(
    `Found ${lessonRosters.length} lesson rosters for session creation`
  );

  const sessionsData = [];

  // Generate session records
  for (let i = 0; i < count; i++) {
    sessionsData.push({
      id: crypto.randomUUID(),
      lessonRosterId:
        lessonRosters[Math.floor(Math.random() * lessonRosters.length)].id,
      name: `Session ${faker.string.alphanumeric(4)}`,
    });
  }

  // Insert in batches of 100
  const batchSize = 100;
  let totalInserted = 0;

  for (let i = 0; i < sessionsData.length; i += batchSize) {
    const batch = sessionsData.slice(i, i + batchSize);
    await db.insert(sessionsTable).values(batch);
    totalInserted += batch.length;
    console.log(
      `Batch inserted: ${batch.length} sessions (Total: ${totalInserted}/${sessionsData.length})`
    );
  }

  console.log(
    `Seeding complete: ${totalInserted} sessions inserted in batches`
  );
}
