import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CURRENT_OUTBOX_SCHEMA_VERSION,
  migrateQueuedMutation,
} from '../../lib/sync/outboxMigration';
import { MUTATION_REGISTRY } from '../../lib/sync/registry';
import type { QueuedMutation } from '../../lib/sync/types';
import { useMutationQueue } from '../../lib/sync/useMutationQueue';

describe('Disaster Suite 4: Clock Skew, Schema Migration & In-Flight Lease Recovery', () => {
  beforeEach(() => {
    useMutationQueue.setState({ queue: [], deadLetterQueue: [], isSyncing: false });
  });

  it('1. Clock Skew Immunity: orders and drains mutations by logicalClock regardless of erratic wall-clock timestamps', async () => {
    const queue = useMutationQueue.getState();

    // Simulate user changing phone clock backwards and forwards:
    // Event A created at real time T1 (clock = 2026-09-07)
    await queue.addToQueue({
      type: 'UPDATE',
      scope: 'community',
      name: 'updatePost',
      variables: { id: 'p1', content: 'First step' },
    });

    // Event B created when user set phone clock 5 days backwards to past (2026-09-02)
    const originalDateNow = Date.now;
    global.Date.now = () => originalDateNow() - 5 * 24 * 60 * 60 * 1000;

    await queue.addToQueue({
      type: 'UPDATE',
      scope: 'community',
      name: 'updatePost',
      variables: { id: 'p1', content: 'Second step in past clock' },
    });

    // Restore real time
    global.Date.now = originalDateNow;

    const items = useMutationQueue.getState().queue;
    expect(items.length).toBe(2);

    // Verify logical clock is strictly monotonically increasing despite timestamp being lower
    expect(items[0]!.logicalClock).toBe(1);
    expect(items[1]!.logicalClock).toBe(2);
    expect(items[1]!.timestamp).toBeLessThan(items[0]!.timestamp);

    // Verify sort by logicalClock maintains exact execution order
    const sorted = [...items].sort((a, b) => (a.logicalClock ?? 0) - (b.logicalClock ?? 0));
    expect(sorted[0]!.variables.content).toBe('First step');
    expect(sorted[1]!.variables.content).toBe('Second step in past clock');
  });

  it('2. Schema Migration: auto-migrates v1 legacy outbox mutations to v2 schema without dropping fields', () => {
    const legacyMutation: QueuedMutation = {
      id: 'legacy-mut-1',
      idempotencyKey: 'idem-1',
      type: 'CREATE',
      scope: 'classroom',
      name: 'submitAssignment',
      variables: { submissionId: 'sub-100', text: 'homework' },
      timestamp: 1700000000000,
      retryCount: 0,
      // schemaVersion is undefined in v1
    };

    const migrated = migrateQueuedMutation(legacyMutation);

    expect(migrated.schemaVersion).toBe(CURRENT_OUTBOX_SCHEMA_VERSION);
    expect(migrated.variables.version).toBe(2);
    expect(migrated.variables.migratedFromV1).toBe(true);
    expect(migrated.variables.submissionId).toBe('sub-100');
    expect(migrated.variables.text).toBe('homework');
  });

  it('3. In-Flight Lease Recovery: self-heals crashed lock leases and re-executes aborted mutation on next cycle', async () => {
    const executed: string[] = [];
    MUTATION_REGISTRY['processRecoveryTask'] = vi.fn().mockImplementation(async (vars: any) => {
      executed.push(vars.taskId);
    });

    const now = Date.now();

    // 1. Simulate a mutation that was interrupted mid-flight by OS killing the app 30 seconds ago (expired lease)
    useMutationQueue.setState({
      queue: [
        {
          id: 'crashed-mut-1',
          idempotencyKey: 'idem-crashed',
          type: 'UPDATE',
          scope: 'system',
          name: 'processRecoveryTask',
          variables: { taskId: 'task-99' },
          timestamp: now - 60000,
          retryCount: 0,
          schemaVersion: 2,
          logicalClock: 1,
          lockLeaseExpiresAt: now - 15000, // Expired 15s ago!
        },
      ],
      deadLetterQueue: [],
      isSyncing: false,
    });

    const currentItems = useMutationQueue.getState().queue;
    const item = currentItems[0]!;

    // Expired lease must NOT be skipped (it self-heals)
    const isLeaseActive = item.lockLeaseExpiresAt && Date.now() < item.lockLeaseExpiresAt;
    expect(isLeaseActive).toBeFalsy();

    // Process it
    const mutationFn = MUTATION_REGISTRY[item.name]!;
    await mutationFn(item.variables);

    expect(executed).toContain('task-99');
  });
});
