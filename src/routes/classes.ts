import { Hono } from "hono";
import { JwtVariables } from "hono/jwt";
import { authMiddleware } from "../middleware/auth";
import db from "@/db";
import { enrollmentsTable, coursesTable, marksTable } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

const courses = new Hono<{ Variables: JwtVariables }>();
courses.use("*", authMiddleware);

const removeSTudentsFromcours = z.object({
  studentIds: z.array(z.string()),
});

courses
  .get("/:id", async (ctx) => {
    const { id } = ctx.req.param();

    const data = await db.query.coursesTable.findFirst({
      where: (coursData, { eq }) => eq(coursData.id, id),
      with: {
        enrollments: {
          with: {
            user: {
              columns: {
                name: true,
                image: true,
              },
              with: {
                payments: {
                  where: (payments, { eq }) =>
                    eq(payments.courseId, coursesTable.id),
                },
                attendance: {
                  where: (attendance, { eq }) =>
                    eq(attendance.periodId, coursesTable.id),
                },
              },
            },
          },
        },
        sessions: {
          columns: {
            id: true,
            name: true,
          },
        },
        marks: true,
      },
    });

    return ctx.json({ data });
  })
  .patch("/:courseId", async (ctx) => {
    const { courseId } = ctx.req.param();
    const body = ctx.req.json();

    const validatedData = removeSTudentsFromcours.parse(body);

    const transaction = await db.transaction(async (tx) => {
      // First delete from enrollments table
      const deletedEnrollments = await tx
        .delete(enrollmentsTable)
        .where(
          and(
            inArray(enrollmentsTable.studentId, validatedData.studentIds),
            eq(enrollmentsTable.courseId, courseId)
          )
        )
        .returning();

      const deletedMarks = await tx
        .delete(marksTable)
        .where(
          and(
            inArray(marksTable.studentId, validatedData.studentIds),
            eq(marksTable.courseId, courseId)
          )
        )
        .returning();

      return { deletedEnrollments, deletedMarks };
    });

    return ctx.json({ data: transaction });
  });

export default courses;
