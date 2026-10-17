import {
  buildWorkspaceLayoutIntentStorageKey,
  WorkspaceLayoutIntentSchema,
} from '@repo/core/logic/workspace/layoutIntent';
import { describe, expect, it } from 'vitest';

const userId = '11111111-1111-4111-8111-111111111111';

function intent() {
  return {
    version: 2 as const,
    userId,
    workspaceId: 'self',
    layoutTarget: 'mobile' as const,
    values: {
      arrangement: {
        order: ['journal'],
        hidden: [],
        pinned: [],
        zoneBySurface: { journal: 'today' },
      },
      appearance: { preset: 'default', motion: 'off', wallpaper: null },
      groups: ['wellbeing'],
    },
    dirtyGroups: ['appearance'] as const,
  };
}

describe('WorkspaceLayoutIntentSchema', () => {
  it('keeps the local value snapshot and dirty intent in one scoped record', () => {
    expect(WorkspaceLayoutIntentSchema.parse(intent())).toMatchObject({
      version: 2,
      userId,
      values: { appearance: { wallpaper: null } },
    });
    expect(
      buildWorkspaceLayoutIntentStorageKey({ userId, workspaceId: 'self', layoutTarget: 'mobile' }),
    ).not.toBe(
      buildWorkspaceLayoutIntentStorageKey({ userId, workspaceId: 'self', layoutTarget: 'web' }),
    );
  });

  it('rejects a pending patch that does not belong to the intent', () => {
    const candidate = intent();
    const parsed = WorkspaceLayoutIntentSchema.safeParse({
      ...candidate,
      pendingPatch: {
        userId: '22222222-2222-4222-8222-222222222222',
        workspaceId: candidate.workspaceId,
        layoutTarget: candidate.layoutTarget,
        operationId: '33333333-3333-4333-8333-333333333333',
        idempotencyKey: 'intent-key',
        inputHash: 'a'.repeat(64),
        baseRevision: 0,
        changes: {
          appearance: { baseHash: 'b'.repeat(64), value: candidate.values.appearance },
        },
      },
    });

    expect(parsed.success).toBe(false);
  });
});
