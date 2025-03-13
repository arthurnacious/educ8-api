import { faker } from "@faker-js/faker";
import db from "@/db";
import { coursesTable, departmentsTable } from "@/db/schema";
import { slugify } from "@/utils";

interface CourseSeederOptions {
  batch?: number;
  customFields?: Record<string, (index: number) => any>;
}

export async function coursesTableSeeder(
  count: number,
  options: CourseSeederOptions = {}
) {
  const { batch = 100, customFields = {} } = options;
  await db.delete(coursesTable);
  console.log(`Seeding ${count} courses in batches of ${batch}...`);

  // Get all departments
  const departments = await db.select().from(departmentsTable);

  if (departments.length === 0) {
    console.error("No departments found. Please seed departments first.");
    return;
  }

  // Sample course names
  const courseNames = [
    "Introduction to",
    "Advanced",
    "Principles of",
    "Fundamentals of",
    "Topics in",
    "Research Methods for",
    "Applied",
    "Theoretical",
    "Contemporary Issues in",
    "Analysis of",
  ];

  const courseSubjects = [
    "Algebra",
    "Calculus",
    "Statistics",
    "Programming",
    "Literature",
    "World History",
    "Chemistry",
    "Physics",
    "Biology",
    "Economics",
    "Psychology",
    "Sociology",
    "Political Science",
    "Art History",
    "Music Theory",
    "Creative Writing",
    "Philosophy",
    "Ethics",
  ];

  // Create a Set to keep track of used slugs to ensure uniqueness
  const usedSlugs = new Set<string>();

  for (let i = 0; i < count; i += batch) {
    const batchSize = Math.min(batch, count - i);
    const courseData = Array.from({ length: batchSize }, (_, index) => {
      const actualIndex = i + index;

      // Generate a course name or use custom
      let name = customFields.name?.(actualIndex);
      if (!name) {
        const prefix =
          courseNames[Math.floor(Math.random() * courseNames.length)];
        const subject =
          courseSubjects[Math.floor(Math.random() * courseSubjects.length)];
        name = `${prefix} ${subject}`;
      }

      // Generate a unique slug
      let slug =
        customFields.slug?.(actualIndex) || slugify(name, { lower: true });

      // Ensure slug uniqueness by adding a number if necessary
      let counter = 1;
      let baseSlug = slug;
      while (usedSlugs.has(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      usedSlugs.add(slug);

      // Assign to a random department
      const department =
        departments[Math.floor(Math.random() * departments.length)];

      return {
        departmentId: department.id,
        name,
        slug,
        description:
          customFields.description?.(actualIndex) ||
          faker.lorem.paragraphs({ min: 1, max: 3 }),
        createdAt: customFields.createdAt?.(actualIndex) || faker.date.past(),
        updatedAt: customFields.updatedAt?.(actualIndex) || new Date(),
      };
    });

    console.log(
      `Inserting batch ${i / batch + 1} (${courseData.length} courses)...`
    );
    await db.insert(coursesTable).values(courseData);
  }

  console.log(`Successfully seeded ${count} courses.`);
  return await db.select().from(coursesTable);
}
