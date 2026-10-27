import { useAuthStore } from '@repo/core/store';
import { useScaffoldDismissal, useTracking } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';

import { FeaturePicker } from '@repo/self/components/FeaturePicker';
import { RoleWeightEditor } from '@repo/self/components/RoleWeightEditor';
import { SelfCanvas } from '@repo/self/components/SelfCanvas';
import {
  deriveRolesFromCapabilities,
  resolveAccessibleFeatures,
} from '@repo/self/features/accessPolicy';
import { FEATURE_CATALOG } from '@repo/self/features/featureCatalog';
import { resolveFeatureSet } from '@repo/self/features/featureResolver';
import { describeSelfCanvasPersistence } from '@repo/self/features/selfCanvasPersistence';
import { useSelfCanvasStore } from '@repo/self/features/selfCanvasStore';
import { useFeatureActivity } from '@repo/self/hooks/useFeatureActivity';
import { useSanctuaryHealth } from '@repo/self/hooks/useSanctuaryHealth';
import { useUIStore } from '@repo/core/store';
import { FireflyMascot, sensoryFeedback } from '@repo/ui';
import { BrandedEmptyState } from '@repo/ui/components/BrandedEmptyState';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { WorkspaceSettingsSurface } from '@repo/ui/components/workspace/WorkspaceSettingsSurface';
import { Box, Button, ButtonText, HStack, Pressable, Text, VStack } from '@repo/ui/primitives';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

function getSubtitle(roles: string[]): string {
  if (roles.length === 0) return 'Personal Sanctuary';
  if (roles.length === 1) return `${roles[0]} sanctuary`;
  return roles.join(' + ') + ' sanctuary';
}

type PermissionResolution = {
  capabilities: string[];
  error: string | null;
};

export default function SelfScreenUnified() {
  const { discoverFeature } = useTracking();
  const { can, context } = usePermissions();
  const [permissionRetryNonce, setPermissionRetryNonce] = useState(0);
  const storeUserId = useAuthStore(s => s.user?.id);
  const userId = (context as unknown as { userId?: string | null }).userId ?? storeUserId ?? null;

  const { mindfulMinutesToday, recoverySignal } = useSanctuaryHealth();
  const setBreathingOpen = useUIStore((s) => s.setBreathingOpen);
  const { isDismissed: isDay0ScaffoldDismissed, completeScaffold: dismissDay0Scaffold } =
    useScaffoldDismissal('self_day0_reflection_scaffold', 1);

  useEffect(() => {
    void discoverFeature('section_self');
  }, [discoverFeature]);

  const store = useSelfCanvasStore();
  useEffect(() => {
    void store.hydrate(userId);
  }, [userId, store.hydrate]);

  const permissionResolution = useMemo<PermissionResolution>(() => {
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
      } catch (error) {
        return {
          capabilities: [],
          error:
            error instanceof Error
              ? error.message
              : 'Your sanctuary permissions could not be resolved.',
        };
      }
    }
    const capacities: string[] = (context as unknown as { capacities?: string[] }).capacities ?? [];
    for (const cap of capacities) caps.push(`manage:${cap}`);
    return { capabilities: caps, error: null };
  }, [can, context, permissionRetryNonce]);

  const capabilities = permissionResolution.capabilities;

  const capacities = useMemo(
    () => (context.capacity ? [context.capacity] : ['student']),
    [context.capacity],
  );
  const roles = useMemo(
    () => deriveRolesFromCapabilities(capabilities, capacities),
    [capabilities, capacities],
  );

  const citizenshipLevel = useMemo(() => {
    const c = (context as unknown as { citizenshipLevel?: number }).citizenshipLevel;
    if (typeof c === 'number') return c;
    if (
      capabilities.includes('manage:AdminDashboard') ||
      capabilities.includes('manage:FounderDashboard')
    )
      return 1;
    if (
      capabilities.includes('manage:TeacherDashboard') ||
      capabilities.includes('read:TeacherDashboard')
    )
      return 2;
    return 3;
  }, [capabilities, context]);

  const accessible = useMemo(
    () =>
      resolveAccessibleFeatures({
        userId,
        capabilities,
        capacities,
        citizenshipLevel,
        roles: roles as never,
      }),
    [userId, capabilities, capacities, context, citizenshipLevel, roles],
  );

  const featureSet = useMemo(
    () =>
      resolveFeatureSet(accessible, {
        selectedIds: store.features.selectedIds,
        customOrder: store.features.customOrder,
        hiddenIds: store.features.hiddenIds,
        zoneOverrides: store.features.zoneOverrides,
        roleWeights: store.features.roleWeights as Record<string, number>,
      }),
    [
      accessible,
      store.features.selectedIds,
      store.features.customOrder,
      store.features.hiddenIds,
      store.features.roleWeights,
      store.features.zoneOverrides,
    ],
  );

  const { getPinnedFeatures, togglePin } = useFeatureActivity();
  const pinnedIds = useMemo(
    () => getPinnedFeatures(),
    [getPinnedFeatures, store.features.customOrder, store.features.hiddenIds],
  );

  const handleToggleHidden = useCallback(
    (id: string, hidden: boolean) => store.setHidden(id, hidden),
    [store.setHidden],
  );
  const handleToggleSelected = useCallback(
    (id: string) => {
      const isSelected = store.features.selectedIds.includes(id);
      const next = isSelected
        ? store.features.selectedIds.filter((x) => x !== id)
        : [...store.features.selectedIds, id];
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

  if (permissionResolution.error) {
    return (
      <ScreenWrapper>
        <BrandedErrorState
          title="Your sanctuary permissions could not settle"
          message={permissionResolution.error}
        >
          <Pressable
            onPress={() => setPermissionRetryNonce((value) => value + 1)}
            accessibilityRole="button"
            accessibilityLabel="Try resolving sanctuary permissions again"
          >
            <Text className="text-phase-interactive font-bold">Try again</Text>
          </Pressable>
        </BrandedErrorState>
      </ScreenWrapper>
    );
  }

  if (accessible.length === 0) {
    return (
      <ScreenWrapper>
        <BrandedEmptyState
          title="Your sanctuary is waiting for its first space"
          message="There are no spaces available to this account yet. If this seems unexpected, check again or ask your school administrator to review your access."
        >
          <Pressable
            onPress={() => setPermissionRetryNonce((value) => value + 1)}
            accessibilityRole="button"
            accessibilityLabel="Check sanctuary access again"
          >
            <Text className="text-phase-interactive font-bold">Check again</Text>
          </Pressable>
        </BrandedEmptyState>
      </ScreenWrapper>
    );
  }

  const orderedFeatures = [...featureSet.selected, ...featureSet.discoverable];
  const persistenceFeedback = describeSelfCanvasPersistence(store.persistenceState);

  return (
    <ScreenWrapper scroll>
      <GlobalHeader title="Sadhana" subtitle={getSubtitle(roles)} />
      <Box className="px-4 pt-2 pb-6 gap-4">
        <Box className="rounded-2xl bg-phase-surface border border-border p-3">
          <Text className="text-xs font-bold text-ink/60">
            Roles: {roles.join(' + ') || 'student'} · {accessible.length} spaces · Pin to prioritize
            and hide to declutter
          </Text>
        </Box>

        {!isDay0ScaffoldDismissed ? (
          <Box className="rounded-3xl border border-phase-interactive/30 bg-phase-surface p-5 shadow-sm">
            <HStack className="items-center gap-4">
              <FireflyMascot size={64} mode="glowing" role="guide" />
              <VStack className="flex-1 gap-1">
                <Text className="text-xs font-bold uppercase tracking-wider text-phase-interactive">
                  Welcome to Sadhana
                </Text>
                <Text className="text-sm font-semibold text-ink">
                  {roles.includes('student')
                    ? 'Center your study rhythm, capture your thoughts, and nurture your joy jar.'
                    : roles.includes('teacher')
                      ? 'Take a mindful pause between classes and cultivate peaceful presence.'
                      : roles.includes('principal')
                        ? 'Contemplate your leadership vision with clarity and equanimity.'
                        : 'Calibrate your nervous system with quiet moments of self-reflection.'}
                </Text>
              </VStack>
            </HStack>
            <HStack className="mt-4 items-center justify-between gap-3">
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl border-border"
                onPress={() => {
                  hapticLight();
                  dismissDay0Scaffold();
                }}
              >
                <ButtonText className="text-xs text-ink/60">I know my way around</ButtonText>
              </Button>
              <Button
                size="sm"
                className="rounded-xl bg-phase-interactive"
                onPress={() => {
                  hapticSuccess();
                  setBreathingOpen(true);
                  dismissDay0Scaffold();
                }}
              >
                <ButtonText className="text-xs text-white font-bold">Take a Mindful Breath</ButtonText>
              </Button>
            </HStack>
          </Box>
        ) : null}

        {/* Sovereign Somatic Sanctuary & Health Port Card */}
        <Box className="flex-row items-center justify-between gap-3 rounded-2xl border border-phase-interactive/20 bg-phase-surface p-4 shadow-sm">
          <Box className="flex-1">
            <Text className="text-xs font-bold uppercase tracking-wider text-phase-interactive">
              Somatic Sanctuary • {recoverySignal?.level ?? 'serene'}
            </Text>
            <Text className="mt-1 text-sm font-semibold text-phase-text-primary">
              {mindfulMinutesToday} mindful min today
            </Text>
            <Text className="text-xs text-ink/60">
              Sovereign on-device sync • Calibrate your nervous system
            </Text>
          </Box>
          <Pressable
            onPress={() => {
              sensoryFeedback.emit('milestone');
              setBreathingOpen(true);
            }}
            className="rounded-full bg-phase-interactive px-4 py-2"
            accessibilityRole="button"
            accessibilityLabel="Open Sanctuary Pulse breathing space"
          >
            <Text className="text-xs font-bold text-white">Breathe</Text>
          </Pressable>
        </Box>
        {persistenceFeedback.label ? (
          <Box
            className={`flex-row items-center justify-between gap-3 rounded-xl border px-3 py-2 ${store.persistenceState === 'queued' ? 'border-phase-warning/30 bg-phase-warning/10' : 'border-border bg-phase-surface'}`}
            accessibilityLiveRegion="polite"
          >
            <Text className="flex-1 text-xs font-semibold text-ink/70">
              {persistenceFeedback.label}
            </Text>
            {persistenceFeedback.canRetry ? (
              <Pressable
                onPress={store.retryPersist}
                className="rounded-full bg-phase-interactive px-3 py-1.5"
                accessibilityRole="button"
                accessibilityLabel="Retry syncing your sanctuary layout"
              >
                <Text className="text-xs font-bold text-white">Retry</Text>
              </Pressable>
            ) : null}
          </Box>
        ) : null}
        <SelfCanvas
          features={orderedFeatures}
          byZone={featureSet.byZone}
          viewMode={store.viewMode}
          onViewModeToggle={() =>
            store.setViewMode(store.viewMode === 'catalog-grid' ? 'carousel' : 'catalog-grid')
          }
          onSetViewMode={(mode) => store.setViewMode(mode)}
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
        <RoleWeightEditor
          roles={roles as never}
          weights={store.features.roleWeights as never}
          onChange={(w) => store.setRoleWeights(w as never)}
        />
        <WorkspaceSettingsSurface
          hiddenIds={store.features.hiddenIds}
          allIds={accessible.map((feature) => ({
            id: feature.id,
            label: feature.label,
            zone: store.features.zoneOverrides[feature.id] ?? feature.defaultZone,
          }))}
          zones={['today', 'private', 'shared']}
          onToggleHidden={handleToggleHidden}
          onChangeZone={(id, zone) => store.setZone(id, zone as 'today' | 'private' | 'shared')}
          onReset={() => store.reset()}
          pinnedIds={pinnedIds}
        />
      </Box>
    </ScreenWrapper>
  );
}
