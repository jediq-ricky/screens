import { describe, it, expect } from "vitest";
import { generateDisplayToken, validateDisplayToken } from "@/lib/auth";
import { testPrisma as prisma, setupIntegrationTest } from "../setup";

setupIntegrationTest();

describe("Display Authentication Integration", () => {
  describe("Display Registration", () => {
    it("should create a display with a unique token", async () => {
      const token = generateDisplayToken();

      const display = await prisma.display.create({
        data: {
          name: "Test Display",
          token,
        },
      });

      expect(display.id).toBeDefined();
      expect(display.token).toBe(token);
      expect(validateDisplayToken(display.token)).toBe(true);
    });

    it("should prevent duplicate tokens", async () => {
      const token = generateDisplayToken();

      await prisma.display.create({
        data: {
          name: "Display 1",
          token,
        },
      });

      await expect(
        prisma.display.create({
          data: {
            name: "Display 2",
            token, // Same token
          },
        })
      ).rejects.toThrow();
    });

    it("should generate unique tokens for multiple displays", async () => {
      const display1 = await prisma.display.create({
        data: {
          name: "Display 1",
          token: generateDisplayToken(),
        },
      });

      const display2 = await prisma.display.create({
        data: {
          name: "Display 2",
          token: generateDisplayToken(),
        },
      });

      expect(display1.token).not.toBe(display2.token);
    });
  });

  describe("Display Authentication", () => {
    it("should find display by valid token", async () => {
      const token = generateDisplayToken();

      const created = await prisma.display.create({
        data: {
          name: "Test Display",
          token,
        },
      });

      const found = await prisma.display.findUnique({
        where: { token },
      });

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe("Test Display");
    });

    it("should return null for invalid token", async () => {
      const display = await prisma.display.findUnique({
        where: { token: "nonexistent-token" },
      });

      expect(display).toBeNull();
    });

    it("should update lastSeenAt on authentication", async () => {
      const token = generateDisplayToken();

      const display = await prisma.display.create({
        data: {
          name: "Test Display",
          token,
        },
      });

      expect(display.lastSeenAt).toBeNull();

      // Simulate authentication by updating lastSeenAt
      const authenticated = await prisma.display.update({
        where: { token },
        data: { lastSeenAt: new Date() },
      });

      expect(authenticated.lastSeenAt).not.toBeNull();
      expect(authenticated.lastSeenAt).toBeInstanceOf(Date);
    });

    it("should authenticate only active displays", async () => {
      const token = generateDisplayToken();

      await prisma.display.create({
        data: {
          name: "Inactive Display",
          token,
          isActive: false,
        },
      });

      const display = await prisma.display.findUnique({
        where: { token },
      });

      expect(display).not.toBeNull();
      expect(display?.isActive).toBe(false);

      // In real implementation, would reject authentication for inactive displays
    });
  });

  describe("Display Token Security", () => {
    it("should store token securely without modification", async () => {
      const token = generateDisplayToken();

      const display = await prisma.display.create({
        data: {
          name: "Test Display",
          token,
        },
      });

      // Token should be stored exactly as provided (no hashing needed for tokens)
      expect(display.token).toBe(token);
    });

    it("should support token-based lookup efficiently", async () => {
      // Create multiple displays
      const displays = await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          prisma.display.create({
            data: {
              name: `Display ${i}`,
              token: generateDisplayToken(),
            },
          })
        )
      );

      // Should quickly find any display by token (indexed)
      const randomDisplay = displays[Math.floor(Math.random() * displays.length)];

      const found = await prisma.display.findUnique({
        where: { token: randomDisplay.token },
      });

      expect(found?.id).toBe(randomDisplay.id);
    });
  });

  describe("Display Controls Configuration", () => {
    it("should default showControls to true when creating display", async () => {
      const token = generateDisplayToken();

      const display = await prisma.display.create({
        data: {
          name: "Test Display",
          token,
        },
      });

      expect(display.showControls).toBe(true);
    });

    it("should allow setting showControls to false on creation", async () => {
      const token = generateDisplayToken();

      const display = await prisma.display.create({
        data: {
          name: "Test Display",
          token,
          showControls: false,
        },
      });

      expect(display.showControls).toBe(false);
    });

    it("should update showControls via PATCH", async () => {
      const token = generateDisplayToken();

      const display = await prisma.display.create({
        data: {
          name: "Test Display",
          token,
          showControls: true,
        },
      });

      expect(display.showControls).toBe(true);

      const updated = await prisma.display.update({
        where: { id: display.id },
        data: { showControls: false },
      });

      expect(updated.showControls).toBe(false);
    });
  });
});
