import { PrismaClient } from "@/lib/generated/prisma";
import { beforeEach, afterAll } from "vitest";

// Shared Prisma client for all integration tests
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
    },
  },
});

// Helper to clean database between tests
export async function cleanDatabase() {
  await testPrisma.playlistItem.deleteMany();
  await testPrisma.playlist.deleteMany();
  await testPrisma.display.deleteMany();
  await testPrisma.video.deleteMany();
}

// Setup for integration tests
export function setupIntegrationTest() {
  beforeEach(async () => {
    await cleanDatabase();
  });
}

// Global teardown
afterAll(async () => {
  await cleanDatabase();
  await testPrisma.$disconnect();
});
