import { faker } from "@faker-js/faker";
import db from "..";
import { eq } from "drizzle-orm";
import { userToDepartment, usersTable } from "../schema";
import { userRole, departmentUserRole } from "@/types/roles";

export async function departmentStaffSeeder() {
  console.log("Starting department staff seeding...");

  // Clear existing assignments
  await db.delete(userToDepartment);

  // Get all departments
  const departments = await db.query.departmentsTable.findMany({
    columns: { id: true },
  });

  if (departments.length === 0) {
    console.log("No departments found. Please seed departments first.");
    return;
  }

  // Get all staff users
  const staffUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.role, userRole.STAFF))
    .limit(20);

  if (staffUsers.length === 0) {
    console.log("No staff users found. Please seed users first.");
    return;
  }

  console.log(
    `Found ${departments.length} departments and ${staffUsers.length} staff users`
  );

  const departmentStaffData = [];

  // Ensure each department has a leader
  for (const department of departments) {
    const leaderIndex = Math.floor(Math.random() * staffUsers.length);
    departmentStaffData.push({
      userId: staffUsers[leaderIndex].id,
      departmentId: department.id,
      role: departmentUserRole.DEPARTMENTLEADER,
    });
  }

  // Assign lecturers (each staff can be in 1-3 departments)
  for (const staff of staffUsers) {
    if (
      departmentStaffData.some(
        (ds) =>
          ds.userId === staff.id &&
          ds.role === departmentUserRole.DEPARTMENTLEADER
      )
    ) {
      continue;
    }

    const assignmentCount = Math.floor(Math.random() * 3) + 1;
    const shuffledDeptIds = [...departments]
      .sort(() => 0.5 - Math.random())
      .map((dept) => dept.id);

    for (
      let i = 0;
      i < Math.min(assignmentCount, shuffledDeptIds.length);
      i++
    ) {
      departmentStaffData.push({
        userId: staff.id,
        departmentId: shuffledDeptIds[i],
        role: departmentUserRole.LECTURER,
      });
    }
  }

  // Insert in batches of 100
  const batchSize = 300;
  let totalInserted = 0;

  for (let i = 0; i < departmentStaffData.length; i += batchSize) {
    const batch = departmentStaffData.slice(i, i + batchSize);
    await db.insert(userToDepartment).values(batch);
    totalInserted += batch.length;
    console.log(
      `Batch inserted: ${batch.length} assignments (Total: ${totalInserted}/${departmentStaffData.length})`
    );
  }

  console.log(
    `Seeding complete: ${totalInserted} department-staff assignments inserted in batches`
  );
}
