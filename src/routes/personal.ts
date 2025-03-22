import { Hono } from "hono";
import type { JwtVariables } from "hono/jwt";
import { authMiddleware } from "../middleware/auth";
import {
  coursesTable,
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
  const enrolledClasses = await getEnrolledCourses(userId); // Placeholder for missing data

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

async function getEnrolledCourses(userId: string) {
  const enrolledClasses = await db
    .select({
      id: lessonRostersTable.id,
      courseName: coursesTable.name,
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
      coursesTable,
      eq(lessonRostersTable.courseId, coursesTable.id) // Join to get course name
    )
    .innerJoin(
      departmentsTable,
      eq(coursesTable.departmentId, departmentsTable.id) // Join to get department name
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
      courseName: coursesTable.name,
      departmentName: departmentsTable.name, // Get department name
      createdAt: lessonRostersTable.createdAt,
    })
    .from(lessonRostersTable)
    .innerJoin(coursesTable, eq(lessonRostersTable.courseId, coursesTable.id))
    .innerJoin(
      departmentsTable,
      eq(coursesTable.departmentId, departmentsTable.id)
    ) // Join departmentsTable on departmentId
    .where(eq(lessonRostersTable.lecturerId, userId));

  return presentedClasses;
}

// Function to get classes for a department lead
async function getDepartmentClasses(userId: string) {
  const departmentClasses = await db
    .select({
      id: lessonRostersTable.id,
      courseName: coursesTable.name,
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
    .innerJoin(coursesTable, eq(coursesTable.departmentId, departmentsTable.id))
    .innerJoin(
      lessonRostersTable,
      eq(lessonRostersTable.courseId, coursesTable.id)
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
