import { departmentsSeeder } from "./departments";
import { userSeeder } from "./users";

async function main() {
  const users = await userSeeder(1000);
  const departments = await departmentsSeeder(20);
}

main();
