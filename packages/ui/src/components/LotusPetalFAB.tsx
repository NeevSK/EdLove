import { useBottomTabPadding } from '@repo/ui/components/ScreenWrapper';
import { UniversalModal } from '@repo/ui/components/UniversalModal';
import { useFAB } from '@repo/ui/context/FABContext';
import { useAccessibility } from '@repo/ui/hooks/useAccessibility';
import { Wind } from '@repo/ui/icons';
import { Box, HStack, Pressable, Text, VStack } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';
import type React from 'react';
import { type FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import {
  Gesture,
  GestureDetector,
  type GestureStateChangeEvent,
  type GestureUpdateEvent,
  type PanGestureChangeEventPayload,
  type PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

// ============================================================================
// TYPES
// ============================================================================

import type { ActionItem, TabType } from '@repo/ui/types/fab';

interface LotusPetalFABProps {
  currentTab?: TabType | null;
  onPress?: () => void;
  icon?: React.ReactNode;
  actions?: ActionItem[];
  scrollY?: SharedValue<number>;
  disabled?: boolean;
  bottomInset?: number;
  hasActiveGaps?: boolean;
  gapPriority?: 'low' | 'medium' | 'high';
  onBreathingReset?: () => void;
  useGlobal?: boolean;
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const FAB_SIZE = 56;
const FAB_EDGE_MARGIN = 24; // Equivalent to Theme.spacing.lg
const FAB_DRAG_THRESHOLD = 8;
const FAB_WEB_STORAGE_KEY = 'gurudevi_lotus_fab_position_v1';

const fabConfig: Record<TabType, { emoji: string; label: string }> = {
  self: { emoji: '🪷', label: 'Reflection' },
  classroom: { emoji: '➕', label: 'Add' },
  community: { emoji: '💬', label: 'Community' },
  library: { emoji: '📚', label: 'Library' },
  profile: { emoji: '👤', label: 'Profile' },
  section: { emoji: '🏢', label: 'Section' },
  grade: { emoji: '🏫', label: 'Grade' },
  principal: { emoji: '👑', label: 'Management' },
  founder: { emoji: '🏛️', label: 'Founder' },
};

function clampGesturePosition(
  x: number,
  y: number,
  width: number,
  height: number,
  bottomInset: number,
  bottomTabPadding: number,
) {
  'worklet';
  const maxX = Math.max(FAB_EDGE_MARGIN, width - FAB_SIZE - FAB_EDGE_MARGIN);
  const maxY = Math.max(
    FAB_EDGE_MARGIN,
    height - FAB_SIZE - FAB_EDGE_MARGIN - (bottomInset + bottomTabPadding),
  );
  return {
    x: Math.max(FAB_EDGE_MARGIN, Math.min(maxX, x)),
    y: Math.max(FAB_EDGE_MARGIN, Math.min(maxY, y)),
  };
}

// ============================================================================
// ACTION ITEM COMPONENT (FOR MEMOIZATION)
// ============================================================================

const FABActionItem: FC<{ action: ActionItem; onPress: (a: ActionItem) => void }> = ({
  action,
  onPress,
}) => {
  const handlePress = useCallback(() => onPress(action), [action, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      className="p-4 rounded-xl hover:bg-white/5 active:bg-white/10"
    >
      <HStack className="items-center gap-3">
        {action.icon && <action.icon size={20} color="#F6BF8C" strokeWidth={2} />}
        <Text className="text-phase-text-primary">{action.label}</Text>
      </HStack>
    </Pressable>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const LotusPetalFAB: FC<LotusPetalFABProps> = memo(
  ({
    currentTab: propTab,
    onPress: propPress,
    icon: customIcon,
    actions: propActions,
    disabled = false,
    bottomInset = 24,
    hasActiveGaps: propGaps,
    onBreathingReset: propReset,
    useGlobal = true,
    className,
  }: LotusPetalFABProps) => {
    const { state: globalState } = useFAB();
    const { isReduceMotionEnabled } = useAccessibility();
    const bottomTabPadding = useBottomTabPadding();
    const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();

    // Reconcile props with global state
    const currentTab = (propTab ?? globalState.tabType) as TabType;
    const actions = propActions || globalState.actions;
    const hasActiveGaps = propGaps ?? globalState.hasActiveGaps;
    const onPress = propPress || globalState.onPress;
    const onBreathingReset = propReset || globalState.onBreathingReset;
    const isVisible = useGlobal
      ? globalState.visible &&
        propTab !== null &&
        (propTab === undefined || propTab === globalState.tabType)
      : true;
    const icon = customIcon || globalState.icon;

    const config = useMemo(() => fabConfig[currentTab] || fabConfig.self, [currentTab]);

    // Reanimated Shared Values
    const pressScale = useSharedValue(1);
    const breathingScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.4);

    // Position Shared Values for Draggability
    const positionX = useSharedValue(0);
    const positionY = useSharedValue(0);
    const dragStartX = useSharedValue(0);
    const dragStartY = useSharedValue(0);

    const [isDrawerVisible, setIsDrawerVisible] = useState(false);

    const clampFabToViewport = useCallback(
      (x: number, y: number) => {
        const maxX = Math.max(FAB_EDGE_MARGIN, viewportWidth - FAB_SIZE - FAB_EDGE_MARGIN);
        const maxY = Math.max(
          FAB_EDGE_MARGIN,
          viewportHeight - FAB_SIZE - FAB_EDGE_MARGIN - (bottomInset + bottomTabPadding),
        );
        return {
          x: Math.max(FAB_EDGE_MARGIN, Math.min(maxX, x)),
          y: Math.max(FAB_EDGE_MARGIN, Math.min(maxY, y)),
        };
      },
      [bottomInset, bottomTabPadding, viewportHeight, viewportWidth],
    );

    const persistWebPosition = useCallback((x: number, y: number) => {
      if (Platform.OS !== 'web') return;
      try {
        if (typeof window === 'undefined' || !window.localStorage) return;
        window.localStorage.setItem(FAB_WEB_STORAGE_KEY, JSON.stringify({ x, y }));
      } catch {
        // Ignore storage failures
      }
    }, []);

    const setDefaultPosition = useCallback(() => {
      const preferredX = viewportWidth - FAB_SIZE - FAB_EDGE_MARGIN;
      const preferredY =
        viewportHeight - FAB_SIZE - FAB_EDGE_MARGIN - (bottomInset + bottomTabPadding);
      const next = clampFabToViewport(preferredX, preferredY);
      positionX.value = next.x;
      positionY.value = next.y;
    }, [
      bottomInset,
      bottomTabPadding,
      clampFabToViewport,
      positionX,
      positionY,
      viewportHeight,
      viewportWidth,
    ]);

    const handlePress = useCallback(() => {
      if (disabled) return;
      hapticLight();

      if (actions && actions.length > 0) {
        scheduleOnRN(setIsDrawerVisible, true);
        return;
      }

      if (onPress) {
        pressScale.value = withSequence(withTiming(0.9, { duration: 100 }), withSpring(1));
        onPress();
      }
    }, [disabled, onPress, actions, pressScale]);

    useEffect(() => {
      let initialized = false;
      if (Platform.OS === 'web') {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            const raw = window.localStorage.getItem(FAB_WEB_STORAGE_KEY);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
                const next = clampFabToViewport(parsed.x, parsed.y);
                positionX.value = next.x;
                positionY.value = next.y;
                initialized = true;
              }
            }
          }
        } catch {
          // Ignore and use default position
        }
      }

      if (!initialized) {
        scheduleOnRN(setDefaultPosition);
      }
    }, [clampFabToViewport, positionX, positionY, setDefaultPosition]);

    useEffect(() => {
      const next = clampFabToViewport(positionX.value, positionY.value);
      positionX.value = next.x;
      positionY.value = next.y;
      persistWebPosition(next.x, next.y);
    }, [clampFabToViewport, persistWebPosition, positionX, positionY]);

    const dragGesture = useMemo(
      () =>
        Gesture.Pan()
          .enabled(!disabled)
          .minDistance(FAB_DRAG_THRESHOLD)
          .maxPointers(1)
          .onStart(() => {
            'worklet';
            dragStartX.value = positionX.value;
            dragStartY.value = positionY.value;
            pressScale.value = withSpring(1.1);
            scheduleOnRN(hapticLight);
          })
          .onUpdate(
            (event: GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload>) => {
              'worklet';
              const next = clampGesturePosition(
                dragStartX.value + event.translationX,
                dragStartY.value + event.translationY,
                viewportWidth,
                viewportHeight,
                bottomInset,
                bottomTabPadding,
              );
              positionX.value = next.x;
              positionY.value = next.y;
            },
          )
          .onEnd((_event: GestureStateChangeEvent<PanGestureHandlerEventPayload>, success: boolean) => {
            'worklet';
            pressScale.value = withSpring(1);
            if (success) {
              scheduleOnRN(persistWebPosition, positionX.value, positionY.value);
            }
            positionX.value = withSpring(positionX.value, { damping: 15 });
            positionY.value = withSpring(positionY.value, { damping: 15 });
          })
          .onFinalize(() => {
            'worklet';
            pressScale.value = withSpring(1);
          }),
      [
        disabled,
        bottomInset,
        bottomTabPadding,
        dragStartX,
        dragStartY,
        persistWebPosition,
        positionX,
        positionY,
        pressScale,
        viewportHeight,
        viewportWidth,
      ],
    );

    const tapGesture = useMemo(
      () =>
        Gesture.Tap()
          .enabled(!disabled)
          .maxDistance(FAB_DRAG_THRESHOLD)
          .onEnd(() => {
            'worklet';
            scheduleOnRN(handlePress);
          }),
      [disabled, handlePress],
    );

    const composedGesture = useMemo(
      () => Gesture.Exclusive(tapGesture, dragGesture),
      [tapGesture, dragGesture],
    );

    // Breathing Animation
    useEffect(() => {
      if (!disabled && !isReduceMotionEnabled) {
        breathingScale.value = withRepeat(
          withTiming(1.1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true,
        );
        pulseOpacity.value = withRepeat(
          withTiming(0.7, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true,
        );
      }
    }, [disabled, isReduceMotionEnabled, breathingScale, pulseOpacity]);

    const containerStyle = useAnimatedStyle(() => ({
      left: positionX.value,
      top: positionY.value,
      transform: [{ scale: pressScale.value }],
    }));

    const breathingStyle = useAnimatedStyle(() => ({
      transform: [{ scale: breathingScale.value }],
      opacity: pulseOpacity.value,
    }));

    const closeDrawer = useCallback(() => scheduleOnRN(setIsDrawerVisible, false), []);

    const handleBreathingReset = useCallback(() => {
      scheduleOnRN(setIsDrawerVisible, false);
      onBreathingReset?.();
    }, [onBreathingReset]);

    const handleActionPress = useCallback((action: ActionItem) => {
      scheduleOnRN(setIsDrawerVisible, false);
      action.onPress();
    }, []);

    if (!isVisible) return null;

    return (
      <Box pointerEvents="box-none" className="absolute inset-0 z-[1000]">
        <GestureDetector gesture={composedGesture}>
          <Animated.View
            style={[containerStyle]}
            className="absolute w-14 h-14 items-center justify-center pointer-events-auto"
            accessible
            accessibilityRole="button"
            accessibilityLabel={hasActiveGaps ? 'Open urgent actions' : `${config.label} actions`}
            accessibilityHint="Tap to open actions. Drag to reposition."
            accessibilityState={{ disabled }}
            onAccessibilityTap={handlePress}
          >
            {/* Breathing Glow */}
            <Animated.View
              style={breathingStyle}
              className={`
                        absolute w-[72px] h-[72px] rounded-full
                        ${hasActiveGaps ? 'bg-phase-error opacity-60' : 'bg-phase-accent opacity-40'}
                    `}
            />

            {/* Main FAB Circle */}
            <Box
              className={`
                        w-14 h-14 rounded-full items-center justify-center bg-phase-accent
                        shadow-xl shadow-black/30 border-2 border-white/10
                        ${className || ''}
                    `}
            >
              {hasActiveGaps ? (
                <Text className="text-2xl">❗</Text>
              ) : icon ? (
                icon
              ) : (
                <Text className="text-2xl">{config.emoji}</Text>
              )}
            </Box>
          </Animated.View>
        </GestureDetector>

        {/* Action Drawer */}
        <UniversalModal isOpen={isDrawerVisible} onClose={closeDrawer} hasBackdrop={false}>
          <Pressable
            accessibilityRole="button"
            className="flex-1 bg-black/50 justify-end"
            onPress={closeDrawer}
          >
            <Box className="bg-phase-surface rounded-t-[32px] p-8 min-h-[40vh] w-full mt-auto">
              <Box className="w-10 h-1 bg-phase-text-secondary/30 rounded-full self-center mb-6" />

              <VStack className="gap-4">
                <Text className="text-xl font-bold text-phase-text-primary mb-2">
                  {config.label} Actions
                </Text>

                {onBreathingReset && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleBreathingReset}
                    className="p-4 rounded-xl bg-phase-success/10 active:bg-phase-success/20"
                  >
                    <HStack className="items-center gap-3">
                      <Wind size={20} color="#10B981" strokeWidth={2} />
                      <Text className="text-phase-text-primary font-semibold">Breathing Reset</Text>
                    </HStack>
                  </Pressable>
                )}

                {actions?.map((action: ActionItem, idx: number) => (
                  <FABActionItem key={idx} action={action} onPress={handleActionPress} />
                ))}
              </VStack>
            </Box>
          </Pressable>
        </UniversalModal>
      </Box>
    );
  },
);

export default LotusPetalFAB;
