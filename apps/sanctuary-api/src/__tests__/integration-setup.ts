// Integration Test Setup
// This file configures Vitest for real database/Cedar integration tests
// Run with: pnpm test:integration

import { randomUUID } from 'node:crypto';
import { createZenStackDb, executeDatabaseCommand, queryDatabaseRows } from '@repo/database/client';
import { check as checkCedar } from '@repo/policies';
import { afterAll, beforeAll } from 'vitest';

type IntegrationEnvironment = {
  apiUrl: string;
  authToken: string;
  databaseUrl: string;
};

function requireIntegrationEnvironment(): IntegrationEnvironment {
  const databaseUrl = process.env.TEST_DATABASE_URL;
  const apiUrl = process.env.TEST_API_URL;
  const authToken = process.env.TEST_AUTH_TOKEN;
  const missing = [
    !databaseUrl && 'TEST_DATABASE_URL',
    !apiUrl && 'TEST_API_URL',
    !authToken && 'TEST_AUTH_TOKEN',
  ].filter((name): name is string => Boolean(name));

  if (missing.length > 0) {
    throw new Error(
      `Integration tests require ${missing.join(', ')}. Start isolated local Supabase, configure a real test identity, and target the running test API.`,
    );
  }

  if (authToken === 'mock-token') {
    throw new Error(
      'TEST_AUTH_TOKEN must be a signed test JWT, not the retired mock-token fallback.',
    );
  }

  const parsedDatabaseUrl = new URL(databaseUrl);
  if (!/(?:^|[_-])(test|local)(?:[_-]|$)/i.test(parsedDatabaseUrl.pathname)) {
    throw new Error('TEST_DATABASE_URL must target an explicitly named local or test database.');
  }

  return { apiUrl, authToken, databaseUrl };
}

const testRunPrefix = `api-it-${randomUUID()}`;
let integrationEnvironment: IntegrationEnvironment | null = null;

// Global test database instance
let testDb: ReturnType<typeof createZenStackDb> | null = null;

// Setup real database connection
beforeAll(async () => {
  integrationEnvironment = requireIntegrationEnvironment();

  try {
    testDb = createZenStackDb(
      { id: `${testRunPrefix}-system` },
      integrationEnvironment.databaseUrl,
    );

    await executeDatabaseCommand('select 1', [], integrationEnvironment.databaseUrl);
  } catch (error) {
    throw new Error('Integration test database connection failed.', { cause: error });
  }
});

// Cleanup after all tests
afterAll(async () => {
  if (testDb) {
    // Clean up test data
    try {
      await queryDatabaseRows(
        'DELETE FROM public.users WHERE id LIKE $1',
        [`${testRunPrefix}%`],
        integrationEnvironment?.databaseUrl,
      );
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }
  }
});

// Export test utilities
export const integrationTest = {
  db: () => testDb,
  environment: () => {
    if (!integrationEnvironment) throw new Error('Integration environment is not initialized.');
    return integrationEnvironment;
  },
  cedar: checkCedar,
  queryRows: async <T>(sql: string, params: readonly unknown[] = []) => {
    if (!testDb) throw new Error('Test database not initialized');
    return queryDatabaseRows<T>(sql, params, integrationEnvironment?.databaseUrl);
  },
};

// Helper to create test user with bond
export async function createTestUserWithBond(
  capacity: string = 'teacher',
  entityType: string = 'SCHOOL',
  entityId: string = `${testRunPrefix}-school-${randomUUID()}`,
) {
  const databaseUrl = integrationTest.environment().databaseUrl;
  const userId = `${testRunPrefix}-user-${randomUUID()}`;

  await queryDatabaseRows(
    `
      INSERT INTO public.users (id, email, full_name, onboarding_completed, onboarding_state)
      VALUES ($1, $2, $3, true, 'COMPLETED')
    `,
    [userId, `test-${userId}@example.com`, 'Test User'],
    databaseUrl,
  );

  const bondId = `${testRunPrefix}-bond-${randomUUID()}`;
  await queryDatabaseRows(
    `
      INSERT INTO public.bonds (id, user_id, entity_type, entity_id, capacity, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    `,
    [bondId, userId, entityType, entityId, capacity],
    databaseUrl,
  );

  return { userId, bondId, entityId };
}

// Helper to clean up test data
export async function cleanupTestData(userId: string) {
  const databaseUrl = integrationTest.environment().databaseUrl;
  await queryDatabaseRows(
    `
      DELETE FROM public.bonds WHERE user_id = $1;
      DELETE FROM public.users WHERE id = $1;
    `,
    [userId],
    databaseUrl,
  );
}
