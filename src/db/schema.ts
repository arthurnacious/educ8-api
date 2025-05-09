import { relations } from "drizzle-orm";
import {
  timestamp,
  pgTable,
  text,
  pgEnum,
  varchar,
  numeric,
  uuid,
  primaryKey,
  jsonb,
} from "drizzle-orm/pg-core";
import { AttendanceName } from "@/types/attendance";
import { departmentRole, userRole } from "@/types/roles";

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

export const departmentRoleEnum = pgEnum(
  "role",
  Object.values(departmentRole) as [departmentRole, ...departmentRole[]]
);

export const rolesTable = pgTable("roles", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: userRoleEnum("role").notNull(),
  description: text("description"),
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

export const refreshTokensTable = pgTable("refresh_tokens", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: uuid("user_id")
    .references(() => usersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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
  deletedAt: timestamp("deleted_at"),
});

export const subjectsTable = pgTable("subjects", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  departmentId: uuid("department_id")
    .notNull()
    .references(() => departmentsTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  name: varchar("name", { length: 255 }),
  price: numeric("price", {
    precision: 10,
    scale: 2,
  }),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  lastFieldAddedAt: timestamp("lastFieldAddedAt"), //to prevent adding fields while the subject runs.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
});

export const fields = pgTable("field", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjectsTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  passRate: numeric("passRate", { precision: 10, scale: 2 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const coursesTable = pgTable("courses", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjectsTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  lecturerId: uuid("lecturer_id")
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  effectivesubjectPrice: numeric("effectivesubjectPrice", {
    precision: 10,
    scale: 2,
  }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const paymentsTable = pgTable("payments", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  courseId: uuid("cours_id")
    .notNull()
    .references(() => coursesTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const marksTable = pgTable("marks", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  courseId: uuid("course_id")
    .notNull()
    .references(() => coursesTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  name: text("name").notNull(),
  passRate: numeric("passRate", { precision: 10, scale: 2 }).notNull(),
  studentId: uuid("student_id")
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
  courseId: uuid("course_id")
    .notNull()
    .references(() => coursesTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const departmentRolesTable = pgTable("department_roles", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: departmentRoleEnum("role").notNull(),
  description: text("description"),
});

export const departmentRolePermissionsTable = pgTable(
  "department_role_permissions",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    departmentRoleId: uuid("department_role_id")
      .references(() => departmentRolesTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    name: text("name").notNull(),
  }
);

export const attendanceTable = pgTable("attendances", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  studentId: uuid("student_id")
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  periodId: uuid("period_id")
    .notNull()
    .references(() => sessionsTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  status: attendanceStatusEnum("status")
    .default(AttendanceName.PRESENT)
    .notNull(),
});

export const enrollmentsTable = pgTable(
  "enrollments",
  {
    studentId: uuid("student_id")
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    courseId: uuid("cours_id")
      .notNull()
      .references(() => coursesTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  ({ studentId, courseId }) => {
    return [primaryKey({ columns: [studentId, courseId] })];
  }
);

export const userToDepartmentsTable = pgTable(
  "userToDepartment",
  {
    departmentId: uuid("department_id")
      .notNull()
      .references(() => departmentsTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    departmentRoleId: uuid("department_role_id")
      .notNull()
      .references(() => departmentRolesTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  ({ departmentId, userId }) => {
    return [primaryKey({ columns: [departmentId, userId] })];
  }
);

export const guardianDependantsTable = pgTable(
  "guardianToDependents",
  {
    guardianId: uuid("guardian_id") // Clearly denotes a guardian
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    dependentId: uuid("dependent_id")
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  ({ guardianId, dependentId }) => {
    return [primaryKey({ columns: [guardianId, dependentId] })];
  }
);

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
  name: text("name").notNull(),
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
  name: text("name").notNull(), // Custom permission for this user
});

export const auditLogsTable = pgTable("audit_logs", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: uuid("user_id").references(() => usersTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }), // Who performed the action
  action: text("action").notNull(), // "create", "update", "delete"
  model: text("model").notNull(), // Affected table name
  modelId: uuid("model_id"), // Nullable for deletes
  before: jsonb("before"), // Previous state
  after: jsonb("after"), // New state
  createdAt: timestamp("created_at").defaultNow(),
});

//? Relationships
// Users Relations
export const usersRelations = relations(usersTable, ({ many, one }) => ({
  // User's department affiliations (many-to-many via userToDepartmentsTable)
  departmentMemberships: many(userToDepartmentsTable),

  // User's role (each user belongs to one role)
  role: one(rolesTable, {
    fields: [usersTable.roleId],
    references: [rolesTable.id],
  }),

  // User's audit logs
  auditLogs: many(auditLogsTable, {
    relationName: "auditLogs",
  }),

  // courses the user is enrolled in (as a student)
  enrollments: many(enrollmentsTable),

  // User's marks/grades
  marks: many(marksTable, { relationName: "studentMarks" }),

  // courses created by this user (as a teacher/instructor)
  courses: many(coursesTable, {
    relationName: "presentingCourses",
  }),

  // Attendance records (as a student)
  attendance: many(attendanceTable, {
    relationName: "studentAttendance",
  }),

  // Guardian relationships – where this user is the guardian
  dependents: many(guardianDependantsTable, {
    relationName: "guardianToDependents",
  }),

  // Dependent relationships – where this user is the dependent
  guardians: many(guardianDependantsTable, {
    relationName: "dependentToGuardians",
  }),

  // Custom permissions directly assigned to the user
  permissions: many(userPermissionsTable),

  payments: many(paymentsTable),
}));

// Audit Logs Relationships
export const auditLogsRelations = relations(auditLogsTable, ({ one }) => ({
  // User who performed the action
  user: one(usersTable, {
    fields: [auditLogsTable.userId],
    references: [usersTable.id],
  }),
}));

// Departments Relationships
export const departmentsRelations = relations(departmentsTable, ({ many }) => ({
  // subjects in this department
  subjects: many(subjectsTable),

  // Users affiliated with this department (via join table)
  members: many(userToDepartmentsTable),
}));

// subjects Relationships
export const subjectsRelations = relations(subjectsTable, ({ one, many }) => ({
  // Department the subject belongs to
  department: one(departmentsTable, {
    fields: [subjectsTable.departmentId],
    references: [departmentsTable.id],
  }),

  // Fields (subjects) in the subject
  fields: many(fields),

  // courses for the subject
  courses: many(coursesTable),
}));

// Fields Relationships
export const fieldsRelations = relations(fields, ({ one, many }) => ({
  // subject this field belongs to
  subject: one(subjectsTable, {
    fields: [fields.subjectId],
    references: [subjectsTable.id],
  }),
}));

// courses Relationships
export const coursesRelations = relations(coursesTable, ({ one, many }) => ({
  // subject this course belongs to
  subject: one(subjectsTable, {
    fields: [coursesTable.subjectId],
    references: [subjectsTable.id],
  }),

  // Creator (teacher/instructor) of this course
  creator: one(usersTable, {
    fields: [coursesTable.lecturerId],
    references: [usersTable.id],
  }),

  // Sessions/periods in this course
  sessions: many(sessionsTable),

  // Students enrolled in this course (join table)
  enrollments: many(enrollmentsTable),

  // Payments for this course
  payments: many(paymentsTable),

  // Marks in this course
  marks: many(marksTable),
}));

// Roles Relationships
export const rolesTableRelations = relations(rolesTable, ({ many }) => ({
  // Users with this role
  users: many(usersTable),

  // Role permissions (for this role)
  permissions: many(rolePermissionsTable, {
    relationName: "rolePermissions",
  }),
}));

// Marks Relationships
export const marksTableRelations = relations(marksTable, ({ one }) => ({
  // Field associated with this mark
  cours: one(coursesTable, {
    fields: [marksTable.courseId],
    references: [coursesTable.id],
  }),

  // Student who received this mark
  student: one(usersTable, {
    fields: [marksTable.studentId],
    references: [usersTable.id],
    relationName: "studentMarks",
  }),
}));

// Sessions Relationships
export const sessionsRelations = relations(sessionsTable, ({ one, many }) => ({
  // course this session belongs to
  course: one(coursesTable, {
    fields: [sessionsTable.courseId],
    references: [coursesTable.id],
  }),

  // Attendance records for this session
  attendanceRecords: many(attendanceTable),
}));

// Attendance Relationships
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

// Students To courses (Join Table) Relationships
export const enrollmentsTableRelations = relations(
  enrollmentsTable,
  ({ one }) => ({
    // User in this enrollment
    user: one(usersTable, {
      fields: [enrollmentsTable.studentId],
      references: [usersTable.id],
    }),

    // course the student is enrolled in
    course: one(coursesTable, {
      fields: [enrollmentsTable.courseId],
      references: [coursesTable.id],
    }),
  })
);

// User To Department (Join Table) Relationships
export const userToDepartmentRelations = relations(
  userToDepartmentsTable,
  ({ one }) => ({
    // The user in this department membership
    user: one(usersTable, {
      fields: [userToDepartmentsTable.userId],
      references: [usersTable.id],
    }),

    // Department the user belongs to
    department: one(departmentsTable, {
      fields: [userToDepartmentsTable.departmentId],
      references: [departmentsTable.id],
    }),

    // The department role for this membership
    role: one(departmentRolesTable, {
      fields: [userToDepartmentsTable.departmentRoleId],
      references: [departmentRolesTable.id],
    }),
  })
);

// Department Roles Relationships
export const departmentRolesRelations = relations(
  departmentRolesTable,
  ({ many }) => ({
    // Users with this department role (via join table)
    userDepartments: many(userToDepartmentsTable),
    // Permissions associated with this department role
    permissions: many(departmentRolePermissionsTable, {
      relationName: "departmentRolePermissions",
      // fields: [departmentRolePermissionsTable.departmentRoleId],
      // references: [departmentRolesTable.id],
    }),
  })
);

// Guardian-Dependants Relationships
export const guardianDependantsRelations = relations(
  guardianDependantsTable,
  ({ one }) => ({
    // Guardian user
    guardian: one(usersTable, {
      fields: [guardianDependantsTable.guardianId],
      references: [usersTable.id],
      relationName: "guardianToDependents",
    }),

    // Dependent user
    dependent: one(usersTable, {
      fields: [guardianDependantsTable.dependentId],
      references: [usersTable.id],
      relationName: "dependentToGuardians",
    }),
  })
);

// (Optional) Role Permissions Relationship (if you want a reverse relation)
export const rolePermissionsRelations = relations(
  rolePermissionsTable,
  ({ one }) => ({
    role: one(rolesTable, {
      fields: [rolePermissionsTable.roleId],
      references: [rolesTable.id],
      relationName: "rolePermissions",
    }),
  })
);

// (Optional) User Permissions Relationship (if needed)
export const userPermissionsRelations = relations(
  userPermissionsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userPermissionsTable.userId],
      references: [usersTable.id],
    }),
  })
);

export const paymentsRelations = relations(paymentsTable, ({ one }) => ({
  // Student who received this mark
  user: one(usersTable, {
    fields: [paymentsTable.userId],
    references: [usersTable.id],
    relationName: "studentPayments",
  }),

  // cours this payment belongs to
  cours: one(coursesTable, {
    fields: [paymentsTable.courseId],
    references: [coursesTable.id],
  }),
}));
