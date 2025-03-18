import { relations, sql } from "drizzle-orm";
import {
  timestamp,
  pgTable,
  text,
  pgEnum,
  varchar,
  numeric,
  uuid,
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

export const rolesTable = pgTable("roles", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: userRoleEnum("role").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersTable = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  roleId: uuid("role_id")
    .references(() => rolesTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  image: varchar("image", { length: 255 }),
});

export const departmentsTable = pgTable("departments", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at')
});

export const coursesTable = pgTable("course", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  departmentId: uuid("departmentId")
    .notNull()
    .references(() => departmentsTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  name: varchar("name", { length: 255 }),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at')
});

export const fields = pgTable("field", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  courseId: uuid("courseId")
    .notNull()
    .references(() => coursesTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  name: varchar("name", { length: 255 }).notNull(),
});

export const lessonRostersTable = pgTable("lessonRoster", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  courseId: uuid("courseId")
    .notNull()
    .references(() => coursesTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  creatorId: uuid("creatorId")
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  name: varchar("name", { length: 255 }),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const marks = pgTable("mark", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  fieldId: uuid("fieldId")
    .notNull()
    .references(() => fields.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  studentId: uuid("studentId")
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  lessonRosterId: uuid("lessonRosterId")
    .notNull()
    .references(() => lessonRostersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  name: varchar("name", { length: 255 }).notNull(),
});

export const attendanceTable = pgTable("attendance", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  studentId: uuid("studentId")
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  periodId: uuid("periodId")
    .notNull()
    .references(() => sessionsTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  type: attendanceStatusEnum("type").default(AttendanceName.PRESENT).notNull(),
});

export const studentsToLessonRosters = pgTable("studentToLessonRoster", {
  studentId: uuid("studentId")
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  lessonRosterId: uuid("lessonRosterId")
    .notNull()
    .references(() => lessonRostersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});

export const userToDepartment = pgTable("userToDepartment", {
  departmentId: uuid("departmentId")
    .notNull()
    .references(() => departmentsTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  userId: uuid("userId")
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  role: departmentUserRoleEnum("role").notNull(),
});

export const parentDepandants = pgTable("userToDepartment", {
  guardianId: uuid("guardianId") // Clearly denotes a guardian
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  dependentId: uuid("dependentId") // Clearly denotes a dependent
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});

export const rolePermissionsTable = pgTable("role_permissions", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  roleId: uuid("role_id")
    .references(() => rolesTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  permissionName: text("permission_name").notNull(), // e.g., 'can_create_classes'
});

export const userPermissionsTable = pgTable("user_permissions", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: uuid("user_id")
    .references(() => usersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  permissionName: text("permission_name").notNull(), // Custom permission for this user
});

//? Relationships
// Users Relations
export const usersRelations = relations(usersTable, ({ many, one }) => ({
  // User's department affiliations
  departmentMemberships: many(userToDepartment),

  // User's roles
  role: one(rolesTable, {
    fields: [usersTable.roleId],
    references: [rolesTable.id],
  }),

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
  courses: many(coursesTable),

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
