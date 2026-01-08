import { beforeEach, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import type { DeepMockProxy } from 'jest-mock-extended';

// Create a mock for Prisma Client
export const prismaMock = {
  manager: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  staff: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  product: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  initiative: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  allocation: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
  },
} as unknown as DeepMockProxy<PrismaClient>;

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Mock the prisma module
vi.mock('../config/database.js', () => ({
  default: prismaMock
}));
