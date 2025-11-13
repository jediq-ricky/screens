import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

/**
 * Generate a unique, short token for display authentication
 * Uses 5 random hex characters for easy manual entry
 */
export function generateDisplayToken(): string {
  // Generate a random 5-character hex string
  const bytes = Math.floor(Math.random() * 0xFFFFF);
  return bytes.toString(16).padStart(5, '0');
}

/**
 * Validate a display token format
 * Ensures token is properly formatted (5 hex characters)
 */
export function validateDisplayToken(token: any): boolean {
  // Check if token exists and is a string
  if (!token || typeof token !== "string") {
    return false;
  }

  // Check length (5 characters)
  if (token.length !== 5) {
    return false;
  }

  // Check if token contains only hex characters (0-9, a-f)
  const hexRegex = /^[0-9a-f]{5}$/;
  return hexRegex.test(token);
}

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length === 0) {
    throw new Error("Password cannot be empty");
  }

  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param hash - Hashed password to compare against
 * @returns True if password matches hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  if (!password || !hash) {
    return false;
  }

  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    return false;
  }
}
