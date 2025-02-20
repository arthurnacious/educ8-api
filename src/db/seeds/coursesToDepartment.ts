import db from "../";
import { coursesToDepartments } from "../schema";

export async function coursesToDepartmentsSeeder(count = 300) {
  console.log(`Starting courses to academies seeding (${count} records)...`);

  // Get all courses
  const courses = await db.query.coursesTable.findMany({
    columns: { id: true },
  });

  if (courses.length === 0) {
    console.log("No courses found. Please seed courses first.");
    return;
  }

  // Get all departments
  const departments = await db.query.departmentsTable.findMany({
    columns: { id: true },
  });

  if (departments.length === 0) {
    console.log("No departments found. Please seed departments first.");
    return;
  }

  console.log(
    `Found ${courses.length} courses and ${departments.length} departments for mapping`
  );

  // Create a set to track unique course-department pairs
  const uniquePairs = new Set();
  const coursesToDepartmentsData = [];

  // Generate unique course-department mappings
  let attempts = 0;
  const maxAttempts = count * 2; // Avoid infinite loop

  while (coursesToDepartmentsData.length < count && attempts < maxAttempts) {
    const courseId = courses[Math.floor(Math.random() * courses.length)].id;
    const departmentId =
      departments[Math.floor(Math.random() * departments.length)].id;
    const pairKey = `${courseId}-${departmentId}`;

    if (!uniquePairs.has(pairKey)) {
      uniquePairs.add(pairKey);
      coursesToDepartmentsData.push({
        courseId,
        departmentId,
      });
    }

    attempts++;
  }

  // Insert in batches of 100
  const batchSize = 100;
  let totalInserted = 0;

  for (let i = 0; i < coursesToDepartmentsData.length; i += batchSize) {
    const batch = coursesToDepartmentsData.slice(i, i + batchSize);
    await db.insert(coursesToDepartments).values(batch);
    totalInserted += batch.length;
    console.log(
      `Batch inserted: ${batch.length} course-department mappings (Total: ${totalInserted}/${coursesToDepartmentsData.length})`
    );
  }

  console.log(
    `Seeding complete: ${totalInserted} course-department mappings inserted in batches`
  );
}
