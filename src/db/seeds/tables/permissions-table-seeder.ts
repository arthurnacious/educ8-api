import {
  userPermissionsTable,
  rolePermissionsTable,
  departmentRolePermissionsTable,
  usersTable,
  rolesTable,
  departmentRolesTable,
} from "@/db/schema";
import db from "@/db";
import { faker } from "@faker-js/faker";

interface PermissionsSeederOptions {
  batch?: number;
}

export async function permissionsTableSeeder(
  count: number,
  options: PermissionsSeederOptions = {}
) {
  const { batch = 100 } = options;

  await db.delete(userPermissionsTable);
  await db.delete(rolePermissionsTable);
  await db.delete(departmentRolePermissionsTable);
  console.log(`Seeding ${count} permissions in batches of ${batch}...`);

  // Fetch existing users, roles, and department roles
  const users = await db.select().from(usersTable);
  const roles = await db.select().from(rolesTable);
  const departmentRoles = await db.select().from(departmentRolesTable);

  for (let i = 0; i < count; i += batch) {
    const batchSize = Math.min(batch, count - i);

    const userPermissions = Array.from({ length: batchSize }, () => ({
      userId: users[Math.floor(Math.random() * users.length)]?.id,
      name: faker.lorem.word(),
    })).filter((p) => p.userId);

    const rolePermissions = Array.from({ length: batchSize }, () => ({
      roleId: roles[Math.floor(Math.random() * roles.length)]?.id,
      name: faker.lorem.word(),
    })).filter((p) => p.roleId);

    const departmentRolePermissions = Array.from({ length: batchSize }, () => ({
      departmentRoleId:
        departmentRoles[Math.floor(Math.random() * departmentRoles.length)]?.id,
      name: faker.lorem.word(),
    })).filter((p) => p.departmentRoleId);

    console.log(
      `Inserting batch ${i / batch + 1} (${batchSize} permissions)...`
    );
    if (userPermissions.length)
      await db.insert(userPermissionsTable).values(userPermissions);
    if (rolePermissions.length)
      await db.insert(rolePermissionsTable).values(rolePermissions);
    if (departmentRolePermissions.length)
      await db
        .insert(departmentRolePermissionsTable)
        .values(departmentRolePermissions);
  }

  console.log(`Successfully seeded ${count} permissions.`);
}
