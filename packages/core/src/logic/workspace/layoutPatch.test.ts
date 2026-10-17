import type { WorkspaceLayoutPatchSource } from '@repo/core/logic/workspace/layoutPatch';
import {
  applyWorkspaceLayoutPatchValues,
  assessWorkspaceLayoutPatch,
  buildWorkspaceLayoutPatchChanges,
  findChangedWorkspaceLayoutPatchGroups,
  hashWorkspaceLayoutPatchGroup,
  projectWorkspaceLayoutPatchGroup,
  projectWorkspaceLayoutPatchValues,
  WorkspaceLayoutPatchSchema,
} from '@repo/core/logic/workspace/layoutPatch';
import type { WorkspaceLayout } from '@repo/core/types';
import { describe, expect, it } from 'vitest';

const layout: WorkspaceLayout<'self' | 'library'> = {
  workspaceId: 'self',
  userId: '00000000-0000-4000-8000-000000000001',
  order: ['self', 'library'],
  hidden: [],
  pinned: ['self'],
  zoneBySurface: { self: 'today', library: 'work' },
  groupOrder: ['focus', 'tools'],
  appearance: { preset: 'garden', motion: 'subtle' },
  updatedAt: '2026-10-11T00:00:00.000Z',
};

describe('workspace layout patch contract', () => {
  it('projects only the three explicitly mergeable groups', () => {
    expect(projectWorkspaceLayoutPatchValues(layout)).toEqual({
      arrangement: {
        order: ['self', 'library'],
        hidden: [],
        pinned: ['self'],
        zoneBySurface: { self: 'today', library: 'work' },
      },
      appearance: { preset: 'garden', motion: 'subtle', wallpaper: null },
      groups: ['focus', 'tools'],
    });
    expect(projectWorkspaceLayoutPatchGroup(layout, 'groups')).toEqual(['focus', 'tools']);
  });

  it('hashes equivalent group values deterministically', async () => {
    const first = await hashWorkspaceLayoutPatchGroup({
      order: ['self'],
      hidden: [],
      pinned: [],
      zoneBySurface: { self: 'today' },
    });
    const second = await hashWorkspaceLayoutPatchGroup({
      zoneBySurface: { self: 'today' },
      pinned: [],
      hidden: [],
      order: ['self'],
    });
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(second).toBe(first);
  });

  it('detects semantic named-group differences without treating metadata as a layout edit', async () => {
    const local = {
      ...layout,
      appearance: { preset: 'night' as const, motion: 'off' as const },
      revision: 12,
      updatedAt: '2026-10-12T00:00:00.000Z',
      surfaceMetadata: { clientNote: 'ignored by layout patches' },
    };

    await expect(findChangedWorkspaceLayoutPatchGroups(layout, local)).resolves.toEqual([
      'appearance',
    ]);
  });

  it('rejects empty patches and generic metadata', () => {
    expect(
      WorkspaceLayoutPatchSchema.safeParse({
        userId: layout.userId,
        workspaceId: layout.workspaceId,
        layoutTarget: 'web',
        operationId: '00000000-0000-4000-8000-000000000002',
        idempotencyKey: 'a'.repeat(64),
        inputHash: 'a'.repeat(64),
        baseRevision: 2,
        changes: {},
      }).success,
    ).toBe(false);
    expect(
      WorkspaceLayoutPatchSchema.safeParse({
        userId: layout.userId,
        workspaceId: layout.workspaceId,
        layoutTarget: 'web',
        operationId: '00000000-0000-4000-8000-000000000002',
        idempotencyKey: 'a'.repeat(64),
        inputHash: 'a'.repeat(64),
        baseRevision: 2,
        changes: { metadata: { baseHash: 'a'.repeat(64), value: {} } },
      }).success,
    ).toBe(false);
  });

  it('preserves legacy zone values and makes wallpaper clearing explicit', () => {
    const legacyLayout = { ...layout, zoneBySurface: { self: 'legacy-zone' } };
    expect(projectWorkspaceLayoutPatchValues(legacyLayout).arrangement.zoneBySurface).toEqual({
      self: 'legacy-zone',
    });
    expect(projectWorkspaceLayoutPatchValues(layout).appearance.wallpaper).toBeNull();

    const valid = WorkspaceLayoutPatchSchema.safeParse({
      userId: layout.userId,
      workspaceId: layout.workspaceId,
      layoutTarget: 'web',
      operationId: '00000000-0000-4000-8000-000000000002',
      idempotencyKey: 'a'.repeat(64),
      inputHash: 'a'.repeat(64),
      baseRevision: 2,
      changes: {
        appearance: {
          baseHash: 'b'.repeat(64),
          value: { preset: 'garden', motion: 'off', wallpaper: null },
        },
      },
    });
    expect(valid.success).toBe(true);
  });

  it('accepts disjoint changes and reports only stale groups', async () => {
    const arrangement = projectWorkspaceLayoutPatchValues(layout).arrangement;
    const arrangementHash = await hashWorkspaceLayoutPatchGroup(arrangement);
    const groups = projectWorkspaceLayoutPatchValues(layout).groups;
    const groupsHash = await hashWorkspaceLayoutPatchGroup(groups);
    const patch = {
      userId: layout.userId,
      workspaceId: layout.workspaceId,
      layoutTarget: 'web' as const,
      operationId: '00000000-0000-4000-8000-000000000002',
      idempotencyKey: 'a'.repeat(64),
      inputHash: 'a'.repeat(64),
      baseRevision: 2,
      changes: {
        arrangement: { baseHash: arrangementHash, value: arrangement },
        groups: { baseHash: groupsHash, value: groups },
      },
    };

    await expect(assessWorkspaceLayoutPatch(layout, patch)).resolves.toMatchObject({
      safe: true,
      conflictingGroups: [],
    });

    await expect(
      assessWorkspaceLayoutPatch(layout, {
        ...patch,
        changes: {
          ...patch.changes,
          groups: { baseHash: 'c'.repeat(64), value: groups },
        },
      }),
    ).resolves.toMatchObject({ safe: false, conflictingGroups: ['groups'] });
  });

  it('builds only requested named groups against the base group hashes', async () => {
    const current: WorkspaceLayoutPatchSource<'self' | 'library'> = {
      ...layout,
      appearance: { preset: 'dawn' as const, motion: 'off' as const },
      groupOrder: ['tools', 'focus'],
      pinned: ['library'],
    };
    const changes = await buildWorkspaceLayoutPatchChanges(
      layout,
      current,
      new Set(['appearance', 'groups']),
    );

    expect(Object.keys(changes).sort()).toEqual(['appearance', 'groups']);
    expect(changes.appearance?.value).toMatchObject({ preset: 'dawn', motion: 'off' });
    expect(changes.groups?.value).toEqual(['tools', 'focus']);
    expect(changes.arrangement).toBeUndefined();
  });

  it('turns an explicit null wallpaper into a cleared appearance value', () => {
    const withWallpaper = {
      ...layout,
      appearance: {
        preset: 'garden' as const,
        motion: 'off' as const,
        wallpaper: {
          provider: 'cloudinary' as const,
          url: 'https://res.cloudinary.com/example/image/upload/old.jpg',
          publicId: 'users/user-1/old',
          width: 1920,
          height: 1080,
        },
      },
    };
    const patch = {
      userId: layout.userId,
      workspaceId: layout.workspaceId,
      layoutTarget: 'web' as const,
      operationId: '00000000-0000-4000-8000-000000000002',
      idempotencyKey: 'a'.repeat(64),
      inputHash: 'b'.repeat(64),
      baseRevision: 2,
      changes: {
        appearance: {
          baseHash: 'c'.repeat(64),
          value: { preset: 'dawn' as const, motion: 'off' as const, wallpaper: null },
        },
      },
    };
    expect(applyWorkspaceLayoutPatchValues(withWallpaper, patch).appearance).toEqual({
      preset: 'dawn',
      motion: 'off',
      wallpaper: null,
    });
  });
});
