import { faker } from "@faker-js/faker";
import db from "..";
import { fields, coursesTable } from "../schema";

const fieldNames = [
  "Theory",
  "Practical",
  "Applied",
  "Advanced",
  "Mission",
  "Thesis",
  "Exam",
  "Test",
  "Project",
  "Assignment",
  "Quiz",
  "Homework",
  "Lab",
  "Lecture",
  "Seminar",
  "Workshop",
  "Presentation",
  "Discussion",
  "Debate",
  "Class",
  "Group",
  "Meeting",
  "Conference",
  "Online",
  "Based",
  "Basics",
  "Course",
  "Capstone",
  "Internship",
  "Case Study",
  "Fieldwork",
  "Research",
  "Simulation",
  "Experiment",
  "Assessment",
  "Certification",
  "Bootcamp",
  "Module",
  "Clinic",
  "Peer Review",
  "Recitation",
  "Studio",
  "Roundtable",
  "Drill",
  "Analysis",
  "Workshop Series",
  "Colloquium",
  "Intensive",
  "Masterclass",
  "Review",
  "Strategy",
  "Focus Group",
  "Synthesis",
  "Mentorship",
  "Competency",
  "Experiential Learning",
  "Industry Training",
  "Self-Paced",
  "Interactive",
  "Comprehensive",
];

export async function fieldsSeeder(fieldsPerCourse: number) {
  if (typeof fieldsPerCourse !== "number" || isNaN(fieldsPerCourse)) {
    throw new Error("fieldsPerCourse must be a valid number.");
  }
  console.log("Starting fields seeding...");

  // Clear existing fields
  await db.delete(fields);

  // Get all course IDs
  const courses = await db.select({ id: coursesTable.id }).from(coursesTable);

  if (courses.length === 0) {
    console.log("No courses found. Please seed courses first.");
    return;
  }

  const fieldsData = [];

  // Function to generate a unique field name
  const generateUniqueName = (usedNames: Set<string>): string => {
    let fieldName = faker.helpers.arrayElement(fieldNames);
    let attempts = 0;

    while (usedNames.has(fieldName) && attempts < 5) {
      fieldName = faker.helpers.arrayElement(fieldNames);
      attempts++;
    }

    // Append index if still not unique
    if (usedNames.has(fieldName)) {
      fieldName = `${fieldName} ${usedNames.size}`;
    }

    usedNames.add(fieldName);
    return fieldName;
  };

  // Create fields for each course
  for (const course of courses) {
    const usedNames = new Set<string>();

    for (let i = 0; i < fieldsPerCourse; i++) {
      fieldsData.push({
        courseId: course.id,
        name: generateUniqueName(usedNames),
      });
    }

    console.log(
      `Generated ${fieldsPerCourse} fields for course ID: ${course.id}`
    );
  }

  // Insert fields in batches of 100
  const batchSize = 100;
  let totalInserted = 0;

  for (let i = 0; i < fieldsData.length; i += batchSize) {
    const batch = fieldsData.slice(i, i + batchSize);
    await db.insert(fields).values(batch);

    totalInserted += batch.length;
    console.log(
      `Batch inserted: ${batch.length} records (Total: ${totalInserted}/${fieldsData.length})`
    );
  }

  console.log(`Seeding complete: ${totalInserted} fields inserted in batches!`);
}
