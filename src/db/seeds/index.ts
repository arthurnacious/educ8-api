import { attendanceTableSeeder } from "./tables/attendance-table-seeder";
import { coursesTableSeeder } from "./tables/course-seeder-options";
import { coursesToDepartmentsSeeder } from "./tables/courses-to-departments-seeder";
import { departmentsTableSeeder } from "./tables/departments-table-seeder";
import { fieldsTableSeeder } from "./tables/fields-table-seeder";
import { lessonRostersTableSeeder } from "./tables/lesson-rosters-table-seeder";
import { marksTableSeeder } from "./tables/marks-table-seeder";
import { privilegesTableSeeder } from "./tables/privileges-table-seeder";
import { rolesTableSeeder } from "./tables/roles-table-seeder";
import { sessionsTableSeeder } from "./tables/sessions-table-seeder";
import { studentsToLessonRostersSeeder } from "./tables/students-to-lesson-rosters";
import { userToDepartmentSeeder } from "./tables/user-to-department-seeder";
import { usersTableSeeder } from "./tables/users-table-seeder";

interface SeedOptions {
  users?: number;
  privileges?: number;
  roles?: number;
  departments?: number;
  userToDepartments?: number;
  courses?: number;
  fields?: number;
  lessonrosters?: number;
  sessions?: number;
  attendance?: number;
  studentToLesonRosters?: number;
  marks?: number;
  batch?: number;
}

async function seed(options: SeedOptions = {}) {
  const {
    users = 0,
    privileges = 0,
    roles = 0,
    departments = 0,
    userToDepartments = 0,
    courses = 0,
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

  if (departments > 0) {
    console.log(`\n--- Seeding ${departments} departments ---`);
    await departmentsTableSeeder(departments, { batch });
  }

  if (courses > 0) {
    console.log(`\n--- Seeding ${courses} courses ---`);
    await coursesTableSeeder(courses, { batch });
  }

  if (userToDepartments > 0) {
    console.log(`\n--- Seeding ${userToDepartments} userToDepartments ---`);
    await userToDepartmentSeeder(userToDepartments, { batch });
  }

  if (privileges > 0) {
    console.log(`\n--- Seeding ${privileges} privileges ---`);
    await privilegesTableSeeder(privileges, { batch });
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
    await studentsToLessonRostersSeeder(studentToLesonRosters, { batch });
  }

  if (marks > 0) {
    console.log(`\n--- Seeding ${marks} marks ---`);
    await marksTableSeeder(marks, { batch });
  }

  console.timeEnd("Seeding database");
}

// Example usage
async function main() {
  await seed({
    users: 100,
    departments: 20,
    userToDepartments: 50,
    courses: 30000,
    fields: 3,
    lessonrosters: 10,
    sessions: 10,
    attendance: 100,
    studentToLesonRosters: 300,
    marks: 100,
    batch: 300,
  });
}

main().catch(console.error);
