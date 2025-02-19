import { departmentsSeeder } from "./departments";

async function main() {
  // const users = await userSeeder(100);
  const departments = await departmentsSeeder(20);

  console.log({ departments });
}

main();
