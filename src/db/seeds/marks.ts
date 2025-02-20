import { faker } from "@faker-js/faker";
import db from "..";
import { eq } from "drizzle-orm";
import { marks, usersTable } from "../schema";
import { userRole } from "@/types/roles";

// Marks Seeder
export async function marksSeeder(count = 1000) {
  console.log(`Starting marks seeding (${count} records)...`);

  // Get all fields
  const allFields = await db.query.fields.findMany({
    columns: { id: true },
  });

  if (allFields.length === 0) {
    console.log("No fields found. Please seed fields first.");
    return;
  }

  // Get all student users
  const students = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.role, userRole.STUDENT));

  if (students.length === 0) {
    console.log("No student users found. Please seed users first.");
    return;
  }

  console.log(
    `Found ${allFields.length} fields and ${students.length} students for marks creation`
  );

  const marksData = [];

  // Generate marks records
  for (let i = 0; i < count; i++) {
    marksData.push({
      id: crypto.randomUUID(),
      fieldId: allFields[Math.floor(Math.random() * allFields.length)].id,
      studentId: students[Math.floor(Math.random() * students.length)].id,
      amount: faker.number.float({ min: 0, max: 100, precision: 0.01 }),
    });
  }

  // Insert in batches of 100
  const batchSize = 100;
  let totalInserted = 0;

  for (let i = 0; i < marksData.length; i += batchSize) {
    const batch = marksData.slice(i, i + batchSize);
    await db.insert(marks).values(batch);
    totalInserted += batch.length;
    console.log(
      `Batch inserted: ${batch.length} marks (Total: ${totalInserted}/${marksData.length})`
    );
  }

  console.log(`Seeding complete: ${totalInserted} marks inserted in batches`);
}
