import { describe, it, expect, beforeEach } from "vitest";
import {
  generateDisplayToken,
  validateDisplayToken,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

describe("Authentication", () => {
  describe("Display Token Generation", () => {
    it("should generate a unique token", () => {
      const token1 = generateDisplayToken();
      const token2 = generateDisplayToken();

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
    });

    it("should generate tokens of sufficient length", () => {
      const token = generateDisplayToken();

      // Should be at least 32 characters for security
      expect(token.length).toBeGreaterThanOrEqual(32);
    });

    it("should generate URL-safe tokens", () => {
      const token = generateDisplayToken();

      // Should only contain URL-safe characters
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });

  describe("Display Token Validation", () => {
    it("should validate a correctly formatted token", () => {
      const token = generateDisplayToken();

      expect(validateDisplayToken(token)).toBe(true);
    });

    it("should reject empty tokens", () => {
      expect(validateDisplayToken("")).toBe(false);
    });

    it("should reject tokens that are too short", () => {
      expect(validateDisplayToken("short")).toBe(false);
    });

    it("should reject tokens with invalid characters", () => {
      expect(validateDisplayToken("invalid token with spaces")).toBe(false);
      expect(validateDisplayToken("invalid@token#chars")).toBe(false);
    });

    it("should reject null or undefined tokens", () => {
      expect(validateDisplayToken(null as any)).toBe(false);
      expect(validateDisplayToken(undefined as any)).toBe(false);
    });
  });

  describe("Password Hashing", () => {
    it("should hash a password", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should generate different hashes for the same password", async () => {
      const password = "testPassword123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      // Due to salting, hashes should be different
      expect(hash1).not.toBe(hash2);
    });

    it("should handle empty passwords", async () => {
      await expect(hashPassword("")).rejects.toThrow();
    });
  });

  describe("Password Verification", () => {
    it("should verify a correct password", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const password = "testPassword123";
      const wrongPassword = "wrongPassword456";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it("should be case-sensitive", async () => {
      const password = "TestPassword123";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword("testpassword123", hash);
      expect(isValid).toBe(false);
    });

    it("should reject empty password verification", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword("", hash);
      expect(isValid).toBe(false);
    });
  });
});
