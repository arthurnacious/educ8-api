import { Hono } from "hono";
import type { JwtVariables } from "hono/jwt";
import { authMiddleware } from "../middleware/auth";
import {
  subjectsTable,
  departmentRolesTable,
  departmentsTable,
  enrollmentsTable,
  coursesTable,
  usersTable,
  userToDepartmentsTable,
} from "@/db/schema";
import db from "@/db";
import { and, eq } from "drizzle-orm";
import { departmentRole } from "@/types/roles";
import { de } from "@faker-js/faker/.";

const personal = new Hono<{ Variables: JwtVariables }>();
personal.get("/courses", authMiddleware, async (ctx) => {
  const { id: userId } = ctx.get("jwtPayload");

  const dbUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
  });

  if (!dbUser) return ctx.json({ error: "User not found" }, 404);

  // Get all relevant courses
  const presentedcourses = await getPresentedcourses(userId);

  // Note: The original code has 'enrolledcourses' in the response but it's not defined
  // in the provided code. You may need to implement this function separately.
  const enrolledcourses = await getEnrolledSubjects(userId); // Placeholder for missing data

  const departmentcourses = await getDepartmentcourses(userId);

  return ctx.json({
    data: {
      presentedcourses,
      enrolledcourses,
      departmentcourses,
    },
  });
});

export default personal;

async function getEnrolledSubjects(userId: string) {
  const enrolledcourses = await db
    .select({
      id: coursesTable.id,
      subjectName: subjectsTable.name,
      departmentName: departmentsTable.name,
      lecturer: {
        name: usersTable.name,
        image: usersTable.image,
      },
      createdAt: coursesTable.createdAt,
    })
    .from(enrollmentsTable)
    .innerJoin(coursesTable, eq(enrollmentsTable.courseId, coursesTable.id))
    .innerJoin(
      subjectsTable,
      eq(coursesTable.subjectId, subjectsTable.id) // Join to get subject name
    )
    .innerJoin(
      departmentsTable,
      eq(subjectsTable.departmentId, departmentsTable.id) // Join to get department name
    )
    .innerJoin(
      usersTable,
      eq(coursesTable.lecturerId, usersTable.id) // Join to get department name
    )
    .where(eq(enrollmentsTable.studentId, userId));

  return enrolledcourses;
}

// Function to get courses presented by a lecturer
async function getPresentedcourses(userId: string) {
  const presentedcourses = await db
    .select({
      id: coursesTable.id,
      subjectName: subjectsTable.name,
      departmentName: departmentsTable.name, // Get department name
      createdAt: coursesTable.createdAt,
    })
    .from(coursesTable)
    .innerJoin(subjectsTable, eq(coursesTable.subjectId, subjectsTable.id))
    .innerJoin(
      departmentsTable,
      eq(subjectsTable.departmentId, departmentsTable.id)
    ) // Join departmentsTable on departmentId
    .where(eq(coursesTable.lecturerId, userId));

  return presentedcourses;
}

// Function to get courses for a department lead
async function getDepartmentcourses(userId: string) {
  const departmentcourses = await db
    .select({
      id: coursesTable.id,
      subjectName: subjectsTable.name,
      departmentName: departmentsTable.name,
      lecturer: {
        name: usersTable.name,
        image: usersTable.image,
      },
      createdAt: coursesTable.createdAt,
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
    .innerJoin(coursesTable, eq(coursesTable.subjectId, subjectsTable.id))
    .innerJoin(usersTable, eq(coursesTable.lecturerId, usersTable.id))
    .where(
      and(
        eq(userToDepartmentsTable.userId, userId),
        eq(departmentRolesTable.name, departmentRole.LEADER)
      )
    );

  return departmentcourses;
}
