import db from "@/db";
import { privilegesTable, rolesTable, usersTable } from "@/db/schema";

interface PrivilegeSeederOptions {
  batch?: number;
  customFields?: Record<string, (index: number) => any>;
}

export async function privilegesTableSeeder(
  count: number,
  options: PrivilegeSeederOptions = {}
) {
  const { batch = 100, customFields = {} } = options;
  await db.delete(privilegesTable);
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

  for (let i = 0; i < count; i += batch) {
    const batchSize = Math.min(batch, count - i);
    const privilegeData = Array.from({ length: batchSize }, (_, index) => {
      const actualIndex = i + index;
      const assignToRole = Math.random() > 0.5;

      // Either assign to a role or a specific user
      return {
        name:
          customFields.name?.(actualIndex) ||
          privilegeNames[Math.floor(Math.random() * privilegeNames.length)],
        roleId: assignToRole
          ? customFields.roleId?.(actualIndex) ||
            roles[Math.floor(Math.random() * roles.length)].id
          : null,
        userId: !assignToRole
          ? customFields.userId?.(actualIndex) ||
            users[Math.floor(Math.random() * users.length)].id
          : null,
      };
    });

    console.log(
      `Inserting batch ${i / batch + 1} (${privilegeData.length} privileges)...`
    );
    await db.insert(privilegesTable).values(privilegeData);
  }

  console.log(`Successfully seeded ${count} privileges.`);
}
