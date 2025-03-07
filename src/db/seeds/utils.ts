// utils.ts - Common utilities for seeders
import { faker } from "@faker-js/faker";
import { AttendanceName } from "@/types/attendance";
import { departmentUserRole, userRole } from "@/types/roles";
import { SeederOptions } from "./index";

/**
 * Splits an array into chunks of the specified size
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunked: T[][] = [];
  let index = 0;

  while (index < array.length) {
    chunked.push(array.slice(index, index + size));
    index += size;
  }

  return chunked;
}

/**
 * Generates a slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

/**
 * Logs progress if verbose option is enabled
 */
export function logProgress(message: string, options?: SeederOptions): void {
  if (options?.verbose !== false) {
    console.log(message);
  }
}

/**
 * Returns a random item from an array
 */
export function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Returns a random number of items from an array
 */
export function randomItems<T>(array: T[], min: number, max: number): T[] {
  const count = faker.number.int({ min, max });
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Generate hashed password for testing
 */
export function generatePasswordHash(): string {
  // This is just a placeholder - in a real app, you would use bcrypt
  return faker.internet.password({ length: 60 }); // Simulating a bcrypt hash
}
