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

  const permissions = [
    // Classes Permissions
    "can_create_class",
    "can_delete_class",
    "can_edit_class",
    "can_view_class",
    "can_view_class_attendance",
    "can_view_class_enrollment",
    "can_view_class_grades",

    // Subjects Permissions
    "can_create_subject",
    "can_delete_subject",
    "can_edit_subject",
    "can_enroll_in_subject",
    "can_view_subject",
    "can_view_subject_content",
    "can_view_subject_enrollment",
    "can_view_subject_grades",

    // Departments Permissions
    "can_create_department",
    "can_delete_department",
    "can_edit_department",
    "can_view_department",
    "can_view_department_budget",
    "can_view_department_subjects",
    "can_view_department_staff",

    // Finances Permissions
    "can_approve_expense",
    "can_create_budget",
    "can_create_expense",
    "can_create_invoice",
    "can_delete_expense",
    "can_edit_budget",
    "can_edit_expense",
    "can_edit_invoice",
    "can_process_payment",
    "can_view_financial_reports",
    "can_view_invoice",

    // Users Permissions
    "can_activate_user",
    "can_change_user_password",
    "can_create_user",
    "can_deactivate_user",
    "can_delete_user",
    "can_edit_user",
    "can_edit_user_profile",
    "can_reset_user_password",
    "can_view_user",
    "can_view_user_details",
    "can_view_user_permissions",
  ];

  // Fetch existing users, roles, and department roles
  const users = await db.select().from(usersTable);
  const roles = await db.select().from(rolesTable);
  const departmentRoles = await db.select().from(departmentRolesTable);

  for (let i = 0; i < count; i += batch) {
    const batchSize = Math.min(batch, count - i);

    const userPermissions = Array.from({ length: batchSize }, () => ({
      userId: users[Math.floor(Math.random() * users.length)]?.id,
      name: faker.helpers.arrayElement(permissions),
    })).filter((p) => p.userId);

    const rolePermissions = Array.from({ length: batchSize }, () => ({
      roleId: roles[Math.floor(Math.random() * roles.length)]?.id,
      name: faker.helpers.arrayElement(permissions),
    })).filter((p) => p.roleId);

    const departmentRolePermissions = Array.from({ length: batchSize }, () => ({
      departmentRoleId:
        departmentRoles[Math.floor(Math.random() * departmentRoles.length)]?.id,
      name: faker.helpers.arrayElement(permissions),
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
