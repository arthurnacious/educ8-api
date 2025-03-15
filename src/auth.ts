import { pbkdf2Sync, randomBytes } from "crypto";

export function hash(password: string): string {
  // Generate a random salt
  const salt = randomBytes(16).toString("hex");
  // Hash the password with the salt
  const hash = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  // Return the salt and hash together
  return `${salt}:${hash}`;
}

export function verify(password: string, storedHash: string): boolean {
  // Split the stored hash into salt and hash
  const [salt, storedPasswordHash] = storedHash.split(":");
  // Hash the provided password with the stored salt
  const checkHash = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString(
    "hex"
  );
  // Compare the hashes and return true if they match
  return storedPasswordHash === checkHash;
}
