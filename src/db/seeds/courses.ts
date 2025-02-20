import { faker } from "@faker-js/faker";
import db from "..";
import { slugify } from "@/utils";
import { coursesTable } from "../schema";

const generateUniqueSlug = (
  existingSlugs: Set<string>
): { slug: string; name: string } => {
  // Set maximum attempts to avoid infinite loops
  const maxAttempts = 100;
  let attempts = 0;
  while (attempts < maxAttempts) {
    attempts++;
    const name = faker.commerce.department();
    const slug = slugify(name);
    if (!existingSlugs.has(slug)) {
      existingSlugs.add(slug);
      return { slug, name };
    }
    // Try with a random suffix if base name is taken
    const slugWithSuffix = `${slug}-${Math.floor(Math.random() * 1000)}`;
    if (!existingSlugs.has(slugWithSuffix)) {
      existingSlugs.add(slugWithSuffix);
      return { slug: slugWithSuffix, name };
    }
  }
  // Fallback: use timestamp for guaranteed uniqueness
  const timestamp = Date.now();
  const fallbackName = `Course ${timestamp}`;
  const fallbackSlug = `course-${timestamp}`;
  existingSlugs.add(fallbackSlug);
  return { slug: fallbackSlug, name: fallbackName };
};

export async function coursesSeeder(length: number) {
  await db.delete(coursesTable);

  // Get all department IDs upfront to reduce DB queries
  const departments = await db.query.departmentsTable.findMany({
    columns: { id: true },
  });

  if (departments.length === 0) {
    console.log("No departments found. Please seed departments first.");
    return;
  }

  const existingSlugs = new Set<string>();
  const batchSize = 100;
  let totalInserted = 0;

  while (totalInserted < length) {
    // Calculate current batch size
    const currentBatchSize = Math.min(batchSize, length - totalInserted);
    const coursesData = [];

    // Generate the current batch of courses
    for (let i = 0; i < currentBatchSize; i++) {
      // Randomly select a department
      const department =
        departments[Math.floor(Math.random() * departments.length)];
      const { slug, name } = generateUniqueSlug(existingSlugs);

      coursesData.push({
        name,
        slug,
        departmentId: department.id,
        description: faker.lorem.paragraph(),
      });
    }

    // Insert current batch
    await db.insert(coursesTable).values(coursesData);

    totalInserted += currentBatchSize;
    console.log(
      `Batch inserted: ${currentBatchSize} courses (Total: ${totalInserted}/${length})`
    );
  }

  console.log(
    `Seeding complete: ${totalInserted} courses inserted in batches of ${batchSize}`
  );
}
