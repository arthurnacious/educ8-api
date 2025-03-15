import db from "@/db";
import {
  rolePermissionsTable,
  userPermissionsTable,
  rolesTable,
  usersTable,
} from "@/db/schema";
import { faker } from "@faker-js/faker";

interface PrivilegeSeederOptions {
  batch?: number;
  customFields?: Record<string, (index: number) => any>;
}

export async function privilegesTableSeeder(
  count: number,
  options: PrivilegeSeederOptions = {}
) {
  const { batch = 100, customFields = {} } = options;
  await db.delete(rolePermissionsTable);
  console.log(`Seeding ${count} privileges in batches of ${batch}...`);

  // Get all roles and users
  const roles = await db.select().from(rolesTable);
  const users = await db.select().from(usersTable);

  if (roles.length === 0) {
    console.error("No roles found. Please seed roles first.");
    return;
  }

  if (users.length === 0) {
    console.error("No users found. Please seed users first.");
    return;
  }

  // Sample privilege names
  const privilegeNames = [
    "create_users",
    "edit_users",
    "delete_users",
    "create_courses",
    "edit_courses",
    "delete_courses",
    "view_reports",
    "generate_reports",
    "manage_departments",
    "assign_roles",
    "manage_attendance",
    "grade_students",
  ];

  // for roles (permissions)
  const insertData = roles.map(({ id: roleId }) => ({
    permissionName: faker.helpers.arrayElement(privilegeNames),
    roleId,
  }));

  db.insert(rolePermissionsTable).values(insertData);

  //for users
  for (let i = 0; i < count; i += batch) {
    const batchSize = Math.min(batch, count - i);
    const privilegeData = Array.from({ length: batchSize }, (_, index) => {
      const actualIndex = i + index;

      // Either assign to a role or a specific user
      return {
        permissionName:
          privilegeNames[Math.floor(Math.random() * privilegeNames.length)],
        userId: users[Math.floor(Math.random() * users.length)].id,
      };
    });

    console.log(
      `Inserting batch ${i / batch + 1} (${privilegeData.length} privileges)...`
    );
    await db.insert(userPermissionsTable).values(privilegeData);
  }

  console.log(`Successfully seeded ${count} privileges.`);
}
