import {
  buildWorkspaceLayoutStorageKey,
  choosePreferredWorkspaceLayout,
  resolveWorkspaceLayoutTarget,
  toWorkspaceLayoutRecord,
  toWorkspaceLayoutUpsert,
} from '../../logic/workspace/layoutSync';

describe('workspace layout sync helpers', () => {
  test('resolves device-specific layout targets', () => {
    expect(resolveWorkspaceLayoutTarget('web', 'expanded')).toBe('web');
    expect(resolveWorkspaceLayoutTarget('web', 'compact')).toBe('mobile');
    expect(resolveWorkspaceLayoutTarget('native', 'expanded')).toBe('mobile');
  });

  test('builds deterministic local storage keys', () => {
    expect(
      buildWorkspaceLayoutStorageKey({
        userId: 'user-1',
        workspaceId: 'classroom',
        layoutTarget: 'web',
      }),
    ).toBe('workspace-layout:classroom:web:user-1');
  });

  test('maps remote records into shared layout shape and back', () => {
    const record = toWorkspaceLayoutRecord({
      id: '11111111-1111-1111-1111-111111111111',
      user_id: '22222222-2222-2222-2222-222222222222',
      workspace_id: 'classroom',
      layout_target: 'web',
      order: ['principal'],
      hidden: [],
      pinned: ['principal'],
      zone_by_surface: { principal: 'institution' },
      is_default: false,
      surface_metadata: {},
      layout_version: 2,
      created_at: '2026-03-28T10:00:00.000Z',
      updated_at: '2026-03-28T10:05:00.000Z',
    });

    const upsert = toWorkspaceLayoutUpsert(record, {
      userId: record.userId,
      workspaceId: record.workspaceId,
      layoutTarget: 'web',
    });

    expect(record.workspaceId).toBe('classroom');
    expect(upsert.layoutTarget).toBe('web');
    expect(upsert.zoneBySurface.principal).toBe('institution');
  });

  test('prefers the newer layout snapshot', () => {
    const local = {
      workspaceId: 'classroom',
      userId: 'user-1',
      order: ['teacher'],
      hidden: [],
      pinned: [],
      zoneBySurface: { teacher: 'work' as const },
      updatedAt: '2026-03-28T09:00:00.000Z',
    };
    const remote = {
      workspaceId: 'classroom',
      userId: 'user-1',
      order: ['principal'],
      hidden: [],
      pinned: [],
      zoneBySurface: { principal: 'institution' as const },
      updatedAt: '2026-03-28T10:00:00.000Z',
    };

    expect(choosePreferredWorkspaceLayout({ local, remote })).toEqual(remote);
  });
});
