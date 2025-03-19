import db from "@/db";
import { usersTable, guardianDependantsTable } from "@/db/schema";
import { faker } from "@faker-js/faker";

interface SeederOptions {
  batch?: number;
  customFields?: Record<string, (index: number) => any>;
}

export async function guardianDependantsSeeder(
  count: number,
  options: SeederOptions = {}
) {
  const { batch = 100, customFields = {} } = options;

  await db.delete(guardianDependantsTable);
  console.log(
    `Seeding ${count} guardian-dependent relationships in batches of ${batch}...`
  );

  const users = await db.select().from(usersTable);

  if (users.length === 0) {
    console.error("No users found. Please seed users first.");
    return;
  }

  const userIds = users.map(({ id }) => id);

  // Set to track unique combinations
  const usedCombinations = new Set();
  const generatedRelationships = [];

  // Generate unique combinations
  while (generatedRelationships.length < count) {
    const guardianId = faker.helpers.arrayElement(userIds);
    const dependentId = faker.helpers.arrayElement(userIds);

    // Skip if guardian and dependent are the same user or if combination already exists
    const combinationKey = `${guardianId}-${dependentId}`;
    if (guardianId === dependentId || usedCombinations.has(combinationKey)) {
      continue;
    }

    // Add to tracking set
    usedCombinations.add(combinationKey);

    // Create the relationship
    generatedRelationships.push({
      guardianId,
      dependentId,
    });

    // If we've reached the maximum possible combinations, break
    const maxPossibleCombinations = userIds.length * (userIds.length - 1);
    if (usedCombinations.size === maxPossibleCombinations) {
      console.log(
        `Maximum possible combinations reached: ${usedCombinations.size}`
      );
      break;
    }
  }

  // Insert in batches
  for (let i = 0; i < generatedRelationships.length; i += batch) {
    const relationshipBatch = generatedRelationships.slice(i, i + batch);
    console.log(
      `Inserting batch ${Math.floor(i / batch) + 1} (${
        relationshipBatch.length
      } relationships)...`
    );
    await db.insert(guardianDependantsTable).values(relationshipBatch);
  }

  console.log(
    `Successfully seeded ${generatedRelationships.length} guardian-dependent relationships.`
  );
}
