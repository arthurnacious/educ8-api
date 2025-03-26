import { attendanceTableSeeder } from "./tables/attendance-table-seeder";
import { auditLogsTableSeeder } from "./tables/audit-logs-table-seeder";
import { subjectsTableSeeder } from "./tables/subjects-table-seeder";
import { departmentsTableSeeder } from "./tables/departments-table-seeder";
import { fieldsTableSeeder } from "./tables/fields-table-seeder";
import { guardianDependantsSeeder } from "./tables/guardian-dependant";
import { lessonRostersTableSeeder } from "./tables/lesson-rosters-table-seeder";
import { marksTableSeeder } from "./tables/marks-table-seeder";
import { permissionsTableSeeder } from "./tables/permissions-table-seeder";
import { rolesTableSeeder } from "./tables/roles-table-seeder";
import { sessionsTableSeeder } from "./tables/sessions-table-seeder";
import { enrollmentsTableSeeder } from "./tables/enrollments-table-seeder";
import { userToDepartmentSeeder } from "./tables/user-to-department-seeder";
import { usersTableSeeder } from "./tables/users-table-seeder";

export interface SeedOptions {
  users?: number;
  guardianDependants?: number;
  permissions?: number;
  roles?: number;
  departments?: number;
  userToDepartments?: number;
  subjects?: number;
  fields?: number;
  lessonrosters?: number;
  sessions?: number;
  attendance?: number;
  studentToLesonRosters?: number;
  marks?: number;
  auditLogs?: number;
  batch?: number;
}

async function seed(options: SeedOptions = {}) {
  const {
    users = 0,
    guardianDependants = 0,
    permissions = 0,
    roles = 0,
    departments = 0,
    userToDepartments = 0,
    subjects = 0,
    fields = 0,
    lessonrosters = 0,
    sessions = 0,
    attendance = 0,
    studentToLesonRosters = 0,
    marks = 0,
    batch = 100,
  } = options;

  if (batch === 0) {
    throw new Error("Batch size cannot be 0");
  }

  console.time("Seeding database");

  // Seed users first (if requested)
  if (roles > 0) {
    console.log(`\n--- Seeding all roles ---`);
    await rolesTableSeeder();
  }

  if (users > 0) {
    console.log(`\n--- Seeding ${users} users ---`);
    await usersTableSeeder(users, { batch });
  }

  if (guardianDependants > 0) {
    console.log(`\n--- Seeding ${guardianDependants} guardianDependants ---`);
    await guardianDependantsSeeder(guardianDependants, { batch });
  }

  if (permissions > 0) {
    console.log(`\n--- Seeding ${permissions} permissions ---`);
    await permissionsTableSeeder(permissions, { batch });
  }

  if (departments > 0) {
    console.log(`\n--- Seeding ${departments} departments ---`);
    await departmentsTableSeeder(departments, { batch });
  }

  if (subjects > 0) {
    console.log(`\n--- Seeding ${subjects} subjects ---`);
    await subjectsTableSeeder(subjects, { batch });
  }

  if (userToDepartments > 0) {
    console.log(`\n--- Seeding ${userToDepartments} userToDepartments ---`);
    await userToDepartmentSeeder(userToDepartments, { batch });
  }

  if (fields > 0) {
    console.log(`\n--- Seeding ${fields} fields ---`);
    await fieldsTableSeeder(fields, { batch });
  }

  if (lessonrosters > 0) {
    console.log(`\n--- Seeding ${lessonrosters} lessonrosters ---`);
    await lessonRostersTableSeeder(lessonrosters, { batch });
  }

  if (sessions > 0) {
    console.log(`\n--- Seeding ${sessions} sessions ---`);
    await sessionsTableSeeder(sessions, { batch });
  }

  if (attendance > 0) {
    console.log(`\n--- Seeding ${attendance} attendance ---`);
    await attendanceTableSeeder(attendance, { batch });
  }

  if (studentToLesonRosters > 0) {
    console.log(
      `\n--- Seeding ${studentToLesonRosters} studentToLesonRosters ---`
    );
    await enrollmentsTableSeeder(studentToLesonRosters, { batch });
  }

  if (marks > 0) {
    console.log(`\n--- Seeding ${marks} marks ---`);
    await marksTableSeeder(marks, { batch });
  }

  if (auditLogs > 0) {
    console.log(`\n--- Seeding ${auditLogs} marks ---`);
    await auditLogsTableSeeder(auditLogs, { batch });
  }

  console.timeEnd("Seeding database");
}

const users = 10000;
const guardianDependants = users * 3;
const permissions = 100;
const roles = 10;
const departments = 50;
const userToDepartments = 100000;
const subjects = 1000;
const fields = 10;
const lessonrosters = 40;
const sessions = 30;
const attendance = 100;
const studentToLesonRosters = 300;
const marks = 100;
const auditLogs = 2000000;

async function main() {
  await seed({
    users,
    guardianDependants,
    permissions,
    roles,
    departments,
    userToDepartments,
    subjects,
    fields,
    lessonrosters,
    sessions,
    attendance,
    studentToLesonRosters,
    marks,
    auditLogs,
    batch: 1500,
  });
}

main().catch(console.error);
