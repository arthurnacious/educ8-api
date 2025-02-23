import { sql } from "drizzle-orm";
import db from "..";
import { privilegesTable, rolesTable, usersTable } from "../schema";
import { userPrivilege } from "@/types/roles";

const BATCH_SIZE = 200;

export const privilegesSeeder = async (userPercentage?: number) => {
  // Fetch total user count
  const totalUsersResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(usersTable);

  const totalUsers = totalUsersResult[0]?.count || 0;
  const usersCount = userPercentage
    ? Math.ceil((userPercentage / 100) * totalUsers)
    : Math.ceil(0.2 * totalUsers);

  try {
    // Fetch all roles
    const allRoles = await db.select().from(rolesTable);

    // Fetch existing users (limit by usersCount if provided)
    const allUsers = await db
      .select()
      .from(usersTable)
      .limit(usersCount || 1000); // Default to 1000 if no limit provided

    const privilegeNames = Object.values(userPrivilege).map((privilege) => ({
      name: privilege,
    }));

    // Generate privilege entries
    const privilegeEntries = [];

    // Assign privileges to all roles
    for (const role of allRoles) {
      for (const name of privilegeNames) {
        privilegeEntries.push({ name, roleId: role.id, userId: null });
      }
    }

    // Assign privileges to users (limited by usersCount)
    for (const user of allUsers) {
      for (const name of privilegeNames) {
        privilegeEntries.push({ name, roleId: null, userId: user.id });
      }
    }

    // Insert in batches
    for (let i = 0; i < privilegeEntries.length; i += BATCH_SIZE) {
      const batch = privilegeEntries.slice(i, i + BATCH_SIZE);
      await db.insert(privilegesTable).values(batch);
    }

    console.log(
      `Privileges inserted successfully for ${
        usersCount || allUsers.length
      } users and all roles.`
    );
  } catch (error) {
    console.error("Error inserting privileges:", error);
  }
};
