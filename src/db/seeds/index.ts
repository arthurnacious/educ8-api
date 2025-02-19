import { coursesSeeder } from "./courses";
import { departmentsSeeder } from "./departments";
import { fieldsSeeder } from "./fields";
import { userSeeder } from "./users";

async function main() {
  const users = await userSeeder(1000);
  const departments = await departmentsSeeder(20);
  const courses = await coursesSeeder(100);
  const fields = await fieldsSeeder(100);
}

main();
