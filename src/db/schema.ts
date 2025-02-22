import { relations } from "drizzle-orm";
import {
  timestamp,
  pgTable,
  text,
  pgEnum,
  varchar,
  numeric,
} from "drizzle-orm/pg-core";
import { AttendanceName } from "@/types/attendance";
import { departmentUserRole, userRole } from "@/types/roles";

export const userRoleEnum = pgEnum(
  "user_role",
  Object.values(userRole) as [userRole, ...userRole[]]
);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "eft",
  "payment_gateway",
]);

export const attendanceStatusEnum = pgEnum(
  "attendance_status",
  Object.values(AttendanceName) as [AttendanceName, ...AttendanceName[]]
);

export const departmentUserRoleEnum = pgEnum(
  "role",
  Object.values(departmentUserRole) as [
    departmentUserRole,
    ...departmentUserRole[]
  ]
);

export const usersTable = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  passwordHash: varchar("password_hash", { length: 255 }),
  role: userRoleEnum("role").notNull(),
  image: varchar("image", { length: 255 }),
});

export const departmentsTable = pgTable("departments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const coursesTable = pgTable("course", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  departmentId: varchar("departmentId", { length: 255 })
    .notNull()
    .references(() => departmentsTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const fields = pgTable("field", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  courseId: varchar("courseId", { length: 255 })
    .notNull()
    .references(() => coursesTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
});

export const lessonRostersTable = pgTable("lessonRoster", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  courseId: varchar("courseId", { length: 255 })
    .notNull()
    .references(() => coursesTable.id, { onDelete: "cascade" }),
  creatorId: varchar("creatorId", { length: 255 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  notes: varchar("notes", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const marks = pgTable("mark", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  fieldId: varchar("fieldId", { length: 255 })
    .notNull()
    .references(() => fields.id, { onDelete: "cascade" }),
  studentId: varchar("studentId", { length: 255 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  lessonRosterId: varchar("lessonRosterId", { length: 255 })
    .notNull()
    .references(() => lessonRostersTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
});

export const attendanceTable = pgTable("attendance", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  studentId: varchar("studentId", { length: 255 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  periodId: varchar("periodId", { length: 255 })
    .notNull()
    .references(() => sessionsTable.id, { onDelete: "cascade" }),
  type: attendanceStatusEnum("type").default(AttendanceName.PRESENT).notNull(),
});

export const coursesToDepartments = pgTable("courseToDepartments", {
  courseId: varchar("courseId", { length: 255 })
    .notNull()
    .references(() => coursesTable.id, { onDelete: "cascade" }),
  departmentId: varchar("departmentId", { length: 255 })
    .notNull()
    .references(() => departmentsTable.id, { onDelete: "cascade" }),
});

export const studentsToLessonRosters = pgTable("studentToLessonRoster", {
  studentId: varchar("studentId", { length: 255 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  lessonRosterId: varchar("lessonRosterId", { length: 255 })
    .notNull()
    .references(() => lessonRostersTable.id, { onDelete: "cascade" }),
});

export const userToDepartment = pgTable("userToDepartment", {
  departmentId: varchar("departmentId", { length: 255 })
    .notNull()
    .references(() => departmentsTable.id, { onDelete: "cascade" }),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  role: departmentUserRoleEnum("role").notNull(),
});

export const parentDepandants = pgTable("userToDepartment", {
  guardianId: varchar("guardianId", { length: 255 }) // Clearly denotes a guardian
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  dependentId: varchar("dependentId", { length: 255 }) // Clearly denotes a dependent
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

//? Relationships
// Users Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  // User's department affiliations
  departmentMemberships: many(userToDepartment),

  // Classes the user is enrolled in (as a student)
  enrolledClasses: many(studentsToLessonRosters),

  // User's marks/grades
  marks: many(marks, { relationName: "studentMarks" }),

  // Classes created by this user (as a teacher/instructor)
  createdLessonRosters: many(lessonRostersTable, {
    relationName: "lessonCreator",
  }),

  // Attendance records
  attendanceRecords: many(attendanceTable, {
    relationName: "studentAttendance",
  }),

  // Guardian relationships - where this user is the guardian
  dependents: many(parentDepandants, {
    relationName: "guardianToDependents",

    // foreignKey: "guardianId",
  }),

  // Dependent relationships - where this user is the dependent
  guardians: many(parentDepandants, {
    relationName: "dependentToGuardians",
    // foreignKey: "dependentId",
  }),
}));

// Department Relations
export const departmentsRelations = relations(departmentsTable, ({ many }) => ({
  // Courses in this department
  courses: many(coursesToDepartments),

  // Users affiliated with this department
  members: many(userToDepartment),
}));

// Course Relations
export const coursesRelations = relations(coursesTable, ({ one, many }) => ({
  // Department this course belongs to
  department: one(departmentsTable, {
    fields: [coursesTable.departmentId],
    references: [departmentsTable.id],
  }),

  // Fields/subjects within this course
  fields: many(fields),

  // Lesson rosters for this course
  lessonRosters: many(lessonRostersTable),

  // Department connections (for cross-listed courses)
  departmentConnections: many(coursesToDepartments),
}));

// Field Relations
export const fieldsRelations = relations(fields, ({ one, many }) => ({
  // Course this field belongs to
  course: one(coursesTable, {
    fields: [fields.courseId],
    references: [coursesTable.id],
  }),

  // Marks/grades associated with this field
  marks: many(marks),
}));

// Lesson Roster Relations
export const lessonRostersRelations = relations(
  lessonRostersTable,
  ({ one, many }) => ({
    // Course this lesson roster belongs to
    course: one(coursesTable, {
      fields: [lessonRostersTable.courseId],
      references: [coursesTable.id],
    }),

    // Creator of this lesson roster
    creator: one(usersTable, {
      fields: [lessonRostersTable.creatorId],
      references: [usersTable.id],
    }),

    // Sessions/periods in this lesson roster
    sessions: many(sessionsTable),

    // Students enrolled in this lesson roster
    enrolledStudents: many(studentsToLessonRosters),
  })
);

// Marks Relations
export const marksRelations = relations(marks, ({ one }) => ({
  // Field this mark belongs to
  field: one(fields, {
    fields: [marks.fieldId],
    references: [fields.id],
  }),

  // Student who received this mark
  student: one(usersTable, {
    fields: [marks.studentId],
    references: [usersTable.id],
    relationName: "studentMarks",
  }),
}));

// Sessions Relations
export const sessionsRelations = relations(sessionsTable, ({ one, many }) => ({
  // Lesson roster this session belongs to
  lessonRoster: one(lessonRostersTable, {
    fields: [sessionsTable.lessonRosterId],
    references: [lessonRostersTable.id],
  }),

  // Attendance records for this session
  attendanceRecords: many(attendanceTable),
}));

// Attendance Relations
export const attendanceRelations = relations(attendanceTable, ({ one }) => ({
  // Student whose attendance is recorded
  student: one(usersTable, {
    fields: [attendanceTable.studentId],
    references: [usersTable.id],
    relationName: "studentAttendance",
  }),

  // Session this attendance record belongs to
  session: one(sessionsTable, {
    fields: [attendanceTable.periodId],
    references: [sessionsTable.id],
  }),
}));

// CoursesToDepartments Relations
export const coursesToDepartmentsRelations = relations(
  coursesToDepartments,
  ({ one }) => ({
    // Course in this relationship
    course: one(coursesTable, {
      fields: [coursesToDepartments.courseId],
      references: [coursesTable.id],
    }),

    // Department in this relationship
    department: one(departmentsTable, {
      fields: [coursesToDepartments.departmentId],
      references: [departmentsTable.id],
    }),
  })
);

// StudentsToLessonRosters Relations
export const studentsToLessonRostersRelations = relations(
  studentsToLessonRosters,
  ({ one }) => ({
    // Student in this enrollment
    student: one(usersTable, {
      fields: [studentsToLessonRosters.studentId],
      references: [usersTable.id],
    }),

    // Lesson roster the student is enrolled in
    lessonRoster: one(lessonRostersTable, {
      fields: [studentsToLessonRosters.lessonRosterId],
      references: [lessonRostersTable.id],
    }),
  })
);

// UserToDepartment Relations
export const userToDepartmentRelations = relations(
  userToDepartment,
  ({ one }) => ({
    // User in this department membership
    user: one(usersTable, {
      fields: [userToDepartment.userId],
      references: [usersTable.id],
    }),

    // Department the user belongs to
    department: one(departmentsTable, {
      fields: [userToDepartment.departmentId],
      references: [departmentsTable.id],
    }),
  })
);

// ParentDependents Relations (Guardian-Dependent relationship)
export const parentDependantsRelations = relations(
  parentDepandants,
  ({ one }) => ({
    // Guardian user
    guardian: one(usersTable, {
      fields: [parentDepandants.guardianId],
      references: [usersTable.id],
      relationName: "guardianToDependents",
    }),

    // Dependent user
    dependent: one(usersTable, {
      fields: [parentDepandants.dependentId],
      references: [usersTable.id],
      relationName: "dependentToGuardians",
    }),
  })
);
