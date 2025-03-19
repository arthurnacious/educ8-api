import db from "@/db";
import {
  rolePermissionsTable,
  userPermissionsTable,
  rolesTable,
  departmentRolePermissionsTable,
  usersTable,
  departmentRolesTable,
} from "@/db/schema";
import { faker } from "@faker-js/faker";

interface PrivilegeSeederOptions {
  batch?: number;
}

export async function permissionsTableSeeder(
  count: number,
  options: PrivilegeSeederOptions = {}
) {
  const { batch = 100 } = options;

  await db.delete(userPermissionsTable);
  await db.delete(rolePermissionsTable);
  await db.delete(departmentRolePermissionsTable);

  console.log(`Seeding ${count} privileges in batches of ${batch}...`);

  // Fetch all roles, users, and department roles
  const roles = await db.select().from(rolesTable);
  const users = await db.select().from(usersTable);
  const departmentRoles = await db.select().from(departmentRolesTable);

  if (roles.length === 0) {
    console.error("No roles found. Please seed roles first.");
    return;
  }
  if (users.length === 0) {
    console.error("No users found. Please seed users first.");
    return;
  }
  if (departmentRoles.length === 0) {
    console.error(
      "No department roles found. Please seed department roles first."
    );
    return;
  }

  // Sample privilege names
  const globalPermissionNames = [
    // User management permissions
    "create_users", // Create new users
    "edit_users", // Edit existing users
    "delete_users", // Delete users

    // Course management permissions
    "create_courses", // Create new courses
    "edit_courses", // Edit existing courses
    "delete_courses", // Delete courses

    // Report management permissions
    "view_reports", // View reports
    "generate_reports", // Generate new reports

    // Department management permissions
    "manage_departments", // Manage departments
    "assign_roles", // Assign roles to users

    // Attendance management permissions
    "manage_attendance", // Manage attendance records

    // Marks management permissions
    "assign_marks_to_students", // Assign marks to students
    "view_marks", // View marks of students

    // Manage departments
    "view_all_departments", // View all departments
    "create_department", // Create new departments
    "edit_department", // Edit existing departments
    "delete_department", // Delete departments

    // payments
    "view_payments", // View payments
    "create_payment", // Create new payments
    "edit_payment", // Edit existing payments
    "delete_payment", // Delete payments
  ];

  const departmentPermissionNames = [
    // Class management permissions
    "create_class", // Create new classes
    "delete_class", // Delete classes
    "assign_students_to_classes", // Assign students to specific classes
    "remove_students_from_class", // Remove students from classes

    // Marks and attendance management permissions
    "assign_marks_to_students", // Assign marks to students
    "remove_marks_from_students", // Remove marks from students
    "take_class_attendance", // Take attendance for a class
    "take_class_payments", // Manage payments for classes

    // Additional class-related permissions
    "edit_class_schedule", // Edit the class schedule
    "view_class_roster", // View the list of students in a class

    //user-related permissions
    "add_user_to_department", // Add users to a department
    "remove_user_from_department", // Remove users from a department
  ];

  // Role Permissions - Ensuring Unique (roleId, globalPermissionName) Pairs
  const rolePermissionPairs = new Set<string>();
  const rolePermissions = [];

  while (
    rolePermissions.length <
    Math.min(roles.length * globalPermissionNames.length, count)
  ) {
    const roleId = faker.helpers.arrayElement(roles).id;
    const permissionName = faker.helpers.arrayElement(globalPermissionNames);
    const key = `${roleId}-${permissionName}`;

    if (!rolePermissionPairs.has(key)) {
      rolePermissionPairs.add(key);
      rolePermissions.push({ roleId, name: permissionName });
    }
  }

  await db.insert(rolePermissionsTable).values(rolePermissions);
  console.log(`Inserted ${rolePermissions.length} role-based permissions.`);

  // User Permissions - Ensuring Unique (userId, globalPermissionName) Pairs
  const userPermissionPairs = new Set<string>();
  const userPermissions = [];

  while (userPermissions.length < count) {
    const userId = faker.helpers.arrayElement(users).id;
    const permissionName = faker.helpers.arrayElement(globalPermissionNames);
    const key = `${userId}-${permissionName}`;

    if (!userPermissionPairs.has(key)) {
      userPermissionPairs.add(key);
      userPermissions.push({ userId, name: permissionName });
    }
  }

  await db.insert(userPermissionsTable).values(userPermissions);
  console.log(`Inserted ${userPermissions.length} user-based permissions.`);

  // Department Role Permissions - Ensuring Unique (departmentRoleId, departmentPermissionName) Pairs
  const departmentPermissionPairs = new Set<string>();
  const departmentRolePermissions = [];

  while (departmentRolePermissions.length < count) {
    const departmentRoleId = faker.helpers.arrayElement(departmentRoles).id;
    const permissionName = faker.helpers.arrayElement(
      departmentPermissionNames
    );
    const key = `${departmentRoleId}-${permissionName}`;

    if (!departmentPermissionPairs.has(key)) {
      departmentPermissionPairs.add(key);
      departmentRolePermissions.push({
        departmentRoleId,
        name: permissionName,
      });
    }
  }

  await db
    .insert(departmentRolePermissionsTable)
    .values(departmentRolePermissions);
  console.log(
    `Inserted ${departmentRolePermissions.length} department role-based permissions.`
  );

  console.log("Successfully seeded privileges.");
}
