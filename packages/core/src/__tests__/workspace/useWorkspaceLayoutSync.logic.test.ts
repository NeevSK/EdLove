import { normalizeWorkspaceLayout } from '../../lib/workspace/canvas';
import {
    buildWorkspaceLayoutStorageKey,
    choosePreferredWorkspaceLayout,
    resolveWorkspaceLayoutTarget,
    toWorkspaceLayoutUpsert,
} from '../../lib/workspace/layoutSync';

describe('workspace layout sync logic', () => {
    test('mobile and web targets can diverge by screen class', () => {
        expect(resolveWorkspaceLayoutTarget('web', 'expanded')).toBe('web');
        expect(resolveWorkspaceLayoutTarget('web', 'compact')).toBe('mobile');
        expect(resolveWorkspaceLayoutTarget('native', 'compact')).toBe('mobile');
    });

    test('storage keys are isolated per target', () => {
        expect(
            buildWorkspaceLayoutStorageKey({
                userId: 'user-1',
                workspaceId: 'classroom',
                layoutTarget: 'mobile',
            })
        ).not.toBe(
            buildWorkspaceLayoutStorageKey({
                userId: 'user-1',
                workspaceId: 'classroom',
                layoutTarget: 'web',
            })
        );
    });

    test('newer remote layout wins after normalization', () => {
        const local = normalizeWorkspaceLayout<'teacher', 'Teacher'>(
            {
                workspaceId: 'classroom',
                userId: 'user-1',
                order: ['teacher'],
                hidden: [],
                pinned: [],
                zoneBySurface: { teacher: 'work' },
                updatedAt: '2026-03-28T10:00:00.000Z',
            },
            [
                {
                    surfaceId: 'teacher',
                    workspaceId: 'classroom',
                    capabilityKey: 'Teacher',
                    ownerPackage: 'classroom',
                    defaultZone: 'work',
                    defaultOrder: 10,
                },
            ]
        );

        const remote: typeof local = {
            ...local,
            order: ['teacher'],
            pinned: ['teacher'],
            updatedAt: '2026-03-28T11:00:00.000Z',
        };

        expect(choosePreferredWorkspaceLayout({ local, remote })).toEqual(remote);
    });

    test('upsert payload preserves the chosen target', () => {
        const payload = toWorkspaceLayoutUpsert(
            {
                workspaceId: 'classroom',
                userId: '11111111-1111-1111-1111-111111111111',
                order: ['teacher'],
                hidden: [],
                pinned: [],
                zoneBySurface: { teacher: 'work' },
                updatedAt: '2026-03-28T11:00:00.000Z',
            },
            {
                userId: '11111111-1111-1111-1111-111111111111',
                workspaceId: 'classroom',
                layoutTarget: 'mobile',
            }
        );

        expect(payload.layoutTarget).toBe('mobile');
        expect(payload.workspaceId).toBe('classroom');
    });
});
