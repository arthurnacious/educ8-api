import { faker } from "@faker-js/faker";
import db from "@/db";
import { subjectsTable, departmentsTable } from "@/db/schema";
import { slugify } from "@/utils";

interface SubjectSeederOptions {
  batch?: number;
  customFields?: Record<string, (index: number) => any>;
}

export async function subjectsTableSeeder(
  count: number,
  options: SubjectSeederOptions = {}
) {
  const { batch = 100, customFields = {} } = options;
  await db.delete(subjectsTable);
  console.log(`Seeding ${count} subjects in batches of ${batch}...`);

  // Get all departments
  const departments = await db.select().from(departmentsTable);

  if (departments.length === 0) {
    console.error("No departments found. Please seed departments first.");
    return;
  }

  // Sample subject names
  const subjectNames = [
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

  const subjectSubjects = [
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
    const subjectData = Array.from({ length: batchSize }, (_, index) => {
      const actualIndex = i + index;

      // Generate a subject name or use custom
      let name = customFields.name?.(actualIndex);
      if (!name) {
        const prefix =
          subjectNames[Math.floor(Math.random() * subjectNames.length)];
        const subject =
          subjectSubjects[Math.floor(Math.random() * subjectSubjects.length)];
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
      `Inserting batch ${i / batch + 1} (${subjectData.length} subjects)...`
    );
    await db.insert(subjectsTable).values(subjectData);
  }

  console.log(`Successfully seeded ${count} subjects.`);
  return await db.select().from(subjectsTable);
}
