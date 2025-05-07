import { auditLogsTable, usersTable } from "@/db/schema";
import db from "@/db";
import { faker } from "@faker-js/faker";

interface AuditLogSeederOptions {
  batch?: number;
  customFields?: Record<string, (index: number) => any>;
}

function generateRandomJson() {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      country: faker.location.country(),
    },
    createdAt: faker.date.past(),
    isActive: faker.datatype.boolean(),
  };
}

export async function auditLogsTableSeeder(
  count: number,
  options: AuditLogSeederOptions = {}
) {
  const { batch = 100, customFields = {} } = options;
  await db.delete(auditLogsTable);
  console.log(`Seeding ${count} audit logs in batches of ${batch}...`);

  // Get all users
  let users = await db.select().from(usersTable);
  if (users.length === 0) {
    console.warn("No users found! Seed users first.");
    return [];
  }

  const actions = ["created", "updated", "deleted", "assigned", "unassigned"];
  const models = ["users", "subjects", "departments", "courses", "roles"];

  for (let i = 0; i < count; i += batch) {
    const batchSize = Math.min(batch, count - i);

    const auditLogData = Array.from({ length: batchSize }, (_, index) => {
      const action = actions[Math.floor(Math.random() * actions.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      const modelId = action === "create" ? null : faker.string.uuid();

      return {
        userId: faker.helpers.arrayElement(users).id,
        action,
        model,
        modelId,
        before: generateRandomJson(),
        after: generateRandomJson(),
        createdAt: faker.date.past(),
      };
    });

    console.log(
      `Inserting batch ${i / batch + 1} (${auditLogData.length} audit logs)...`
    );
    await db.insert(auditLogsTable).values(auditLogData);
  }

  console.log(`Successfully seeded ${count} audit logs.`);
  return await db.select().from(auditLogsTable);
}
