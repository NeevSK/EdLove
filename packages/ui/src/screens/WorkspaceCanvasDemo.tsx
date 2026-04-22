import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
    createDefaultWorkspaceLayout,
    setWorkspaceSurfaceHidden,
} from '@repo/core/logic';
import type {
    ResolvedWorkspaceSurface,
    WorkspaceLayout,
    WorkspaceSurfaceDefinition,
} from '@repo/core/types';
import { WorkspaceCanvas } from '../components/workspace';
import { Theme } from '../theme/Theme';

type DemoRole = 'teacher' | 'principal' | 'founder';
type DemoSurfaceId =
    | 'lesson-flow'
    | 'student-signals'
    | 'institution-arc'
    | 'attendance-watch'
    | 'guardian-loop'
    | 'ecosystem-pulse'
    | 'private-reflection';
type DemoCapabilityKey =
    | 'TeacherLessonFlow'
    | 'TeacherSignals'
    | 'InstitutionArc'
    | 'AttendanceOversight'
    | 'GuardianRelationship'
    | 'FounderEcosystemPulse'
    | 'PrivateReflection';

interface DemoSurfaceMeta {
    subtitle: string;
    summary: string;
    snapshot: string;
    temporalLabel: string;
    temporalTone: 'present' | 'past' | 'future' | 'neutral';
    metadata: string[];
    actions: string[];
    info: string;
}

type DemoSurface = WorkspaceSurfaceDefinition<DemoSurfaceId, DemoCapabilityKey>;

const ROLE_LABELS: Record<DemoRole, string> = {
    teacher: 'Teacher',
    principal: 'Principal',
    founder: 'Founder',
};

const SURFACE_LIBRARY: Record<DemoSurfaceId, DemoSurface & DemoSurfaceMeta> = {
    'lesson-flow': {
        surfaceId: 'lesson-flow',
        workspaceId: 'classroom',
        capabilityKey: 'TeacherLessonFlow',
        ownerPackage: 'classroom',
        defaultZone: 'today',
        defaultOrder: 10,
        mobileSupport: true,
        webSupport: true,
        subtitle: 'Live lesson rhythm',
        summary: 'A compact teaching surface for what is happening now, what needs intervention next, and what can be closed quickly.',
        snapshot: '3 live groups, 1 assignment blocked, 82% participation in the current cycle.',
        temporalLabel: 'Present',
        temporalTone: 'present',
        metadata: ['Teacher', 'Realtime', 'Actionable'],
        actions: ['Open session', 'Create note'],
        info: 'Use when a teacher needs a high-signal present-tense operating view rather than a retrospective report.',
    },
    'student-signals': {
        surfaceId: 'student-signals',
        workspaceId: 'classroom',
        capabilityKey: 'TeacherSignals',
        ownerPackage: 'classroom',
        defaultZone: 'work',
        defaultOrder: 20,
        mobileSupport: true,
        webSupport: true,
        subtitle: 'Signals and intervention candidates',
        summary: 'Highlights learners who changed state recently and surfaces the next best response.',
        snapshot: '2 students rose into watch status after yesterdays assessments.',
        temporalLabel: 'Past 24h',
        temporalTone: 'past',
        metadata: ['Teacher', 'Insight', 'Review'],
        actions: ['Review signals', 'Log intervention'],
        info: 'This card favors temporal transitions and supports read plus lightweight write actions.',
    },
    'institution-arc': {
        surfaceId: 'institution-arc',
        workspaceId: 'classroom',
        capabilityKey: 'InstitutionArc',
        ownerPackage: 'admin',
        defaultZone: 'institution',
        defaultOrder: 30,
        mobileSupport: true,
        webSupport: true,
        subtitle: 'Institutional arc',
        summary: 'A school-wide snapshot that blends present health, upcoming risk, and what needs leadership attention.',
        snapshot: 'Attendance stable, invite backlog reduced, and one grade band trending below target.',
        temporalLabel: 'This week',
        temporalTone: 'present',
        metadata: ['Leadership', 'Oversight', 'Cross-holon'],
        actions: ['Inspect trend', 'Assign follow-up'],
        info: 'This is the domain-specific language that could later wrap the shared base as an InstitutionalArcCard preset.',
    },
    'attendance-watch': {
        surfaceId: 'attendance-watch',
        workspaceId: 'classroom',
        capabilityKey: 'AttendanceOversight',
        ownerPackage: 'admin',
        defaultZone: 'outlook',
        defaultOrder: 40,
        mobileSupport: true,
        webSupport: true,
        subtitle: 'Attendance watch',
        summary: 'Shows emerging attendance drift before it becomes an official escalation.',
        snapshot: 'Friday trend predicts a 6% dip if transport disruptions continue.',
        temporalLabel: 'Forecast',
        temporalTone: 'future',
        metadata: ['Leadership', 'Forecast', 'Temporal'],
        actions: ['Open attendance lane', 'Message coordinator'],
        info: 'A good example of why the shared card needs temporal state beyond just a title and body.',
    },
    'guardian-loop': {
        surfaceId: 'guardian-loop',
        workspaceId: 'classroom',
        capabilityKey: 'GuardianRelationship',
        ownerPackage: 'guardian',
        defaultZone: 'work',
        defaultOrder: 50,
        mobileSupport: true,
        webSupport: true,
        subtitle: 'Guardian communication loop',
        summary: 'Captures summaries ready to share outward without making the workspace itself the persistence owner.',
        snapshot: '4 guardian-ready summaries drafted, 1 awaiting verification.',
        temporalLabel: 'Queued',
        temporalTone: 'neutral',
        metadata: ['Family', 'Summary', 'Share-ready'],
        actions: ['Review summary', 'Send update'],
        info: 'Shows a role crossing seam: teacher and principal may both see it, but through different capabilities.',
    },
    'ecosystem-pulse': {
        surfaceId: 'ecosystem-pulse',
        workspaceId: 'classroom',
        capabilityKey: 'FounderEcosystemPulse',
        ownerPackage: 'admin',
        defaultZone: 'institution',
        defaultOrder: 60,
        mobileSupport: true,
        webSupport: true,
        subtitle: 'Ecosystem pulse',
        summary: 'A founder-facing view that emphasizes momentum across institutions rather than one schools local dashboard.',
        snapshot: '3 institutions expanding, 1 needs staffing support, growth health remains positive.',
        temporalLabel: 'Quarter arc',
        temporalTone: 'future',
        metadata: ['Founder', 'Multi-site', 'Strategic'],
        actions: ['Open network map', 'Create directive'],
        info: 'Demonstrates that the same renderer can support non-classroom leadership surfaces without role-specific UI forks.',
    },
    'private-reflection': {
        surfaceId: 'private-reflection',
        workspaceId: 'classroom',
        capabilityKey: 'PrivateReflection',
        ownerPackage: 'core',
        defaultZone: 'private',
        defaultOrder: 70,
        hiddenByDefault: true,
        mobileSupport: true,
        webSupport: true,
        subtitle: 'Private reflection',
        summary: 'A personal note surface that belongs to the user, not the institution, and can stay hidden by default.',
        snapshot: '2 unfinished reflections from the last 7 days.',
        temporalLabel: 'Private',
        temporalTone: 'neutral',
        metadata: ['Personal', 'Hidden by default'],
        actions: ['Resume note'],
        info: 'Included to show hidden-by-default handling and private-zone rendering.',
    },
};

const ROLE_SURFACES: Record<DemoRole, DemoSurfaceId[]> = {
    teacher: ['lesson-flow', 'student-signals', 'guardian-loop', 'private-reflection'],
    principal: ['institution-arc', 'attendance-watch', 'guardian-loop', 'private-reflection'],
    founder: ['ecosystem-pulse', 'institution-arc', 'attendance-watch', 'private-reflection'],
};

function buildRoleSurfaces(role: DemoRole): Array<DemoSurface & DemoSurfaceMeta> {
    return ROLE_SURFACES[role].map((surfaceId) => SURFACE_LIBRARY[surfaceId]);
}

export default function WorkspaceCanvasDemo() {
    const [role, setRole] = useState<DemoRole>('principal');
    const [notice, setNotice] = useState('Select a surface to inspect how the shared card behaves.');

    const surfaces = useMemo(() => buildRoleSurfaces(role), [role]);
    const [layoutByRole, setLayoutByRole] = useState<Record<DemoRole, WorkspaceLayout<DemoSurfaceId>>>(() => ({
        teacher: createDefaultWorkspaceLayout({
            workspaceId: 'classroom',
            userId: 'demo-teacher',
            surfaces: buildRoleSurfaces('teacher'),
        }),
        principal: createDefaultWorkspaceLayout({
            workspaceId: 'classroom',
            userId: 'demo-principal',
            surfaces: buildRoleSurfaces('principal'),
        }),
        founder: createDefaultWorkspaceLayout({
            workspaceId: 'classroom',
            userId: 'demo-founder',
            surfaces: buildRoleSurfaces('founder'),
        }),
    }));

    const layout = layoutByRole[role];

    const updateRoleLayout = (updater: (current: WorkspaceLayout<DemoSurfaceId>) => WorkspaceLayout<DemoSurfaceId>) => {
        setLayoutByRole((current) => ({
            ...current,
            [role]: updater(current[role]),
        }));
    };

    const renderActionButton = (label: string, tone: 'primary' | 'secondary' = 'secondary') => (
        <View key={label} style={[styles.actionChip, tone === 'primary' ? styles.actionChipPrimary : null]}>
            <Text style={tone === 'primary' ? styles.actionChipTextPrimary : styles.actionChipText}>
                {label}
            </Text>
        </View>
    );

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.kicker}>SHARED CANVAS DEMO</Text>
                <Text style={styles.title}>Capability-first workspace canvas</Text>
                <Text style={styles.subtitle}>
                    One responsive entry point now selects mobile, tablet, or web renderers while still consuming the same shared surfaces and layout state.
                </Text>
            </View>
            <View style={styles.roleRow}>
                {(['teacher', 'principal', 'founder'] as DemoRole[]).map((candidate) => (
                    <Pressable
                        key={candidate}
                        accessibilityRole="button"
                        onPress={() => {
                            setRole(candidate);
                            setNotice(`Switched to the ${ROLE_LABELS[candidate]} capability mix.`);
                        }}
                        style={[styles.roleChip, role === candidate ? styles.roleChipActive : null]}
                    >
                        <Text style={role === candidate ? styles.roleChipTextActive : styles.roleChipText}>
                            {ROLE_LABELS[candidate]}
                        </Text>
                    </Pressable>
                ))}
            </View>
            <View style={styles.noticePanel}>
                <Text style={styles.noticeLabel}>Demo note</Text>
                <Text style={styles.noticeText}>{notice}</Text>
            </View>
            <WorkspaceCanvas
                title={`${ROLE_LABELS[role]} Workspace Canvas`}
                subtitle="Responsive renderer demo with snapshot, temporal state, metadata, info, and action slots."
                surfaces={surfaces}
                layout={layout}
                getSurfaceSubtitle={(surface) => SURFACE_LIBRARY[surface.surfaceId as DemoSurfaceId].subtitle}
                getSurfaceSummary={(surface) => SURFACE_LIBRARY[surface.surfaceId as DemoSurfaceId].summary}
                getSurfaceSnapshot={(surface) => SURFACE_LIBRARY[surface.surfaceId as DemoSurfaceId].snapshot}
                getSurfaceTemporalLabel={(surface) => SURFACE_LIBRARY[surface.surfaceId as DemoSurfaceId].temporalLabel}
                getSurfaceTemporalTone={(surface) => SURFACE_LIBRARY[surface.surfaceId as DemoSurfaceId].temporalTone}
                getSurfaceMetadata={(surface) => SURFACE_LIBRARY[surface.surfaceId as DemoSurfaceId].metadata}
                renderSurfaceActions={(surface) => (
                    <View style={styles.inlineActions}>
                        {(SURFACE_LIBRARY[surface.surfaceId as DemoSurfaceId].actions).map((action: string, index: number) =>
                            renderActionButton(action, index === 0 ? 'primary' : 'secondary')
                        )}
                    </View>
                )}
                renderSurfaceContent={(surface) => (
                    <View style={styles.surfaceBody}>
                        <Text style={styles.surfaceBodyTitle}>Surface contract</Text>
                        <Text style={styles.surfaceBodyText}>
                            Capability: {surface.capabilityKey}
                        </Text>
                        <Text style={styles.surfaceBodyText}>
                            Package owner: {surface.ownerPackage}
                        </Text>
                        <Text style={styles.surfaceBodyText}>
                            Mobile/Web: {surface.mobileSupport ? 'mobile ' : ''}{surface.webSupport ? 'web' : ''}
                        </Text>
                    </View>
                )}
                onSurfacePress={(surface) => {
                    setNotice(`${String(surface.surfaceId)} selected in the ${ROLE_LABELS[role]} canvas.`);
                }}
                onPressSurfaceInfo={(surface) => {
                    setNotice(SURFACE_LIBRARY[surface.surfaceId as DemoSurfaceId].info);
                }}
                onToggleHidden={(surface) => {
                    updateRoleLayout((current) =>
                        setWorkspaceSurfaceHidden(current, surface.surfaceId, !surface.hidden)
                    );
                    setNotice(
                        `${surface.hidden ? 'Restored' : 'Hidden'} ${String(surface.surfaceId)} in the ${ROLE_LABELS[role]} demo.`
                    );
                }}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Theme.colors.vellum,
    },
    content: {
        padding: Theme.spacing.lg,
        gap: Theme.spacing.lg,
    },
    header: {
        gap: 8,
    },
    kicker: {
        fontSize: Theme.typography.fontSize.xs,
        fontWeight: '700',
        letterSpacing: 1.4,
        color: Theme.colors.saffronMuted,
    },
    title: {
        fontSize: Theme.typography.fontSize['2xl'],
        fontWeight: '700',
        color: Theme.colors.inkTruth,
    },
    subtitle: {
        maxWidth: 760,
        fontSize: Theme.typography.fontSize.md,
        lineHeight: 24,
        color: Theme.colors.bark,
    },
    roleRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Theme.spacing.sm,
    },
    roleChip: {
        borderRadius: Theme.corners.full,
        borderWidth: 1,
        borderColor: Theme.colors.saffronMuted,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: Theme.colors.silk,
    },
    roleChipActive: {
        backgroundColor: Theme.colors.inkTruth,
        borderColor: Theme.colors.inkTruth,
    },
    roleChipText: {
        fontSize: Theme.typography.fontSize.sm,
        fontWeight: '600',
        color: Theme.colors.inkTruth,
    },
    roleChipTextActive: {
        fontSize: Theme.typography.fontSize.sm,
        fontWeight: '700',
        color: Theme.colors.sacredWhite,
    },
    noticePanel: {
        borderRadius: Theme.corners.generous,
        borderWidth: 1,
        borderColor: Theme.colors.saffronWhisper,
        padding: Theme.spacing.md,
        backgroundColor: Theme.colors.silk,
        gap: 4,
    },
    noticeLabel: {
        fontSize: Theme.typography.fontSize.xs,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: Theme.colors.saffronMuted,
    },
    noticeText: {
        fontSize: Theme.typography.fontSize.md,
        lineHeight: 22,
        color: Theme.colors.inkTruth,
    },
    inlineActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Theme.spacing.xs,
    },
    actionChip: {
        borderRadius: Theme.corners.full,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: Theme.colors.silk,
    },
    actionChipPrimary: {
        backgroundColor: Theme.colors.templeGold,
        borderColor: Theme.colors.templeGold,
    },
    actionChipText: {
        fontSize: Theme.typography.fontSize.xs,
        fontWeight: '600',
        color: Theme.colors.inkTruth,
    },
    actionChipTextPrimary: {
        fontSize: Theme.typography.fontSize.xs,
        fontWeight: '700',
        color: Theme.colors.inkTruth,
    },
    surfaceBody: {
        gap: 4,
    },
    surfaceBodyTitle: {
        fontSize: Theme.typography.fontSize.sm,
        fontWeight: '700',
        color: Theme.colors.inkTruth,
    },
    surfaceBodyText: {
        fontSize: Theme.typography.fontSize.sm,
        lineHeight: 20,
        color: Theme.colors.bark,
    },
});
