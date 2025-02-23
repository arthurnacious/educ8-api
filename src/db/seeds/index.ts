import { attendanceSeeder } from "./attendance";
import { coursesSeeder } from "./courses";
import { coursesToDepartmentsSeeder } from "./coursesToDepartment";
import { departmentsSeeder } from "./departments";
import { departmentStaffSeeder } from "./departmentStaff";
import { fieldsSeeder } from "./fields";
import { lessonRosterSeeder } from "./lessonRoster";
import { marksSeeder } from "./marks";
import { privilegesSeeder } from "./privileges";
import { rolesSeeder } from "./roles";
import { sessionsSeeder } from "./sessions";
import { userSeeder } from "./users";

async function main() {
  await rolesSeeder();
  await userSeeder(1000);
  await privilegesSeeder(10);
  await departmentsSeeder(20);
  await coursesSeeder(100000);
  await fieldsSeeder(3);
  await lessonRosterSeeder(2000);
  await sessionsSeeder(500);

  await departmentStaffSeeder();

  await marksSeeder(1000);
  await attendanceSeeder(2000);
  await coursesToDepartmentsSeeder(300);
}

main();
