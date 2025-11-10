import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

/**
 * Generate a unique, URL-safe token for display authentication
 * Uses nanoid for cryptographically strong random tokens
 */
export function generateDisplayToken(): string {
  // Generate a 32-character URL-safe token
  return nanoid(32);
}

/**
 * Validate a display token format
 * Ensures token is properly formatted and of sufficient length
 */
export function validateDisplayToken(token: any): boolean {
  // Check if token exists and is a string
  if (!token || typeof token !== "string") {
    return false;
  }

  // Check minimum length (32 characters)
  if (token.length < 32) {
    return false;
  }

  // Check if token contains only URL-safe characters (alphanumeric, -, _)
  const urlSafeRegex = /^[A-Za-z0-9_-]+$/;
  return urlSafeRegex.test(token);
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
