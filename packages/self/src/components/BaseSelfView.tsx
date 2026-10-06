import { usePermissions, useStore, useTemporalStore } from '@repo/core/logic';
import type { BaseSelfViewProps, SelfViewFeature } from '@repo/self/components/BaseSelfView.types';
import { FeatureErrorBoundary } from '@repo/self/components/FeatureErrorBoundary';
import {
  getCalmFeatureLabel,
  getHistoryNotice,
  getShortcutToastMessage,
} from '@repo/self/components/selfEntryPresentation';
import {
  canonicalSelfFeatureId,
  FEATURE_DISCOVERY_DATA,
  FEATURE_EMOJIS,
} from '@repo/self/constants/selfRegistry';
import { useDynamicSelfFeatures } from '@repo/self/hooks/useDynamicSelfFeatures';
import { useFeatureActivity } from '@repo/self/hooks/useFeatureActivity';
import { BrandedEmptyState } from '@repo/ui/components/BrandedEmptyState';
import { DerivedHistoryView } from '@repo/ui/components/DerivedHistoryView';
import FeatureInfoIcon from '@repo/ui/components/FeatureInfoIcon';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import SanctuaryFlashList from '@repo/ui/components/SanctuaryFlashList';
import { TemporalNavigator } from '@repo/ui/components/TemporalNavigator';
import { Box, HStack, Pressable, ScrollView, Text, VStack } from '@repo/ui/primitives';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { tokens } from '@repo/ui/tokens';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

const TEMPORAL_SCALES = ['day', 'week', 'month', 'year'] as const;

/**
 * BaseSelfView - The architectural kernel for GuruDevi Self sections on Mobile.
 * Refactored for 2026: URL Resonance, Energy Sensing, and FlashList v2.
 */
export function BaseSelfView({
  perspective,
  domains,
  sideBar,
  reminders,
  morningRitual,
  nightRitual,
  voiceJournal,
}: BaseSelfViewProps) {
  const router = useRouter();

  const { viewMode, setViewMode, viewScale, setScale } = useTemporalStore();
  const isHistoryMode = viewMode === 'timeline';
  const { context } = usePermissions();
  const isAnonymous = context.isAnonymous;
  const isOnline = useStore((state) => state.isOnline);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = isLandscape ? height >= 600 : width >= 768;

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
      ...(domains.some((domain) => domain.content)
        ? [
            {
              id: 'holistic_history',
              label: 'Journey',
              content: domains.find((domain) => domain.content)?.content,
              historyContent:
                domains.find((domain) => domain.historyContent)?.historyContent ??
                domains.find((domain) => domain.content)?.content,
              domainId: 'journey',
              domainColor: tokens.colors.accentDepth,
              energyVibe: [tokens.colors.surface, tokens.colors.surfaceSubtle] as [string, string],
            },
          ]
        : []),
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
              energyVibe: [tokens.colors.surfaceElevated, tokens.colors.surfaceSubtle] as [
                string,
                string,
              ],
            },
          ]
        : []),
    ],
    [domains, sideBar, reminders],
  );

  const { getPinnedFeatures, togglePin, trackFeatureAccess } = useFeatureActivity();
  const { showToast } = useSanctuaryToast();
  const { topItems: sortedFeatures } = useDynamicSelfFeatures(allFeatures);
  const pinned = getPinnedFeatures().map(canonicalSelfFeatureId);

  const [activeFeatureId, setActiveFeatureId] = React.useState<string | undefined>();
  const activeFeatureIdResolved =
    activeFeatureId ??
    sortedFeatures.find((f) => f.id === 'daily_pulse' || f.id === 'mood_checkin')?.id ??
    sortedFeatures[0]?.id;

  const activeFeature = useMemo(
    () => sortedFeatures.find((f) => f.id === activeFeatureIdResolved) || sortedFeatures[0],
    [sortedFeatures, activeFeatureIdResolved],
  );

  // Energy Sensing: Derive background from active feature's vibe
  const backgroundStyle = useMemo(() => {
    const baseColor =
      perspective === 'student' ? tokens.colors.surface : tokens.colors.surfaceElevated;
    const activeVibe = activeFeature?.energyVibe?.[0] || baseColor;
    return {
      backgroundColor: activeVibe,
    };
  }, [activeFeature, perspective]);

  const getEmoji = useCallback(
    (feature: SelfViewFeature) => FEATURE_EMOJIS[feature.id as keyof typeof FEATURE_EMOJIS] || '✨',
    [],
  );

  const handleFeaturePress = useCallback(
    (featureId: string) => {
      setActiveFeatureId(featureId);
      trackFeatureAccess(featureId);
    },
    [trackFeatureAccess],
  );

  const handleFeatureLongPress = useCallback(
    (feature: SelfViewFeature) => {
      togglePin(feature.id);
      showToast({
        message: getShortcutToastMessage(feature, pinned.includes(feature.id)),
        type: 'info',
        duration: 2500,
      });
    },
    [pinned, showToast, togglePin],
  );

  const renderFeatureItem = useCallback(
    ({ item: feature }: { item: SelfViewFeature & { domainColor?: string } }) => {
      const isActive = activeFeatureIdResolved === feature.id;
      const isPinned = pinned.includes(feature.id);
      const isInsight = feature.id === 'mirrors' || feature.id === 'reminders';
      const label = getCalmFeatureLabel(feature);

      return (
        <Pressable
          onPress={() => handleFeaturePress(feature.id)}
          onLongPress={() => handleFeatureLongPress(feature)}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityHint="Double tap to open. Long press to save or remove from shortcuts."
          className="items-center"
          style={{ width: isTablet ? 104 : 72 }}
        >
          <Box
            className="w-16 h-16 rounded-full p-[3px] justify-center items-center mb-1 border-2"
            style={{
              borderColor: feature.domainColor,
              borderStyle: isInsight ? 'dashed' : 'solid',
              opacity: isActive ? 1 : 0.4,
            }}
          >
            <Box
              className="w-full h-full rounded-[30px] bg-white justify-center items-center shadow-sm"
              style={
                isActive
                  ? {
                      shadowColor: feature.domainColor,
                      shadowOpacity: 0.3,
                    }
                  : { shadowOpacity: 0.05 }
              }
            >
              <Text className="text-2xl">{getEmoji(feature)}</Text>
              {isPinned && (
                <Box
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full justify-center items-center border-2 border-white shadow-sm"
                  style={{ backgroundColor: feature.domainColor }}
                >
                  <Box accessible={false} className="w-1.5 h-1.5 rounded-full bg-white" />
                </Box>
              )}
            </Box>
          </Box>
          <Box
            className={`w-1 h-1 rounded-full mb-1 ${isActive ? '' : 'bg-transparent'}`}
            style={isActive ? { backgroundColor: feature.domainColor } : {}}
          />
          <Text
            numberOfLines={1}
            className={`text-[9px] text-center uppercase tracking-wider font-bold ${
              isActive ? 'text-black' : 'text-black/40'
            }`}
            style={{ fontSize: isTablet ? 11 : 9 }}
          >
            {label}
          </Text>
        </Pressable>
      );
    },
    [
      activeFeatureIdResolved,
      pinned,
      handleFeatureLongPress,
      handleFeaturePress,
      getEmoji,
      isTablet,
    ],
  );

  const renderFeatureContent = (feature?: SelfViewFeature & { domainColor?: string }) => {
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
              message="There is no update for this space yet."
              subtle
            />
          )}
        </FeatureErrorBoundary>
      </>
    );
  };

  return (
    <VStack
      className="flex-1 transition-all duration-700"
      style={{
        ...backgroundStyle,
        maxWidth: isTablet ? 1024 : undefined,
        alignSelf: isTablet ? 'center' : undefined,
        width: '100%',
      }}
    >
      <GlobalHeader isSelfView={true} subtitle={perspective.toUpperCase()} title="Sadhana" />

      <TemporalNavigator />

      <TemporalShellControls
        isHistoryMode={isHistoryMode}
        viewScale={viewScale}
        onModeChange={setViewMode}
        onScaleChange={setScale}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {voiceJournal && <Box className="px-lg pt-sm">{voiceJournal}</Box>}
        {morningRitual && <Box className="px-lg pt-sm">{morningRitual}</Box>}

        {!isOnline && (
          <Box
            className="mx-md mt-sm rounded-xl border px-md py-sm"
            style={{
              borderColor: tokens.colors.surfaceSubtle,
              backgroundColor: tokens.colors.surfaceSubtle,
            }}
          >
            <Text className="text-xs" style={{ color: tokens.colors.inkSubtle }}>
              Offline · saved entries remain available. New entries will sync later.
            </Text>
          </Box>
        )}
        {isHistoryMode && (
          <Box
            className="mx-md mt-sm rounded-xl border px-md py-sm"
            style={{
              borderColor: tokens.colors.surfaceSubtle,
              backgroundColor: tokens.colors.surfaceSubtle,
            }}
          >
            <Text className="text-xs" style={{ color: tokens.colors.inkSubtle }}>
              {getHistoryNotice(viewScale)}
            </Text>
          </Box>
        )}

        <Box
          style={{
            flexDirection: isLandscape ? 'row' : 'column',
            flex: isLandscape ? 1 : undefined,
            width: '100%',
          }}
        >
          <Box
            className="py-md bg-transparent"
            style={{
              width: isLandscape ? 136 : '100%',
              minHeight: isLandscape ? undefined : 110,
              paddingHorizontal: isLandscape ? tokens.spacing.xs : isTablet ? tokens.spacing.sm : 0,
            }}
          >
            <SanctuaryFlashList
              data={sortedFeatures}
              renderItem={renderFeatureItem}
              horizontal={!isLandscape}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                isLandscape
                  ? { paddingVertical: tokens.spacing.xs, paddingHorizontal: tokens.spacing.xs }
                  : { paddingHorizontal: isTablet ? 32 : 20 }
              }
              keyExtractor={(item) => item.id}
              getItemType={(item) => (item.id === 'mirrors' ? 'insight' : 'regular')}
            />
          </Box>

          <Box
            className="px-md pt-md min-h-[400px]"
            style={{
              flex: isLandscape ? 1 : undefined,
              paddingHorizontal: isTablet ? 32 : 16,
              width: isLandscape ? undefined : '100%',
              maxWidth: isLandscape ? 900 : undefined,
              alignSelf: isLandscape ? 'center' : undefined,
            }}
          >
            {activeFeature && (
              <VStack className="mb-4">
                <HStack className="justify-between items-center mb-3">
                  <HStack className="items-center flex-1 gap-1">
                    <Text className="text-lg font-semibold" style={{ color: tokens.colors.ink }}>
                      {activeFeature.label}
                    </Text>
                    <FeatureInfoIcon
                      title={activeFeature.label}
                      discoveryInfo={
                        FEATURE_DISCOVERY_DATA[
                          activeFeature.id as keyof typeof FEATURE_DISCOVERY_DATA
                        ]
                      }
                      color={activeFeature.domainColor}
                    />
                  </HStack>
                  <Text className="text-xs" style={{ color: tokens.colors.textMuted }}>
                    {isHistoryMode ? viewScale : 'Now'}
                  </Text>
                </HStack>
                {renderFeatureContent(activeFeature)}
              </VStack>
            )}
            {!activeFeature && (
              <BrandedEmptyState
                title="A quiet space is ready"
                message="Your Self spaces will appear here when they have something to share."
                subtle
              />
            )}
          </Box>
        </Box>

        {nightRitual && <Box className="px-lg pt-sm">{nightRitual}</Box>}

        {isAnonymous && (
          <Box className="mt-8 border-t border-black/5 pt-8">
            <PositiveInvitation
              type="anonymous"
              context="self"
              onAction={() => {
                router.push('/auth');
              }}
            />
          </Box>
        )}
      </ScrollView>
    </VStack>
  );
}

function TemporalShellControls({
  isHistoryMode,
  viewScale,
  onModeChange,
  onScaleChange,
}: {
  isHistoryMode: boolean;
  viewScale: string;
  onModeChange: (mode: 'spotlight' | 'timeline') => void;
  onScaleChange: (scale: 'day' | 'week' | 'month' | 'year') => void;
}) {
  return (
    <Box className="px-lg pt-sm pb-sm gap-2">
      <HStack className="gap-2 items-center">
        <Pressable
          onPress={() => onModeChange('spotlight')}
          accessibilityRole="button"
          className="px-3.5 py-2 rounded-full border"
          style={{
            backgroundColor: !isHistoryMode ? tokens.colors.surfaceElevated : tokens.colors.surface,
            borderColor: !isHistoryMode ? tokens.colors.success : tokens.colors.borderSubtle,
          }}
          accessibilityState={{ selected: !isHistoryMode }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: !isHistoryMode ? tokens.colors.success : tokens.colors.inkSubtle }}
          >
            Now
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onModeChange('timeline')}
          accessibilityRole="button"
          className="px-3.5 py-2 rounded-full border"
          style={{
            backgroundColor: isHistoryMode
              ? tokens.colors.surfaceInteractive
              : tokens.colors.surface,
            borderColor: isHistoryMode ? tokens.colors.info : tokens.colors.borderSubtle,
          }}
          accessibilityState={{ selected: isHistoryMode }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: isHistoryMode ? tokens.colors.info : tokens.colors.inkSubtle }}
          >
            History
          </Text>
        </Pressable>
      </HStack>
      {isHistoryMode && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 20 }}
        >
          {TEMPORAL_SCALES.map((scale) => (
            <Pressable
              key={scale}
              onPress={() => onScaleChange(scale)}
              accessibilityRole="button"
              className="px-3 py-1.5 rounded-full border"
              style={{
                backgroundColor:
                  viewScale === scale ? tokens.colors.surfaceInteractive : tokens.colors.surface,
                borderColor: viewScale === scale ? tokens.colors.info : tokens.colors.borderSubtle,
              }}
              accessibilityState={{ selected: viewScale === scale }}
            >
              <Text
                className="text-xs font-semibold"
                style={{
                  color: viewScale === scale ? tokens.colors.info : tokens.colors.inkSubtle,
                }}
              >
                {scale}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </Box>
  );
}

function HistoryScaffold({
  feature,
  viewScale,
}: {
  feature: SelfViewFeature & { domainColor?: string };
  viewScale: string;
}) {
  return (
    <Box
      className="border rounded-[20px] px-[18px] py-5"
      style={{
        borderColor: feature.domainColor || tokens.colors.accentDepth,
        backgroundColor: tokens.colors.glass,
      }}
    >
      <Text className="text-sm font-semibold mb-2" style={{ color: tokens.colors.ink }}>
        {feature.label} history
      </Text>
      <Text className="text-[13px] leading-5" style={{ color: tokens.colors.inkSubtle }}>
        {`The shell is ready to show ${viewScale}-range history here once this feature exposes its temporal view.`}
      </Text>
    </Box>
  );
}
