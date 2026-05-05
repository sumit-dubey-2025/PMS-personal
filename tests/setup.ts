import { vi } from 'vitest';
import '@testing-library/jest-dom';

/**
 * Global test setup for all test files.
 * Mocks auth, API functions, and server actions.
 */

// Mock auth() — returns a consistent test session
vi.mock('@/auth', () => ({
  auth: vi.fn(async () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      image: null,
      groups: ['test-admin-group-id'],
    },
  })),
}));

// Mock all storageConfig API functions
vi.mock('@/lib/api/storageConfig', () => ({
  getStorageConfig: vi.fn(),
  testStorageConnection: vi.fn(),
  saveStorageConfig: vi.fn(),
  initialiseStorageSchema: vi.fn(),
  initialiseStorageSchemaForList: vi.fn(),
  getSchemaJobStatus: vi.fn(),
  runHealthCheck: vi.fn(),
  toSchemaStatus: vi.fn(),
}));

// Mock server actions
vi.mock('@/app/actions/auth', () => ({
  signInWithMicrosoft: vi.fn(),
}));

// Mock next/router if needed
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));
