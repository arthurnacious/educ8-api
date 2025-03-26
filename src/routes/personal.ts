import { Hono } from "hono";
import type { JwtVariables } from "hono/jwt";
import { authMiddleware } from "../middleware/auth";
import {
  subjectsTable,
  departmentRolesTable,
  departmentsTable,
  enrollmentsTable,
  lessonRostersTable,
  usersTable,
  userToDepartmentsTable,
} from "@/db/schema";
import db from "@/db";
import { and, eq } from "drizzle-orm";
import { departmentRole } from "@/types/roles";
import { de } from "@faker-js/faker/.";

const personal = new Hono<{ Variables: JwtVariables }>();
personal.get("/classes", authMiddleware, async (ctx) => {
  const { id: userId } = ctx.get("jwtPayload");

  const dbUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
  });

  if (!dbUser) return ctx.json({ error: "User not found" }, 404);

  // Get all relevant classes
  const presentedClasses = await getPresentedClasses(userId);

  // Note: The original code has 'enrolledClasses' in the response but it's not defined
  // in the provided code. You may need to implement this function separately.
  const enrolledClasses = await getEnrolledSubjects(userId); // Placeholder for missing data

  const departmentClasses = await getDepartmentClasses(userId);

  return ctx.json({
    data: {
      presentedClasses,
      enrolledClasses,
      departmentClasses,
    },
  });
});

export default personal;

async function getEnrolledSubjects(userId: string) {
  const enrolledClasses = await db
    .select({
      id: lessonRostersTable.id,
      subjectName: subjectsTable.name,
      departmentName: departmentsTable.name,
      lecturer: {
        name: usersTable.name,
        image: usersTable.image,
      },
      createdAt: lessonRostersTable.createdAt,
    })
    .from(enrollmentsTable)
    .innerJoin(
      lessonRostersTable,
      eq(enrollmentsTable.lessonRosterId, lessonRostersTable.id)
    )
    .innerJoin(
      subjectsTable,
      eq(lessonRostersTable.subjectId, subjectsTable.id) // Join to get subject name
    )
    .innerJoin(
      departmentsTable,
      eq(subjectsTable.departmentId, departmentsTable.id) // Join to get department name
    )
    .innerJoin(
      usersTable,
      eq(lessonRostersTable.lecturerId, usersTable.id) // Join to get department name
    )
    .where(eq(enrollmentsTable.studentId, userId));

  return enrolledClasses;
}

// Function to get classes presented by a lecturer
async function getPresentedClasses(userId: string) {
  const presentedClasses = await db
    .select({
      id: lessonRostersTable.id,
      subjectName: subjectsTable.name,
      departmentName: departmentsTable.name, // Get department name
      createdAt: lessonRostersTable.createdAt,
    })
    .from(lessonRostersTable)
    .innerJoin(
      subjectsTable,
      eq(lessonRostersTable.subjectId, subjectsTable.id)
    )
    .innerJoin(
      departmentsTable,
      eq(subjectsTable.departmentId, departmentsTable.id)
    ) // Join departmentsTable on departmentId
    .where(eq(lessonRostersTable.lecturerId, userId));

  return presentedClasses;
}

// Function to get classes for a department lead
async function getDepartmentClasses(userId: string) {
  const departmentClasses = await db
    .select({
      id: lessonRostersTable.id,
      subjectName: subjectsTable.name,
      departmentName: departmentsTable.name,
      lecturer: {
        name: usersTable.name,
        image: usersTable.image,
      },
      createdAt: lessonRostersTable.createdAt,
    })
    .from(userToDepartmentsTable)
    .innerJoin(
      departmentsTable,
      eq(userToDepartmentsTable.departmentId, departmentsTable.id)
    )
    .innerJoin(
      departmentRolesTable,
      eq(userToDepartmentsTable.departmentRoleId, departmentRolesTable.id)
    )
    .innerJoin(
      subjectsTable,
      eq(subjectsTable.departmentId, departmentsTable.id)
    )
    .innerJoin(
      lessonRostersTable,
      eq(lessonRostersTable.subjectId, subjectsTable.id)
    )
    .innerJoin(usersTable, eq(lessonRostersTable.lecturerId, usersTable.id))
    .where(
      and(
        eq(userToDepartmentsTable.userId, userId),
        eq(departmentRolesTable.name, departmentRole.LEADER)
      )
    );

  return departmentClasses;
}
