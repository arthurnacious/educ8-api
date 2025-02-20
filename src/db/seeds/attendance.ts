import { AttendanceName } from "@/types/attendance";
import { attendanceTable, usersTable } from "../schema";
import { userRole } from "@/types/roles";
import { eq } from "drizzle-orm";
import db from "..";

export async function attendanceSeeder(count = 2000) {
  console.log(`Starting attendance seeding (${count} records)...`);

  // Get all sessions (periods)
  const sessions = await db.query.sessionsTable.findMany({
    columns: { id: true },
  });

  if (sessions.length === 0) {
    console.log("No sessions found. Please seed sessions first.");
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
    `Found ${sessions.length} sessions and ${students.length} students for attendance creation`
  );

  const attendanceData = [];
  const attendanceTypes = [
    AttendanceName.PRESENT,
    AttendanceName.ABSENT,
    AttendanceName.LATE,
  ];

  // Generate attendance records
  for (let i = 0; i < count; i++) {
    attendanceData.push({
      id: crypto.randomUUID(),
      studentId: students[Math.floor(Math.random() * students.length)].id,
      periodId: sessions[Math.floor(Math.random() * sessions.length)].id,
      type: attendanceTypes[Math.floor(Math.random() * attendanceTypes.length)],
    });
  }

  // Insert in batches of 100
  const batchSize = 100;
  let totalInserted = 0;

  for (let i = 0; i < attendanceData.length; i += batchSize) {
    const batch = attendanceData.slice(i, i + batchSize);
    await db.insert(attendanceTable).values(batch);
    totalInserted += batch.length;
    console.log(
      `Batch inserted: ${batch.length} attendance records (Total: ${totalInserted}/${attendanceData.length})`
    );
  }

  console.log(
    `Seeding complete: ${totalInserted} attendance records inserted in batches`
  );
}
