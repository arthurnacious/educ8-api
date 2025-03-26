import { sessionsTable, attendanceTable, usersTable } from "@/db/schema";
import db from "@/db";
import { fa, faker } from "@faker-js/faker";
import { AttendanceName } from "@/types/attendance";

interface SeederOptions {
  batch?: number;
  customFields?: Record<string, (index: number) => any>;
}

export async function attendanceTableSeeder(
  count: number,
  options: SeederOptions = {}
) {
  const { batch = 100, customFields = {} } = options;
  await db.delete(attendanceTable);
  console.log(`Seeding ${count} attendance records in batches of ${batch}...`);

  const users = await db.select().from(usersTable);
  const periods = await db.select().from(sessionsTable);

  const userIds = users.map((user) => user.id);
  const periodIds = periods.map((period) => period.id);

  for (let i = 0; i < count; i += batch) {
    const batchSize = Math.min(batch, count - i);
    const attendanceData = Array.from({ length: batchSize }, (_, index) => {
      return {
        studentId: faker.helpers.arrayElement(userIds),
        periodId: faker.helpers.arrayElement(periodIds),
        type: faker.helpers.arrayElement(Object.values(AttendanceName)),
      };
    });

    console.log(
      `Inserting batch ${i / batch + 1} (${
        attendanceData.length
      } attendance records)...`
    );
    await db.insert(attendanceTable).values(attendanceData);
  }

  console.log(`Successfully seeded ${count} attendance records.`);
}
