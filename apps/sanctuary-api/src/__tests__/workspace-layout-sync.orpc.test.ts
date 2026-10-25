import './setup';
import { getConsistentIdempotencyKey } from '@repo/core/lib/sync/idempotency';
import { hashWorkspaceLayoutPatchGroup } from '@repo/core/logic/workspace/layoutPatch';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import {
  getMockLastQueryRawArgs,
  setMockActiveBond,
  setMockDailyContentRows,
  setMockRawQueryRowsQueue,
  setMockUserPreferences,
  setMockZenStackDbAvailable,
} from './setup';

const userId = '123e4567-e89b-8101-8000-426614174000';

describe('Sanctuary API: authoritative workspace layout mutation', () => {
  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockRawQueryRowsQueue([]);
    setMockDailyContentRows([]);
    setMockUserPreferences({ active_bond_id: '123e4567-e89b-12d3-a456-426614174001' });
    setMockActiveBond({
      id: '123e4567-e89b-12d3-a456-426614174001',
      user_id: userId,
      entity_id: '123e4567-e89b-8101-8000-426614174002',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
  });

  it('applies a non-overlapping named-group patch under the row revision', async () => {
    const currentAppearance = {
      preset: 'default' as const,
      motion: 'off' as const,
      wallpaper: {
        provider: 'cloudinary' as const,
        url: 'https://res.cloudinary.com/example/image/upload/old.jpg',
        publicId: 'gurudevi/user/wallpapers/old',
        width: 1920,
        height: 1080,
      },
    };
    const changes = {
      appearance: {
        baseHash: await hashWorkspaceLayoutPatchGroup(currentAppearance),
        value: { preset: 'garden' as const, motion: 'subtle' as const, wallpaper: null },
      },
    };
    const inputHash = await getConsistentIdempotencyKey(
      { workspaceId: 'self', layoutTarget: 'web', baseRevision: 3, changes },
      'workspace-layout-patch-v1',
    );
    setMockRawQueryRowsQueue([
      [],
      [
        {
          user_id: userId,
          workspace_id: 'self',
          order_json: ['today'],
          hidden_json: [],
          pinned_json: [],
          zone_by_surface_jsonb: { today: 'today' },
          is_default: true,
          surface_metadata_jsonb: { __workspaceAppearance: currentAppearance },
          revision: 3,
          updated_at: '2026-10-10T19:00:00.000Z',
        },
      ],
      [{ revision: 4 }],
    ]);

    await expect(
      createTestORPCClient({ Authorization: `Bearer ${userId}` }).sync.patchWorkspaceLayout({
        body: {
          userId,
          workspaceId: 'self',
          layoutTarget: 'web',
          operationId: '423e4567-e89b-12d3-a456-426614174000',
          idempotencyKey: 'patch-idempotency-1',
          inputHash,
          baseRevision: 3,
          changes,
        },
      }),
    ).resolves.toMatchObject({
      status: 'completed',
      serverRevision: 4,
    });
    const layoutMetadata = getMockLastQueryRawArgs()?.find(
      (value): value is string =>
        typeof value === 'string' && value.startsWith('{"__workspaceAppearance"'),
    );
    expect(layoutMetadata).toBe('{"__workspaceAppearance":{"preset":"garden","motion":"subtle"}}');
  });

  it('returns a named-group conflict when the authoritative group hash changed', async () => {
    const changes = {
      appearance: {
        baseHash: 'b'.repeat(64),
        value: { preset: 'garden' as const, motion: 'off' as const, wallpaper: null },
      },
    };
    const inputHash = await getConsistentIdempotencyKey(
      { workspaceId: 'self', layoutTarget: 'web', baseRevision: 3, changes },
      'workspace-layout-patch-v1',
    );
    setMockRawQueryRowsQueue([
      [],
      [
        {
          user_id: userId,
          workspace_id: 'self',
          order_json: ['today'],
          hidden_json: [],
          pinned_json: [],
          zone_by_surface_jsonb: { today: 'today' },
          is_default: true,
          surface_metadata_jsonb: {
            __workspaceAppearance: { preset: 'default', motion: 'off' },
          },
          revision: 3,
          updated_at: '2026-10-10T19:00:00.000Z',
        },
      ],
    ]);

    await expect(
      createTestORPCClient({ Authorization: `Bearer ${userId}` }).sync.patchWorkspaceLayout({
        body: {
          userId,
          workspaceId: 'self',
          layoutTarget: 'web',
          operationId: '523e4567-e89b-12d3-a456-426614174000',
          idempotencyKey: 'patch-idempotency-2',
          inputHash,
          baseRevision: 3,
          changes,
        },
      }),
    ).resolves.toMatchObject({
      status: 'conflict',
      conflictReason: 'PATCH_GROUP_CONFLICT',
      conflictingGroups: ['appearance'],
      conflictFetchReference: { workspaceId: 'self', layoutTarget: 'web' },
    });
  });

  it('rejects an appearance patch that references an unregistered wallpaper asset', async () => {
    const currentAppearance = {
      preset: 'default' as const,
      motion: 'off' as const,
      wallpaper: null,
    };
    const changes = {
      appearance: {
        baseHash: await hashWorkspaceLayoutPatchGroup(currentAppearance),
        value: {
          preset: 'garden' as const,
          motion: 'off' as const,
          wallpaper: {
            provider: 'cloudinary' as const,
            url: 'https://res.cloudinary.com/example/image/upload/wallpaper.jpg',
            publicId: 'gurudevi/123e4567-e89b-8101-8000-426614174000/wallpapers/missing',
            width: 1200,
            height: 800,
          },
        },
      },
    };
    const inputHash = await getConsistentIdempotencyKey(
      { workspaceId: 'self', layoutTarget: 'web', baseRevision: 3, changes },
      'workspace-layout-patch-v1',
    );
    setMockRawQueryRowsQueue([
      [],
      [
        {
          user_id: userId,
          workspace_id: 'self',
          order_json: ['today'],
          hidden_json: [],
          pinned_json: [],
          zone_by_surface_jsonb: { today: 'today' },
          is_default: true,
          surface_metadata_jsonb: { __workspaceAppearance: currentAppearance },
          revision: 3,
          updated_at: '2026-10-10T19:00:00.000Z',
        },
      ],
      [],
    ]);

    await expect(
      createTestORPCClient({ Authorization: `Bearer ${userId}` }).sync.patchWorkspaceLayout({
        body: {
          userId,
          workspaceId: 'self',
          layoutTarget: 'web',
          operationId: '723e4567-e89b-12d3-a456-426614174000',
          idempotencyKey: 'patch-idempotency-wallpaper-ownership',
          inputHash,
          baseRevision: 3,
          changes,
        },
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('accepts a matching registered wallpaper while its asset is active', async () => {
    const currentAppearance = {
      preset: 'default' as const,
      motion: 'off' as const,
      wallpaper: null,
    };
    const wallpaper = {
      provider: 'cloudinary' as const,
      url: 'https://res.cloudinary.com/example/image/upload/wallpaper.jpg',
      publicId: `gurudevi/${userId}/wallpapers/active`,
      width: 1200,
      height: 800,
    };
    const changes = {
      appearance: {
        baseHash: await hashWorkspaceLayoutPatchGroup(currentAppearance),
        value: { preset: 'garden' as const, motion: 'off' as const, wallpaper },
      },
    };
    const inputHash = await getConsistentIdempotencyKey(
      { workspaceId: 'self', layoutTarget: 'web', baseRevision: 3, changes },
      'workspace-layout-patch-v1',
    );
    setMockRawQueryRowsQueue([
      [],
      [
        {
          user_id: userId,
          workspace_id: 'self',
          order_json: ['today'],
          hidden_json: [],
          pinned_json: [],
          zone_by_surface_jsonb: { today: 'today' },
          is_default: true,
          surface_metadata_jsonb: { __workspaceAppearance: currentAppearance },
          revision: 3,
          updated_at: '2026-10-10T19:00:00.000Z',
        },
      ],
      [
        {
          public_id: wallpaper.publicId,
          secure_url: wallpaper.url,
          width: wallpaper.width,
          height: wallpaper.height,
        },
      ],
      [{ revision: 4 }],
    ]);

    await expect(
      createTestORPCClient({ Authorization: `Bearer ${userId}` }).sync.patchWorkspaceLayout({
        body: {
          userId,
          workspaceId: 'self',
          layoutTarget: 'web',
          operationId: '823e4567-e89b-12d3-a456-426614174000',
          idempotencyKey: 'patch-idempotency-wallpaper-active',
          inputHash,
          baseRevision: 3,
          changes,
        },
      }),
    ).resolves.toMatchObject({ status: 'completed', serverRevision: 4 });
  });

  it('rejects a patch based on a future server revision', async () => {
    const currentAppearance = {
      preset: 'default' as const,
      motion: 'off' as const,
      wallpaper: null,
    };
    const changes = {
      appearance: {
        baseHash: await hashWorkspaceLayoutPatchGroup(currentAppearance),
        value: { preset: 'garden' as const, motion: 'off' as const, wallpaper: null },
      },
    };
    const inputHash = await getConsistentIdempotencyKey(
      { workspaceId: 'self', layoutTarget: 'web', baseRevision: 4, changes },
      'workspace-layout-patch-v1',
    );
    setMockRawQueryRowsQueue([
      [],
      [
        {
          user_id: userId,
          workspace_id: 'self',
          order_json: ['today'],
          hidden_json: [],
          pinned_json: [],
          zone_by_surface_jsonb: { today: 'today' },
          is_default: true,
          surface_metadata_jsonb: { __workspaceAppearance: currentAppearance },
          revision: 3,
          updated_at: '2026-10-10T19:00:00.000Z',
        },
      ],
    ]);

    await expect(
      createTestORPCClient({ Authorization: `Bearer ${userId}` }).sync.patchWorkspaceLayout({
        body: {
          userId,
          workspaceId: 'self',
          layoutTarget: 'web',
          operationId: '623e4567-e89b-12d3-a456-426614174000',
          idempotencyKey: 'patch-idempotency-3',
          inputHash,
          baseRevision: 4,
          changes,
        },
      }),
    ).resolves.toMatchObject({
      status: 'conflict',
      conflictReason: 'PATCH_REVISION_AHEAD',
      conflictFetchReference: { workspaceId: 'self', layoutTarget: 'web' },
    });
  });
});
