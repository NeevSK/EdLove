import { useReducedMotion } from '@repo/core/hooks/useAccessibility';
import type { SelfViewFeature } from '@repo/self/components/BaseSelfView.types';
import type { SelfNavigatorMode } from '@repo/self/hooks/useSelfNavigatorMode';
import { BrandedEmptyState } from '@repo/ui/components/BrandedEmptyState';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import { useBreakpoint, useResponsiveGrid } from '@repo/ui/components/layout';
import SanctuaryFlashList from '@repo/ui/components/SanctuaryFlashList';
import { Layers, LayoutGrid } from '@repo/ui/icons';
import { Box, HStack, Pressable, Text, VStack } from '@repo/ui/primitives';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { tokens } from '@repo/ui/tokens';
import { hapticLight, hapticMedium, hapticSelection } from '@repo/ui/utils/haptics';
import React, { useCallback, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

export interface SelfNavigatorProps {
  features: (SelfViewFeature & { domainColor?: string })[];
  activeFeatureId?: string;
  pinned: string[];
  mode: SelfNavigatorMode;
  onModeToggle: () => void;
  onFeaturePress: (id: string) => void;
  onFeatureLongPress: (feature: SelfViewFeature) => void;
  getEmoji: (feature: SelfViewFeature) => string;
  getLabel: (feature: SelfViewFeature) => string;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export function SelfNavigator({
  features,
  activeFeatureId,
  pinned,
  mode,
  onModeToggle,
  onFeaturePress,
  onFeatureLongPress,
  getEmoji,
  getLabel,
  isLoading,
  error,
  onRetry,
}: SelfNavigatorProps) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const breakpoint = useBreakpoint();
  const { columns } = useResponsiveGrid();
  const reducedMotion = useReducedMotion();
  const isTablet = breakpoint !== 'phone';
  const isDesktop = breakpoint === 'desktop';
  // Web-on-mobile: force mobile layout when shell is webCompact (width <768 even on web)
  const isWebMobile = Platform.OS === 'web' && width <= 767;
  const effectiveIsTablet = isWebMobile ? false : isTablet;
  const tiledCols = effectiveIsTablet ? (isDesktop ? 5 : 4) : 3;
  // Container-aware: measure actual container width for tiled grid
  const [containerWidth, setContainerWidth] = useState(width);
  const { showToast } = useSanctuaryToast();

  const handleToggle = useCallback(() => {
    hapticLight();
    onModeToggle();
    showToast({
      message: mode === 'tiled' ? 'Switched to calm carousel' : 'Switched to full menu',
      type: 'info',
      duration: 1800,
    });
  }, [mode, onModeToggle, showToast]);

  // Swipe hint reserved — tap is primary; pan toggle would conflict with horizontal carousel scroll.
  // Keep tap as the elegant control (Linear's Cmd+K pattern), not swipe.

  const handlePress = useCallback(
    (id: string) => {
      hapticSelection();
      onFeaturePress(id);
    },
    [onFeaturePress],
  );

  const handleLongPress = useCallback(
    (feature: SelfViewFeature) => {
      hapticMedium();
      onFeatureLongPress(feature);
    },
    [onFeatureLongPress],
  );

  const renderItem = useCallback(
    ({ item: feature }: { item: SelfViewFeature & { domainColor?: string } }) => {
      const isActive = activeFeatureId === feature.id;
      const isPinned = pinned.includes(feature.id);
      const isInsight = feature.id === 'mirrors' || feature.id === 'reminders';
      const label = getLabel(feature);
      const isTiled = mode === 'tiled';

      return (
        <Pressable
          onPress={() => handlePress(feature.id)}
          onLongPress={() => handleLongPress(feature)}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ selected: isActive }}
          accessibilityHint="Double tap to open. Long press to save or remove from shortcuts."
          className="items-center"
          style={{
            width: isTiled ? (isTablet ? 104 : 92) : isTablet ? 104 : 72,
            margin: isTiled ? 6 : 0,
          }}
        >
          <Box
            className="w-16 h-16 rounded-full p-[3px] justify-center items-center mb-1 border-2"
            style={{
              borderColor: feature.domainColor,
              borderStyle: isInsight ? 'dashed' : 'solid',
              opacity: isActive ? 1 : 0.85,
            }}
          >
            <Box
              className="w-full h-full rounded-[30px] bg-white justify-center items-center shadow-sm"
              style={
                isActive
                  ? { shadowColor: feature.domainColor, shadowOpacity: 0.3 }
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
    [activeFeatureId, pinned, mode, handlePress, handleLongPress, getEmoji, getLabel, isTablet],
  );

  if (isLoading) {
    return (
      <VStack className="py-8 items-center gap-3">
        <BrandPulse size={28} />
        <Text className="text-xs font-semibold" style={{ color: tokens.colors.textMuted }}>
          Gathering your spaces…
        </Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <BrandedErrorState title="Spaces are resting" message={error.message}>
        {onRetry ? (
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            className="px-4 py-2 rounded-full"
            style={{
              backgroundColor: tokens.colors.surfaceElevated,
              borderWidth: 1,
              borderColor: tokens.colors.border,
            }}
          >
            <Text className="text-xs font-bold" style={{ color: tokens.colors.ink }}>
              Try again
            </Text>
          </Pressable>
        ) : null}
      </BrandedErrorState>
    );
  }

  if (features.length === 0) {
    return (
      <BrandedEmptyState
        title="A quiet space is ready"
        message="Your Self spaces will appear here when they have something to share."
        subtle
      />
    );
  }

  // Dynamic tiled column width from measured container
  const colWidthPct = `${100 / tiledCols}%`;

  return (
    <VStack className="gap-1" onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <HStack className="justify-between items-center px-md pb-2">
        <Text
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: tokens.colors.textMuted }}
        >
          {mode === 'tiled' ? `All spaces • ${features.length}` : 'Quick glide'}
        </Text>
        <Pressable
          onPress={handleToggle}
          accessibilityRole="button"
          accessibilityLabel={mode === 'tiled' ? 'Switch to carousel' : 'Switch to full menu'}
          accessibilityHint={
            mode === 'tiled' ? 'Comfort view: compact carousel' : 'Discovery view: full tiled menu'
          }
          className="w-9 h-9 rounded-full justify-center items-center border"
          style={{
            backgroundColor: tokens.colors.surfaceInteractive,
            borderColor: tokens.colors.borderSubtle,
          }}
        >
          {mode === 'tiled' ? (
            <Layers size={16} color={tokens.colors.ink} />
          ) : (
            <LayoutGrid size={16} color={tokens.colors.ink} />
          )}
        </Pressable>
      </HStack>

      <Animated.View
        layout={reducedMotion ? undefined : Layout.springify()}
        entering={reducedMotion ? undefined : FadeIn.duration(220)}
        exiting={reducedMotion ? undefined : FadeOut.duration(180)}
      >
        {mode === 'carousel' ? (
          <SanctuaryFlashList
            data={features}
            renderItem={renderItem}
            horizontal={!isLandscape}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              isLandscape
                ? { paddingVertical: tokens.spacing.xs, paddingHorizontal: tokens.spacing.xs }
                : { paddingHorizontal: effectiveIsTablet ? 32 : 20 }
            }
            estimatedItemSize={isLandscape ? 72 : effectiveIsTablet ? 104 : 72}
            keyExtractor={(item) => item.id}
            getItemType={(item) => (item.id === 'mirrors' ? 'insight' : 'regular')}
          />
        ) : (
          <Box
            className="px-md"
            style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}
          >
            {features.map((feature) => (
              <Animated.View
                key={feature.id}
                layout={reducedMotion ? undefined : Layout.springify()}
                entering={reducedMotion ? undefined : FadeIn.delay(20).duration(200)}
                style={
                  {
                    width: colWidthPct as unknown as number,
                    alignItems: 'center',
                    paddingVertical: 8,
                  } as never
                }
              >
                {renderItem({ item: feature })}
              </Animated.View>
            ))}
          </Box>
        )}
      </Animated.View>
      {/* Graceful helper: hint only on first visit, web narrow already mobile */}
      {mode === 'tiled' && containerWidth <= 360 ? (
        <Text className="text-center text-[10px] pt-1" style={{ color: tokens.colors.textMuted }}>
          Tip: switch to carousel for quick glide
        </Text>
      ) : null}
    </VStack>
  );
}
