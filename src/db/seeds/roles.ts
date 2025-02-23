import { userRole } from "@/types/roles";
import { rolesTable } from "../schema";
import db from "..";

export const rolesSeeder = async () => {
  const roles = await db
    .insert(rolesTable)
    .values(
      Object.values(userRole).map((role) => ({
        name: role,
      }))
    )
    .returning();

  console.log(`${roles.length} Roles inserted successfully!`);
};
