import { faker } from "@faker-js/faker";
import db from "..";
import { slugify } from "@/utils";
import { departmentsTable } from "../schema";

export const generateUniqueSlug = (
  setSlugs: string[]
): { slug: string; name: string } => {
  while (true) {
    const name = faker.commerce.department();
    const slug = slugify(name);

    if (!setSlugs.includes(slug)) {
      setSlugs.push(slug);
      return { slug, name };
    }
  }
};

export async function departmentsSeeder(length: number) {
  await db.delete(departmentsTable);
  const setSlugs: string[] = [];
  const departments = Array.from({ length: length }, () => {
    const { name, slug } = generateUniqueSlug(setSlugs);
    return {
      name,
      slug,
    };
  });

  const inserteddepartments = await db
    .insert(departmentsTable)
    .values(departments)
    .returning();
  console.log(`${length} new department seeded!`);
  return inserteddepartments;
}
