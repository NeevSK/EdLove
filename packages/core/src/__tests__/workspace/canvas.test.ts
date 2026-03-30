import {
    createDefaultWorkspaceLayout,
    groupResolvedWorkspaceSurfacesByZone,
    normalizeWorkspaceLayout,
    resolveWorkspaceSurfaceLayout,
    setWorkspaceSurfaceHidden,
    setWorkspaceSurfaceOrder,
    setWorkspaceSurfacePinned,
    setWorkspaceSurfaceZone,
    type WorkspaceLayout,
    type WorkspaceSurfaceDefinition,
} from '../../lib/workspace/canvas';

type TestSurfaceId = 'teacher' | 'principal' | 'insights' | 'calendar';
type TestCapabilityKey =
    | 'TeacherDashboard'
    | 'PrincipalDashboard'
    | 'TeacherInsights'
    | 'CalendarView';

const surfaces: WorkspaceSurfaceDefinition<TestSurfaceId, TestCapabilityKey>[] = [
    {
        surfaceId: 'teacher',
        workspaceId: 'classroom',
        capabilityKey: 'TeacherDashboard',
        ownerPackage: 'classroom',
        defaultZone: 'work',
        defaultOrder: 30,
        mobileSupport: true,
        webSupport: true,
    },
    {
        surfaceId: 'principal',
        workspaceId: 'classroom',
        capabilityKey: 'PrincipalDashboard',
        ownerPackage: 'admin',
        defaultZone: 'institution',
        defaultOrder: 10,
        mobileSupport: true,
        webSupport: true,
    },
    {
        surfaceId: 'insights',
        workspaceId: 'classroom',
        capabilityKey: 'TeacherInsights',
        ownerPackage: 'classroom',
        defaultZone: 'today',
        defaultOrder: 20,
        hiddenByDefault: true,
        mobileSupport: true,
        webSupport: true,
    },
];

describe('workspace canvas helpers', () => {
    it('creates a default layout from surface metadata', () => {
        const layout = createDefaultWorkspaceLayout({
            workspaceId: 'classroom',
            userId: 'user-1',
            surfaces,
            updatedAt: '2026-03-28T00:00:00.000Z',
        });

        expect(layout.order).toEqual(['principal', 'insights', 'teacher']);
        expect(layout.hidden).toEqual(['insights']);
        expect(layout.pinned).toEqual([]);
        expect(layout.zoneBySurface).toEqual({
            principal: 'institution',
            insights: 'today',
            teacher: 'work',
        });
    });

    it('normalizes layouts when eligible surfaces change', () => {
        const layout = normalizeWorkspaceLayout(
            {
                workspaceId: 'classroom',
                userId: 'user-1',
                order: ['teacher', 'teacher', 'principal', 'calendar'],
                hidden: ['teacher', 'calendar'],
                pinned: ['principal', 'calendar'],
                zoneBySurface: {
                    teacher: 'private',
                    principal: 'institution',
                    calendar: 'outlook',
                },
                updatedAt: '2026-03-28T01:00:00.000Z',
            },
            surfaces,
            '2026-03-28T02:00:00.000Z'
        );

        expect(layout.order).toEqual(['teacher', 'principal', 'insights']);
        expect(layout.hidden).toEqual(['teacher', 'insights']);
        expect(layout.pinned).toEqual(['principal']);
        expect(layout.zoneBySurface).toEqual({
            principal: 'institution',
            insights: 'today',
            teacher: 'private',
        });
    });

    it('resolves and groups surfaces by zone for renderers', () => {
        const layout: WorkspaceLayout<TestSurfaceId> = {
            workspaceId: 'classroom',
            userId: 'user-1',
            order: ['teacher', 'principal', 'insights'],
            hidden: ['insights'],
            pinned: ['principal'],
            zoneBySurface: {
                teacher: 'work',
                principal: 'institution',
                insights: 'today',
            },
            updatedAt: '2026-03-28T01:00:00.000Z',
        };

        const resolved = resolveWorkspaceSurfaceLayout(surfaces, layout);
        expect(resolved.map((surface) => surface.surfaceId)).toEqual(['teacher', 'principal', 'insights']);
        expect(resolved.find((surface) => surface.surfaceId === 'principal')?.pinned).toBe(true);
        expect(resolved.find((surface) => surface.surfaceId === 'insights')?.hidden).toBe(true);

        const grouped = groupResolvedWorkspaceSurfacesByZone(resolved);
        expect(grouped.find((group) => group.zone === 'institution')?.surfaces.map((surface) => surface.surfaceId)).toEqual([
            'principal',
        ]);
        expect(grouped.find((group) => group.zone === 'work')?.surfaces.map((surface) => surface.surfaceId)).toEqual([
            'teacher',
        ]);
        expect(grouped.find((group) => group.zone === 'today')?.surfaces).toEqual([]);
    });

    it('updates order, hidden, pinned, and zone without mutating unrelated fields', () => {
        const base = createDefaultWorkspaceLayout({
            workspaceId: 'classroom',
            userId: 'user-1',
            surfaces,
            updatedAt: '2026-03-28T00:00:00.000Z',
        });

        const reordered = setWorkspaceSurfaceOrder(base, ['teacher', 'principal', 'insights'], '2026-03-28T03:00:00.000Z');
        const hidden = setWorkspaceSurfaceHidden(reordered, 'teacher', true, '2026-03-28T04:00:00.000Z');
        const pinned = setWorkspaceSurfacePinned(hidden, 'principal', true, '2026-03-28T05:00:00.000Z');
        const rezoned = setWorkspaceSurfaceZone(pinned, 'teacher', 'private', '2026-03-28T06:00:00.000Z');

        expect(rezoned.order).toEqual(['teacher', 'principal', 'insights']);
        expect(rezoned.hidden).toEqual(['insights', 'teacher']);
        expect(rezoned.pinned).toEqual(['principal']);
        expect(rezoned.zoneBySurface.teacher).toBe('private');
        expect(rezoned.updatedAt).toBe('2026-03-28T06:00:00.000Z');
    });
});
