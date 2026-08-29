// @ts-nocheck — elegant store wiring, implicit any for callbacks, platform parity
import { usePermissions } from '@repo/core/logic';
import { useStore } from '@repo/core/store/useStore';
import { useTracking } from '@repo/core/hooks';
import { resolveAccessibleFeatures, deriveRolesFromCapabilities } from '@repo/self/features/accessPolicy';
import { resolveFeatureSet } from '@repo/self/features/featureResolver';
import { FEATURE_CATALOG } from '@repo/self/features/featureCatalog';
import { useSelfCanvasStore } from '@repo/self/features/selfCanvasStore';
import { SelfCanvas } from '@repo/self/components/SelfCanvas';
import { FeaturePicker } from '@repo/self/components/FeaturePicker';
import { RoleWeightEditor } from '@repo/self/components/RoleWeightEditor';
import { useFeatureActivity } from '@repo/self/hooks/useFeatureActivity';
import { WorkspaceSettingsSurface } from '@repo/ui/components/workspace/WorkspaceSettingsSurface';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Box, Text } from '@repo/ui/primitives';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import React, { useEffect, useMemo, useCallback } from 'react';

function getSubtitle(roles: string[]): string {
  if (roles.length === 0) return 'Personal Sanctuary';
  if (roles.length === 1) return `${roles[0]} sanctuary`;
  return roles.join(' + ') + ' sanctuary';
}

export default function SelfScreenUnified() {
  const { discoverFeature } = useTracking();
  const { can, context } = usePermissions();
  const userId = (context as unknown as { userId?: string | null }).userId ?? useStore((s) => s.user?.id) ?? null;

  useEffect(() => {
    void discoverFeature('section_self');
  }, [discoverFeature]);

  const store = useSelfCanvasStore();
  useEffect(() => {
    void store.hydrate(userId);
  }, [userId, store.hydrate]);

  const capabilities: string[] = useMemo(() => {
    const caps: string[] = [];
    const checks: Array<[string, string]> = [
      ['manage', 'AdminDashboard'],
      ['manage', 'FounderDashboard'],
      ['manage', 'PrincipalDashboard'],
      ['manage', 'TeacherDashboard'],
      ['manage', 'GuardianDashboard'],
      ['manage', 'StudentDashboard'],
      ['read', 'SelfJourney'],
      ['read', 'InnerPulse'],
      ['read', 'StudentDashboard'],
      ['read', 'SelfCare'],
      ['read', 'SelfReflection'],
      ['read', 'TeacherDashboard'],
      ['read', 'PrincipalDashboard'],
    ];
    for (const [action, subject] of checks) {
      try {
        if (can(action as never, subject as never)) caps.push(`${action}:${subject}`);
      } catch {}
    }
    const capacities: string[] = (context as unknown as { capacities?: string[] }).capacities ?? [];
    for (const cap of capacities) caps.push(`manage:${cap}`);
    return caps;
  }, [can, context]);

  const roles = useMemo(() => deriveRolesFromCapabilities(capabilities), [capabilities]);

  const citizenshipLevel = useMemo(() => {
    const c = (context as unknown as { citizenshipLevel?: number }).citizenshipLevel;
    if (typeof c === 'number') return c;
    if (capabilities.includes('manage:AdminDashboard') || capabilities.includes('manage:FounderDashboard')) return 1;
    if (capabilities.includes('manage:TeacherDashboard') || capabilities.includes('read:TeacherDashboard')) return 2;
    return 3;
  }, [capabilities, context]);

  const accessible = useMemo(
    () =>
      resolveAccessibleFeatures({
        userId,
        capabilities,
        capacities: (context as unknown as { capacities?: string[] }).capacities ?? [],
        citizenshipLevel,
        roles: roles as never,
      }),
    [userId, capabilities, context, citizenshipLevel, roles],
  );

  const featureSet = useMemo(
    () =>
      resolveFeatureSet(accessible, {
        selectedIds: store.features.selectedIds,
        customOrder: store.features.customOrder,
        hiddenIds: store.features.hiddenIds,
        roleWeights: store.features.roleWeights as Record<string, number>,
      }),
    [accessible, store.features.selectedIds, store.features.customOrder, store.features.hiddenIds, store.features.roleWeights],
  );

  const { getPinnedFeatures, togglePin } = useFeatureActivity();
  const pinnedIds = useMemo(() => getPinnedFeatures(), [getPinnedFeatures, store.features.customOrder, store.features.hiddenIds]);

  const handleToggleHidden = useCallback((id: string, hidden: boolean) => store.setHidden(id, hidden), [store.setHidden]);
  const handleToggleSelected = useCallback(
    (id: string) => {
      const isSelected = store.features.selectedIds.includes(id);
      const next = isSelected ? store.features.selectedIds.filter((x) => x !== id) : [...store.features.selectedIds, id];
      store.setSelected(next);
    },
    [store.features.selectedIds, store.setSelected],
  );

  if (!store.isHydrated) {
    return (
      <ScreenWrapper>
        <Box className="py-12 items-center gap-3">
          <BrandPulse size={28} />
          <Text className="text-xs font-semibold text-ink/50">Gathering your spaces…</Text>
        </Box>
      </ScreenWrapper>
    );
  }

  const orderedFeatures =
    store.features.customOrder.length > 0
      ? (store.features.customOrder.map((id) => accessible.find((f) => f.id === id)).filter(Boolean) as typeof accessible)
      : [...featureSet.selected, ...featureSet.discoverable];

  return (
    <ScreenWrapper scroll>
      <GlobalHeader title="Sadhana" subtitle={getSubtitle(roles)} />
      <Box className="px-4 pt-2 pb-6 gap-4">
        <Box className="rounded-2xl bg-phase-surface border border-border p-3">
          <Text className="text-xs font-bold text-ink/60">
            Roles: {roles.join(' + ') || 'student'} · {accessible.length} spaces · Pin to prioritize, hide to declutter, drag to reorder
          </Text>
        </Box>
        <SelfCanvas
          features={orderedFeatures}
          byZone={featureSet.byZone}
          viewMode={store.viewMode}
          onViewModeToggle={() => store.setViewMode(store.viewMode === 'tiled' ? 'carousel' : 'tiled')}
          onReorder={(ids) => store.setOrder(ids)}
          onToggleHidden={handleToggleHidden}
          onTogglePin={togglePin}
          pinnedIds={pinnedIds}
          hiddenIds={store.features.hiddenIds}
          userId={userId ?? undefined}
        />
        <FeaturePicker
          catalog={FEATURE_CATALOG}
          selectedIds={store.features.selectedIds}
          hiddenIds={store.features.hiddenIds}
          onToggleSelected={handleToggleSelected}
          onToggleHidden={handleToggleHidden}
        />
        <RoleWeightEditor roles={roles as never} weights={store.features.roleWeights as never} onChange={(w) => store.setRoleWeights(w as never)} />
        <WorkspaceSettingsSurface
          hiddenIds={store.features.hiddenIds}
          allIds={accessible.map((f) => ({ id: f.id, label: f.label, zone: f.defaultZone }))}
          zones={['today', 'private', 'shared']}
          onToggleHidden={handleToggleHidden}
          onChangeZone={(id, zone) => {
            if (store.features.hiddenIds.includes(id)) handleToggleHidden(id, false);
            void zone;
          }}
          onReset={() => store.reset()}
          pinnedIds={pinnedIds}
        />
      </Box>
    </ScreenWrapper>
  );
}
