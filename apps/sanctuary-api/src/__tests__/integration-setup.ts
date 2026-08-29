// Integration Test Setup
// This file configures Vitest for real database/Cedar integration tests
// Run with: pnpm test:integration

import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { createZenStackDb, queryDatabaseRows, executeDatabaseCommand } from '@repo/database/client';
import { check as checkCedar } from '@repo/policies';

// Test database configuration
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 
  'postgresql://test_user:test_pass@localhost:5432/sanctuary_test?schema=public';

// Global test database instance
let testDb: ReturnType<typeof createZenStackDb> | null = null;
let testUserId = 'test-user-' + Date.now();

// Setup real database connection
beforeAll(async () => {
  if (!process.env.TEST_DATABASE_URL) {
    console.warn('TEST_DATABASE_URL not set, skipping integration tests');
    return;
  }
  
  try {
    // Create test database connection
    testDb = createZenStackDb(
      { id: testUserId },
      TEST_DATABASE_URL
    );
    
    // Run migrations or setup schema
    await executeDatabaseCommand(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);
    
    console.log('✅ Integration test database connected');
  } catch (error) {
    console.error('❌ Failed to connect to integration test database:', error);
    throw error;
  }
});

// Cleanup after all tests
afterAll(async () => {
  if (testDb) {
    // Clean up test data
    try {
      await queryDatabaseRows(`
        DELETE FROM public.users WHERE id LIKE 'test-user-%';
      `);
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }
  }
});

// Per-test setup
beforeEach(() => {
  // Reset any per-test state
});

// Per-test cleanup
afterEach(() => {
  // Clean up per-test data
});

// Export test utilities
export const integrationTest = {
  db: () => testDb,
  userId: () => testUserId,
  cedar: checkCedar,
  queryRows: async <T>(sql: string, params: any[] = []) => {
    if (!testDb) throw new Error('Test database not initialized');
    return queryDatabaseRows<T>(sql, params);
  },
};

// Helper to create test user with bond
export async function createTestUserWithBond(
  capacity: string = 'teacher',
  entityType: string = 'SCHOOL',
  entityId: string = 'test-school-' + Date.now()
) {
  const userId = 'test-user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  
  await queryDatabaseRows(`
    INSERT INTO public.users (id, email, full_name, onboarding_completed, onboarding_state)
    VALUES ($1, $2, $3, true, 'COMPLETED')
  `, [userId, `test-${userId}@example.com`, 'Test User']);
  
  const bondId = 'test-bond-' + Date.now();
  await queryDatabaseRows(`
    INSERT INTO public.bonds (id, user_id, entity_type, entity_id, capacity, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
  `, [bondId, userId, entityType, entityId, capacity]);
  
  return { userId, bondId, entityId };
}

// Helper to clean up test data
export async function cleanupTestData(userId: string) {
  await queryDatabaseRows(`
    DELETE FROM public.bonds WHERE user_id = $1;
    DELETE FROM public.users WHERE id = $1;
  `, [userId]);
}