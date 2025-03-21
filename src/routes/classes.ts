import { Hono } from "hono";
import { JwtVariables } from "hono/jwt";
import { authMiddleware } from "../middleware/auth";
import db from "@/db";
import { and, eq } from "drizzle-orm";
import {
  coursesTable,
  departmentRolesTable,
  departmentsTable,
  enrollmentsTable,
  lessonRostersTable,
  usersTable,
  userToDepartmentsTable,
} from "@/db/schema";
import { departmentRole } from "@/types/roles";

const classes = new Hono<{ Variables: JwtVariables }>();
classes.use("*", authMiddleware);

classes.get("/", async (ctx) => {
  const user = ctx.get("jwtPayload");

  return ctx.json({ user });

  // Get all relevant classes
  // const presentedClasses = await getPresentedClasses(userId);

  // // Note: The original code has 'enrolledClasses' in the response but it's not defined
  // // in the provided code. You may need to implement this function separately.
  // const enrolledClasses = await getEnrolledClasses(userId);

  // const departmentClasses = await getDepartmentClasses(userId);

  // return ctx.json({
  //   presentedClasses,
  //   enrolledClasses,
  //   departmentClasses,
  // });
});

export default classes;

async function getUserWithRole(userId: string) {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
    columns: {
      id: true,
      roleId: true,
    },
    with: {
      role: {
        columns: {
          name: true,
        },
      },
    },
  });

  return user;
}

async function getEnrolledClasses(userId: string) {
  const enrolledClasses = await db
    .select({
      id: lessonRostersTable.id,
      name: lessonRostersTable.name,
      courseName: coursesTable.name, // Fetch course name
    })
    .from(enrollmentsTable)
    .innerJoin(
      lessonRostersTable,
      eq(enrollmentsTable.classId, lessonRostersTable.id)
    )
    .innerJoin(
      coursesTable,
      eq(lessonRostersTable.courseId, coursesTable.id) // Join to get course name
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
    })
    .from(lessonRostersTable)
    .innerJoin(coursesTable, eq(lessonRostersTable.courseId, coursesTable.id))
    .where(eq(lessonRostersTable.lecturerId, userId));

  return presentedClasses;
}

// Function to get classes for a department lead
async function getDepartmentClasses(userId: string) {
  const departmentClasses = await db
    .select({
      id: lessonRostersTable.id,
      courseName: coursesTable.name,
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
    .where(
      and(
        eq(userToDepartmentsTable.userId, userId),
        eq(departmentRolesTable.name, departmentRole.LEADER)
      )
    );

  return departmentClasses;
}
