import { coursesSeeder } from "./courses";
import { departmentsSeeder } from "./departments";
import { userSeeder } from "./users";

async function main() {
  const users = await userSeeder(2000);
  const departments = await departmentsSeeder(20);
  const courses = await coursesSeeder(200);
}

main();
