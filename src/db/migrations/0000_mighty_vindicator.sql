CREATE TYPE "public"."attendance_status" AS ENUM('Present', 'Late', 'Absent', 'Sick');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'eft', 'payment_gateway');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('Admin', 'Department Leader', 'Lecturer', 'Finance', 'Student');--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"studentId" varchar(255) NOT NULL,
	"periodId" varchar(255) NOT NULL,
	"type" "attendance_status" DEFAULT 'Present' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"departmentId" varchar(255) NOT NULL,
	"name" varchar(255),
	"slug" varchar(255) NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "course_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "courseToAcademy" (
	"courseId" varchar(255) NOT NULL,
	"departmentId" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departmentLeadersToAcademy" (
	"departmentId" varchar(255) NOT NULL,
	"departmentLeaderId" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "departments_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "field" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"courseId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lecturerToAcademy" (
	"departmentId" varchar(255) NOT NULL,
	"lecturerId" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessonRoster" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"courseId" varchar(255) NOT NULL,
	"creatorId" varchar(255) NOT NULL,
	"name" varchar(255),
	"slug" varchar(255) NOT NULL,
	"notes" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "lessonRoster_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "mark" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"fieldId" varchar(255) NOT NULL,
	"studentId" varchar(255) NOT NULL,
	"amount" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"lessonRosterId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studentToLessonRoster" (
	"studentId" varchar(255) NOT NULL,
	"lessonRosterId" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"emailVerified" timestamp,
	"password_hash" varchar(255),
	"role" "user_role" NOT NULL,
	"image" varchar(255),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_studentId_users_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_periodId_sessions_id_fk" FOREIGN KEY ("periodId") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_departmentId_departments_id_fk" FOREIGN KEY ("departmentId") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courseToAcademy" ADD CONSTRAINT "courseToAcademy_courseId_course_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courseToAcademy" ADD CONSTRAINT "courseToAcademy_departmentId_departments_id_fk" FOREIGN KEY ("departmentId") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departmentLeadersToAcademy" ADD CONSTRAINT "departmentLeadersToAcademy_departmentId_departments_id_fk" FOREIGN KEY ("departmentId") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departmentLeadersToAcademy" ADD CONSTRAINT "departmentLeadersToAcademy_departmentLeaderId_users_id_fk" FOREIGN KEY ("departmentLeaderId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field" ADD CONSTRAINT "field_courseId_course_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lecturerToAcademy" ADD CONSTRAINT "lecturerToAcademy_departmentId_departments_id_fk" FOREIGN KEY ("departmentId") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lecturerToAcademy" ADD CONSTRAINT "lecturerToAcademy_lecturerId_users_id_fk" FOREIGN KEY ("lecturerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessonRoster" ADD CONSTRAINT "lessonRoster_courseId_course_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessonRoster" ADD CONSTRAINT "lessonRoster_creatorId_users_id_fk" FOREIGN KEY ("creatorId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mark" ADD CONSTRAINT "mark_fieldId_field_id_fk" FOREIGN KEY ("fieldId") REFERENCES "public"."field"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mark" ADD CONSTRAINT "mark_studentId_users_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_lessonRosterId_lessonRoster_id_fk" FOREIGN KEY ("lessonRosterId") REFERENCES "public"."lessonRoster"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studentToLessonRoster" ADD CONSTRAINT "studentToLessonRoster_studentId_users_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studentToLessonRoster" ADD CONSTRAINT "studentToLessonRoster_lessonRosterId_lessonRoster_id_fk" FOREIGN KEY ("lessonRosterId") REFERENCES "public"."lessonRoster"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_role" ON "users" USING btree ("role");