import { faker } from "@faker-js/faker";
import { slugify } from "@/utils";
import db from "@/db";
import { departmentsTable } from "@/db/schema";

interface DepartmentSeederOptions {
  batch?: number;
  customFields?: Record<string, (index: number) => any>;
}

export async function departmentsTableSeeder(
  count: number,
  options: DepartmentSeederOptions = {}
) {
  const { batch = 100, customFields = {} } = options;
  await db.delete(departmentsTable);
  console.log(`Seeding ${count} departments in batches of ${batch}...`);

  // Sample department names
  const departmentNames = [
    "Mathematics",
    "Science",
    "English",
    "History",
    "Computer Science",
    "Art",
    "Music",
    "Physical Education",
    "Foreign Languages",
    "Social Studies",
    "Economics",
    "Biology",
    "Chemistry",
    "Physics",
    "Geography",
    "Philosophy",
    "Psychology",
    "Sociology",
    "Political Science",
    "Engineering",
    "Media",
    "Education",
    "Law",
    "Health",
    "Business",
    "Drama",
    "Word Studies",
    "Worship Studies",
    "Skills Development",
    "Cybernetics",
    "Artificial Intelligence Studies",
    "Mythology and Folklore",
    "Space Exploration",
    "Astrobiology",
    "Quantum Computing",
    "Paranormal Studies",
    "Underwater Basket Weaving",
    "Robotic Ethics",
    "Time Travel Theory",
    "Dragon Training",
    "Alien Diplomacy",
    "Superhero Studies",
    "Clown Psychology",
    "Wand Crafting",
    "Potion Brewing",
    "Espionage and Spycraft",
    "Memetics",
    "Cryptozoology",
    "Dream Analysis",
    "Astrology and Cosmic Energies",
    "Post-Apocalyptic Survival",
  ];
  // Create a Set to keep track of used slugs to ensure uniqueness
  const usedSlugs = new Set<string>();

  for (let i = 0; i < count; i += batch) {
    const batchSize = Math.min(batch, count - i);
    const departmentData = Array.from({ length: batchSize }, (_, index) => {
      const actualIndex = i + index;
      let name = customFields.name?.(actualIndex);

      // If no custom name, pick from sample names or generate a random one
      if (!name) {
        if (actualIndex < departmentNames.length) {
          name = departmentNames[actualIndex];
        } else {
          name = `${faker.company.buzzNoun()} ${faker.company.buzzAdjective()} Department`;
        }
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

      return {
        name,
        slug,
        createdAt: customFields.createdAt?.(actualIndex) || faker.date.past(),
        updatedAt: customFields.updatedAt?.(actualIndex) || new Date(),
      };
    });

    console.log(
      `Inserting batch ${i / batch + 1} (${
        departmentData.length
      } departments)...`
    );
    await db.insert(departmentsTable).values(departmentData);
  }

  console.log(`Successfully seeded ${count} departments.`);
  return await db.select().from(departmentsTable);
}
