import { usePermissions, useStore, useTemporalStore } from '@repo/core/logic';
import FeatureInfoIcon from '@repo/ui/components/FeatureInfoIcon';
import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import { DerivedHistoryView } from '@repo/ui/components/DerivedHistoryView';
import { SanctuaryCard } from '@repo/ui/components/SanctuaryCard';
import { TemporalNavigator } from '@repo/ui/components/TemporalNavigator';
import { BrandedEmptyState } from '@repo/ui/components/BrandedEmptyState';
import ErrorMessage from '@repo/ui/components/ErrorMessage';
import { tokens } from '@repo/ui/tokens';
import { Box, HStack, Pressable, ScrollView, Text, VStack } from '@repo/ui/primitives';
import { useEffect, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import type { BaseSelfViewProps, SelfViewFeature } from '@repo/self/components/BaseSelfView.types';
import { FeatureErrorBoundary } from '@repo/self/components/FeatureErrorBoundary';
import {
  canonicalSelfFeatureId,
  FEATURE_DISCOVERY_DATA,
  FEATURE_EMOJIS,
} from '@repo/self/constants/selfRegistry';
import { useFeatureActivity } from '@repo/self/hooks/useFeatureActivity';
import { getCalmFeatureLabel, getHistoryNotice } from '@repo/self/components/selfEntryPresentation';

/**
 * BaseSelfView.web - Capability-Driven Sanctuary for Web.
 * Optimized for 2026: URL Resonance, Energy Sensing, and Fault Tolerance.
 */
export function BaseSelfView({ perspective, domains, sideBar, reminders }: BaseSelfViewProps) {
  const { context } = usePermissions();
  const isAnonymous = context.isAnonymous;
  const isOnline = useStore((state) => state.isOnline);
  const { width } = useWindowDimensions();
  const breakpoint = width >= 1024 ? 'desktop' : width >= 600 ? 'tablet' : 'phone';
  const frame = {
    gutter: breakpoint === 'desktop' ? tokens.spacing.xl : breakpoint === 'tablet' ? tokens.spacing.lg : tokens.spacing.md,
    maxWidth: breakpoint === 'desktop' ? 960 : breakpoint === 'tablet' ? 720 : '100%',
  } as const;
  const gridColumns = breakpoint === 'desktop' ? 3 : breakpoint === 'tablet' ? 2 : 1;

  const { viewMode, setViewMode, viewScale } = useTemporalStore();
  const isHistoryMode = viewMode === 'timeline';

  const allFeatures = useMemo(
    () => [
      ...domains.flatMap((domain) =>
          (domain.features || []).map((feature) => ({
            ...feature,
            id: canonicalSelfFeatureId(feature.id),
          domainId: domain.id,
          domainColor: domain.accentColor,
          energyVibe: domain.energyVibe,
        })),
      ),
      ...(sideBar
        ? [
            {
              id: 'mirrors',
              label: 'Reflections',
              content: sideBar,
              historyContent: sideBar,
              domainId: 'reflections',
              domainColor: tokens.colors.accentDepth,
              energyVibe: [tokens.colors.surface, tokens.colors.surfaceSubtle] as [string, string],
            },
          ]
        : []),
      ...(reminders
        ? [
            {
              id: 'reminders',
              label: 'Reminders',
              content: reminders,
              historyContent: reminders,
              domainId: 'reminders',
              domainColor: tokens.colors.warning,
              energyVibe: [tokens.colors.surfaceElevated, tokens.colors.surfaceSubtle] as [string, string],
            },
          ]
        : []),
    ],
    [domains, sideBar, reminders],
  );

  const { getPinnedFeatures, togglePin, trackFeatureAccess } = useFeatureActivity();
  const pinned = getPinnedFeatures().map(canonicalSelfFeatureId);

  const [focusedItemId, setFocusedItemId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash.replace('#', '');
    return hash ? canonicalSelfFeatureId(hash) : null;
  });

  // URL Resonance: Sync focused feature with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const newHash = window.location.hash.replace('#', '');
      setFocusedItemId(newHash || null);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const updateFocusedId = (id: string | null) => {
    const canonicalId = id ? canonicalSelfFeatureId(id) : null;
    setFocusedItemId(canonicalId);
    window.location.hash = canonicalId || '';
    if (canonicalId) trackFeatureAccess(canonicalId);
  };

  const focusedFeature = useMemo(
    () => allFeatures.find((f) => f.id === focusedItemId) || null,
    [allFeatures, focusedItemId],
  );

  // Energy Sensing: Derive background from focused domain or perspective
  const backgroundStyle = useMemo(() => {
    const baseVibe = perspective === 'student'
      ? [tokens.colors.surface, tokens.colors.surfaceElevated]
      : [tokens.colors.surfaceElevated, tokens.colors.surface];
    const activeVibe = focusedFeature?.energyVibe || baseVibe;
    return {
      backgroundColor: activeVibe[0],
      transition: 'background 0.8s ease-in-out',
    };
  }, [focusedFeature, perspective]);

  const renderFocusedFeature = (feature: SelfViewFeature | null) => {
    if (!feature) return null;

    const content = isHistoryMode
      ? (feature.historyContent ?? <HistoryScaffold feature={feature} viewScale={viewScale} />)
      : feature.content;

    return (
      <>
        {feature.temporalView ? (
          <DerivedHistoryView
            mode={isHistoryMode ? 'history' : 'now'}
            onModeChange={(mode) => setViewMode(mode === 'history' ? 'timeline' : 'spotlight')}
            {...feature.temporalView}
          />
        ) : null}
        <FeatureErrorBoundary featureName={feature.label}>
          {content ?? (
            <BrandedEmptyState
              title="This space is taking shape"
              message="There is no view for this role yet."
            />
          )}
        </FeatureErrorBoundary>
      </>
    );
  };

  return (
    <Box
      className="flex-1 flex-col h-full overflow-hidden"
      style={{
        ...backgroundStyle,
        backgroundColor: backgroundStyle.backgroundColor,
        minHeight: '100%',
      }}
    >
      {/* Temporal Control Bar */}
      <Box
        className="sanctuary-glass-hub sticky top-0 z-30"
        style={{
          paddingHorizontal: frame.gutter,
          paddingVertical: tokens.spacing.lg,
          backgroundColor: tokens.colors.glass,
          borderBottomWidth: 1,
          borderBottomColor: tokens.colors.surfaceSubtle,
        }}
      >
        <HStack className="justify-between items-center gap-6 flex-wrap">
          <VStack>
            <Text style={{ fontSize: tokens.typography.sizes.xxl, fontWeight: '800', color: tokens.colors.ink }}>
              Sadhana
            </Text>
            <Text style={{ fontSize: tokens.typography.sizes.xs, fontWeight: '700', color: tokens.colors.inkSubtle, textTransform: 'uppercase', letterSpacing: 1.2 }}>
              {isHistoryMode ? `History · ${viewScale}` : 'Now'}
            </Text>
          </VStack>

          <HStack className="gap-4 items-center">
            <TemporalNavigator />
            <Box style={{ height: 32, width: 1, backgroundColor: tokens.colors.surfaceSubtle, marginHorizontal: tokens.spacing.sm }} />
            <HStack className="gap-2.5 items-center">
              <Pressable
                onPress={() => {
                  setViewMode('spotlight');
                  updateFocusedId(null);
                }}
                accessibilityRole="button"
                accessibilityLabel="Show current self spaces"
                accessibilityHint="Switches from history to the current view"
                accessibilityState={{ selected: !isHistoryMode }}
                  style={{
                    paddingHorizontal: tokens.spacing.lg,
                    paddingVertical: tokens.spacing.sm,
                    borderRadius: tokens.radii.full,
                    borderWidth: 1,
                    borderColor: !isHistoryMode ? tokens.colors.success : tokens.colors.borderSubtle,
                    backgroundColor: !isHistoryMode ? tokens.colors.surfaceElevated : tokens.colors.surface,
                    opacity: !isHistoryMode ? 1 : 0.5,
                  }}
              >
                <Text style={{ fontSize: tokens.typography.sizes.xs, fontWeight: '600', color: tokens.colors.ink }}>
                  Now
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setViewMode('timeline')}
                accessibilityRole="button"
                accessibilityLabel="Show self history"
                accessibilityHint="Switches to the timeline view"
                accessibilityState={{ selected: isHistoryMode }}
                  style={{
                    paddingHorizontal: tokens.spacing.lg,
                    paddingVertical: tokens.spacing.sm,
                    borderRadius: tokens.radii.full,
                    borderWidth: 1,
                    borderColor: isHistoryMode ? tokens.colors.info : tokens.colors.borderSubtle,
                    backgroundColor: isHistoryMode ? tokens.colors.surfaceInteractive : tokens.colors.surface,
                    opacity: isHistoryMode ? 1 : 0.5,
                  }}
              >
                <Text style={{ fontSize: tokens.typography.sizes.xs, fontWeight: '600', color: tokens.colors.ink }}>
                  History
                </Text>
              </Pressable>
            </HStack>
          </HStack>
        </HStack>
      </Box>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: frame.gutter, paddingVertical: tokens.spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <Box style={{ maxWidth: frame.maxWidth, width: '100%', alignSelf: 'center' }}>
          {!isOnline && (
            <Box style={{ marginBottom: tokens.spacing.lg, padding: tokens.spacing.md, borderRadius: tokens.radii.md, backgroundColor: tokens.colors.surfaceSubtle, borderWidth: 1, borderColor: tokens.colors.surfaceSubtle }}>
              <Text style={{ fontSize: tokens.typography.sizes.sm, color: tokens.colors.inkSubtle }}>
                Offline · saved entries remain available. New entries will sync later.
              </Text>
            </Box>
          )}
          {isHistoryMode && (
            <Box style={{ marginBottom: tokens.spacing.lg, padding: tokens.spacing.md, borderRadius: tokens.radii.md, backgroundColor: tokens.colors.surfaceSubtle, borderWidth: 1, borderColor: tokens.colors.surfaceSubtle }}>
              <Text style={{ fontSize: tokens.typography.sizes.sm, color: tokens.colors.inkSubtle }}>
                {getHistoryNotice(viewScale)}
              </Text>
            </Box>
          )}
        {focusedItemId ? (
          <Box className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Pressable
              onPress={() => updateFocusedId(null)}
              accessibilityRole="button"
              className="flex-row items-center gap-2 mb-8 group opacity-60 hover:opacity-100 transition-all"
            >
              <Text className="text-xl group-hover:-translate-x-1 transition-transform">←</Text>
              <Text className="text-sm font-semibold" style={{ color: tokens.colors.inkSubtle }}>
                Back
              </Text>
            </Pressable>

            <SanctuaryCard
              className="p-10 border-l-[8px] sanctuary-glass-card shadow-2xl"
              style={{ borderLeftColor: focusedFeature?.domainColor ?? tokens.colors.accentDepth }}
            >
              <HStack className="justify-between items-start mb-8">
                <HStack className="items-center gap-4">
                  <Text className="text-4xl">
                    {FEATURE_EMOJIS[focusedFeature?.id as keyof typeof FEATURE_EMOJIS] || '✨'}
                  </Text>
                  <VStack>
                    <Text className="text-2xl font-black tracking-tight">
                      {focusedFeature?.label}
                    </Text>
                  </VStack>
                </HStack>
                <HStack className="gap-3">
                  <FeatureInfoIcon
                    title={focusedFeature?.label ?? 'Capability'}
                    discoveryInfo={
                      FEATURE_DISCOVERY_DATA[
                        focusedFeature?.id as keyof typeof FEATURE_DISCOVERY_DATA
                      ]
                    }
                    color={focusedFeature?.domainColor}
                  />
                  <Pressable
                    onPress={() => togglePin(focusedFeature?.id || '')}
                    accessibilityRole="button"
                    accessibilityLabel={pinned.includes(focusedFeature?.id || '') ? 'Unpin focused space' : 'Pin focused space'}
                    accessibilityState={{ selected: pinned.includes(focusedFeature?.id || '') }}
                    className="p-2 bg-black/5 rounded-full"
                  >
                    <Box
                      accessible={false}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: pinned.includes(focusedFeature?.id || '') ? tokens.colors.success : tokens.colors.textMuted }}
                    />
                  </Pressable>
                </HStack>
              </HStack>
              <Box className="min-h-[500px]">{renderFocusedFeature(focusedFeature)}</Box>
            </SanctuaryCard>
          </Box>
        ) : (
          <VStack className="gap-16 w-full">
            {!domains.length ? (
              <ErrorMessage type="warning" message="Your current perspective does not have a readable Self surface." />
            ) : null}
            {domains.map((domain) => (
              <VStack key={domain.id} className="gap-8">
                <HStack className="items-center gap-4">
                  <Box
                    className="w-2 h-8 rounded-full"
                    style={{ backgroundColor: domain.accentColor || tokens.colors.accentDepth }}
                  />
                  <Text className="text-xl font-semibold" style={{ color: tokens.colors.ink }}>
                    {domain.title}
                  </Text>
                </HStack>
                {domain.content && (
                  <Box className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {domain.content}
                  </Box>
                )}

                <Box
                  className={`grid gap-6 ${gridColumns === 3 ? 'xl:grid-cols-3' : gridColumns === 2 ? 'md:grid-cols-2' : 'grid-cols-1'}`}
                >
                  {domain.features?.map((feature) => (
                    <SanctuaryCard
                      key={feature.id}
                      onPress={() => updateFocusedId(feature.id)}
                      className="hover:scale-[1.02] hover:shadow-2xl transition-all duration-500 border-l-[4px] sanctuary-glass-card"
                      style={{ borderLeftColor: domain.accentColor }}
                    >
                      <HStack className="justify-between items-start mb-4">
                        <Text className="text-3xl">
                          {FEATURE_EMOJIS[feature.id as keyof typeof FEATURE_EMOJIS] || '✨'}
                        </Text>
                        {pinned.includes(feature.id) && <Text className="text-xs">📌</Text>}
                      </HStack>
                      <Text className="text-base font-semibold mb-1" style={{ color: tokens.colors.ink }}>
                        {getCalmFeatureLabel(feature)}
                      </Text>
                      {feature.summary ? (
                        <Text className="text-sm leading-relaxed" style={{ color: tokens.colors.inkSubtle }} numberOfLines={2}>
                          {feature.summary}
                        </Text>
                      ) : null}
                    </SanctuaryCard>
                  ))}
                </Box>
              </VStack>
            ))}

            {isAnonymous && (
              <Box className="mt-20 py-20 border-t border-black/5 flex items-center justify-center">
                <Box className="max-w-2xl w-full">
                  <PositiveInvitation context="self" />
                </Box>
              </Box>
            )}
            {sideBar && (
              <Box style={{ marginTop: tokens.spacing.xl, paddingTop: tokens.spacing.xl, borderTopWidth: 1, borderTopColor: tokens.colors.surfaceSubtle }}>
                {sideBar}
              </Box>
            )}
          </VStack>
        )}
        </Box>
      </ScrollView>
    </Box>
  );
}

function HistoryScaffold({ feature, viewScale }: { feature: SelfViewFeature; viewScale: string }) {
  return (
    <Box
      className="border rounded-3xl px-8 py-8 bg-white/20"
      style={{ borderColor: feature.domainColor || tokens.colors.accentDepth }}
    >
      <Text className="text-lg font-black mb-4 uppercase tracking-widest">
        {feature.label} history
      </Text>
      <Text className="text-sm leading-7" style={{ color: tokens.colors.inkSubtle }}>
        {`Viewing the ${viewScale} perspective. Analytics will surface as data builds.`}
      </Text>
    </Box>
  );
}
