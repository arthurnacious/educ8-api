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
    // courses Permissions
    "can_create_courses",
    "can_delete_courses",
    "can_edit_courses",
    "can_view_courses",
    "can_view_courses_attendance",
    "can_view_courses_enrollment",
    "can_view_courses_grades",

    // Subjects Permissions
    "can_create_subjects",
    "can_delete_subjects",
    "can_edit_subjects",
    "can_enroll_in_subjects",
    "can_view_subjects",
    "can_view_subjects_content",
    "can_view_subjects_enrollment",
    "can_view_subjects_grades",

    // Departments Permissions
    "can_create_departments",
    "can_delete_departments",
    "can_edit_departments",
    "can_view_departments",
    "can_view_departments_budget",
    "can_view_departments_subjects",
    "can_view_departments_staff",

    // Finances Permissions
    "can_approve_expenses",
    "can_create_budgets",
    "can_create_expenses",
    "can_create_invoices",
    "can_delete_expenses",
    "can_edit_budgets",
    "can_edit_expenses",
    "can_edit_invoices",
    "can_process_payments",
    "can_view_financial_reports",
    "can_view_invoices",

    // Users Permissions
    "can_activate_users",
    "can_change_users_passwords",
    "can_create_users",
    "can_deactivate_users",
    "can_delete_users",
    "can_edit_users",
    "can_edit_users_profiles",
    "can_reset_users_passwords",
    "can_view_users",
    "can_view_users_details",
    "can_view_users_permissions",
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
