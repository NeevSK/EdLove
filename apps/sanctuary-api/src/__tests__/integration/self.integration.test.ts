// Integration Tests for Self Domain
// Run with: pnpm test:integration

import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import type { RouterClient } from '@orpc/server';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { cleanupTestData, createTestUserWithBond, integrationTest } from '../integration-setup';

// Create a simple ORPC client for integration tests (avoids @orpc/tanstack-query dependency issue)
function createIntegrationClient(headers: Record<string, string> = {}) {
  const { apiUrl } = integrationTest.environment();
  const link = new RPCLink<Record<never, never>>({
    url: apiUrl,
    headers,
    fetch: async (request, init) => {
      return globalThis.fetch(request, init);
    },
  });
  return createORPCClient<RouterClient<any>>(link);
}

describe('Self Domain Integration Tests', () => {
  let testUser: { userId: string; bondId: string; entityId: string } | null = null;
  let authToken: string | null = null;

  beforeAll(async () => {
    // Create test user with bond
    testUser = await createTestUserWithBond('teacher', 'SCHOOL', 'test-school-integration');

    authToken = integrationTest.environment().authToken;
  });

  afterAll(async () => {
    if (testUser) {
      await cleanupTestData(testUser.userId);
    }
  });

  beforeEach(() => {
    // Reset per-test state
  });

  it('should log mood and retrieve history', async () => {
    if (!testUser || !authToken)
      throw new Error('Integration setup did not provide a test user and JWT.');

    const client = createIntegrationClient({
      Authorization: `Bearer ${authToken}`,
      'X-Active-Bond-Id': testUser.bondId,
    });

    // Log a mood
    const moodResult = await client.self.logMood(
      {
        mood_score: 8,
        mood: 'happy',
        note: 'Integration test mood',
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-Active-Bond-Id': testUser.bondId,
        },
      },
    );

    expect(moodResult).toBeDefined();
    expect(moodResult.mood_score).toBe(8);
    expect(moodResult.mood).toBe('happy');

    // Retrieve mood history
    const historyResult = await client.self.getMoodHistory(
      {
        limit: 10,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-Active-Bond-Id': testUser.bondId,
        },
      },
    );

    expect(Array.isArray(historyResult)).toBe(true);
    expect(historyResult.length).toBeGreaterThan(0);
    expect(historyResult[0].mood_score).toBe(8);
  });

  it('should burn journal entry', async () => {
    if (!testUser || !authToken)
      throw new Error('Integration setup did not provide a test user and JWT.');

    const client = createIntegrationClient({
      Authorization: `Bearer ${authToken}`,
      'X-Active-Bond-Id': testUser.bondId,
    });

    const journalResult = await client.self.burnJournal(
      {
        content: 'This is a test journal entry that will be burned',
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-Active-Bond-Id': testUser.bondId,
        },
      },
    );

    expect(journalResult).toBeDefined();
    expect(journalResult.is_burned).toBe(true);
    expect(journalResult.content_preview).toContain('This is a test');
  });

  it("should get today's mood", async () => {
    if (!testUser || !authToken)
      throw new Error('Integration setup did not provide a test user and JWT.');

    const client = createIntegrationClient({
      Authorization: `Bearer ${authToken}`,
      'X-Active-Bond-Id': testUser.bondId,
    });

    const moodResult = await client.self.getTodayMood(
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-Active-Bond-Id': testUser.bondId,
        },
      },
    );

    expect(moodResult).toBeDefined();
    // Could be null if no mood logged today
  });
});

describe('Library Domain Integration Tests', () => {
  let testUser: { userId: string; bondId: string; entityId: string } | null = null;
  let authToken: string | null = null;

  beforeAll(async () => {
    testUser = await createTestUserWithBond('teacher', 'SCHOOL', 'test-school-integration');
    authToken = integrationTest.environment().authToken;
  });

  afterAll(async () => {
    if (testUser) {
      await cleanupTestData(testUser.userId);
    }
  });

  it('should create library resource', async () => {
    if (!testUser || !authToken)
      throw new Error('Integration setup did not provide a test user and JWT.');

    const client = createIntegrationClient({
      Authorization: `Bearer ${authToken}`,
      'X-Active-Bond-Id': testUser.bondId,
    });

    const resourceResult = await client.library.createResource(
      {
        title: 'Integration Test Resource',
        description: 'Test resource created during integration tests',
        type: 'lesson',
        format: 'text',
        subjects: ['math'],
        topics: ['algebra'],
        grades: ['grade-9'],
        difficulty: 'medium',
        language: ['en'],
        visibility: 'public',
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-Active-Bond-Id': testUser.bondId,
        },
      },
    );

    expect(resourceResult).toBeDefined();
    expect(resourceResult.title).toBe('Integration Test Resource');
  });

  it('should list library resources', async () => {
    if (!testUser || !authToken)
      throw new Error('Integration setup did not provide a test user and JWT.');

    const client = createIntegrationClient({
      Authorization: `Bearer ${authToken}`,
      'X-Active-Bond-Id': testUser.bondId,
    });

    const resourcesResult = await client.library.getResources(
      {
        limit: 10,
        offset: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-Active-Bond-Id': testUser.bondId,
        },
      },
    );

    expect(Array.isArray(resourcesResult)).toBe(true);
  });
});

describe('Mapping Domain Integration Tests', () => {
  let testUser: { userId: string; bondId: string; entityId: string } | null = null;
  let authToken: string | null = null;

  beforeAll(async () => {
    testUser = await createTestUserWithBond('teacher', 'SCHOOL', 'test-school-integration');
    authToken = integrationTest.environment().authToken;
  });

  afterAll(async () => {
    if (testUser) {
      await cleanupTestData(testUser.userId);
    }
  });

  it('should create and retrieve mapping topology', async () => {
    if (!testUser || !authToken)
      throw new Error('Integration setup did not provide a test user and JWT.');

    const client = createIntegrationClient({
      Authorization: `Bearer ${authToken}`,
      'X-Active-Bond-Id': testUser.bondId,
    });

    const topologyResult = await client.mapping.upsert(
      {
        id: 'test-topology-' + Date.now(),
        name: 'Integration Test Topology',
        description: 'Test topology for integration tests',
        nodes: [
          { id: 'school-1', label: 'Test School', type: 'school', group: 'School' },
          { id: 'topic-1', label: 'Math', type: 'topic', group: 'Department' },
        ],
        links: [{ source: 'school-1', target: 'topic-1', relationship: 'manages' }],
        supportedPerspectives: ['teacher'],
        isPublic: false,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-Active-Bond-Id': testUser.bondId,
        },
      },
    );

    expect(topologyResult).toBeDefined();
    expect(topologyResult.name).toBe('Integration Test Topology');
  });
});

describe('Rewards Domain Integration Tests', () => {
  let testUser: { userId: string; bondId: string; entityId: string } | null = null;
  let authToken: string | null = null;

  beforeAll(async () => {
    testUser = await createTestUserWithBond('student', 'SCHOOL', 'test-school-integration');
    authToken = integrationTest.environment().authToken;
  });

  afterAll(async () => {
    if (testUser) {
      await cleanupTestData(testUser.userId);
    }
  });

  it('should get rewards and check achievements', async () => {
    if (!testUser || !authToken)
      throw new Error('Integration setup did not provide a test user and JWT.');

    const client = createIntegrationClient({
      Authorization: `Bearer ${authToken}`,
      'X-Active-Bond-Id': testUser.bondId,
    });

    const rewardsResult = await client.rewards.getRewards(
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-Active-Bond-Id': testUser.bondId,
        },
      },
    );

    expect(rewardsResult).toBeDefined();
    expect(typeof rewardsResult.points).toBe('number');
    expect(Array.isArray(rewardsResult.badges)).toBe(true);
  });
});
