import { Wind } from '@repo/ui/icons';
import type React from 'react';
import { type FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useFAB } from '../context/FABContext';
import { Box, HStack, Pressable, Text, VStack } from '../gluestack';
import { useAccessibility } from '../hooks/useAccessibility';
import { Dimensions, PanResponder, Platform } from '../primitives';
import { hapticLight } from '../utils/haptics';
import { useBottomTabPadding } from './ScreenWrapper';
import { UniversalModal } from './UniversalModal';

// ============================================================================
// TYPES
// ============================================================================

import type { ActionItem, TabType } from '../types/fab';

interface LotusPetalFABProps {
  currentTab?: TabType;
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

    // Reconcile props with global state
    const currentTab = (propTab || globalState.tabType) as TabType;
    const actions = propActions || globalState.actions;
    const hasActiveGaps = propGaps ?? globalState.hasActiveGaps;
    const onPress = propPress || globalState.onPress;
    const onBreathingReset = propReset || globalState.onBreathingReset;
    const isVisible = useGlobal ? globalState.visible : true;
    const icon = customIcon || globalState.icon;

    const config = useMemo(() => fabConfig[currentTab] || fabConfig.self, [currentTab]);

    // Reanimated Shared Values
    const pressScale = useSharedValue(1);
    const breathingScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.4);

    // Position Shared Values for Draggability
    const positionX = useSharedValue(0);
    const positionY = useSharedValue(0);
    const dragStartX = useRef(0);
    const dragStartY = useRef(0);

    const [isDrawerVisible, setIsDrawerVisible] = useState(false);

    const clampFabToViewport = useCallback(
      (x: number, y: number) => {
        const windowDims = Dimensions.get('window');
        const maxX = Math.max(FAB_EDGE_MARGIN, windowDims.width - FAB_SIZE - FAB_EDGE_MARGIN);
        const maxY = Math.max(
          FAB_EDGE_MARGIN,
          windowDims.height - FAB_SIZE - FAB_EDGE_MARGIN - (bottomInset + bottomTabPadding),
        );
        return {
          x: Math.max(FAB_EDGE_MARGIN, Math.min(maxX, x)),
          y: Math.max(FAB_EDGE_MARGIN, Math.min(maxY, y)),
        };
      },
      [bottomInset, bottomTabPadding],
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
      const windowDims = Dimensions.get('window');
      const preferredX = windowDims.width - FAB_SIZE - FAB_EDGE_MARGIN;
      const preferredY =
        windowDims.height - FAB_SIZE - FAB_EDGE_MARGIN - (bottomInset + bottomTabPadding);
      const next = clampFabToViewport(preferredX, preferredY);
      positionX.value = next.x;
      positionY.value = next.y;
    }, [bottomInset, bottomTabPadding, clampFabToViewport, positionX, positionY]);

    const handlePress = useCallback(() => {
      if (disabled) return;
      hapticLight();

      if (actions && actions.length > 0) {
        setIsDrawerVisible(true);
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
        setDefaultPosition();
      }
    }, [clampFabToViewport, positionX, positionY, setDefaultPosition]);

    useEffect(() => {
      const sub = Dimensions.addEventListener('change', () => {
        const next = clampFabToViewport(positionX.value, positionY.value);
        positionX.value = next.x;
        positionY.value = next.y;
        persistWebPosition(next.x, next.y);
      });
      return () => sub.remove();
    }, [clampFabToViewport, persistWebPosition, positionX, positionY]);

    // PanResponder for draggability
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => {
          return (
            Math.abs(gesture.dx) > FAB_DRAG_THRESHOLD || Math.abs(gesture.dy) > FAB_DRAG_THRESHOLD
          );
        },
        onPanResponderGrant: () => {
          dragStartX.current = positionX.value;
          dragStartY.current = positionY.value;
          pressScale.value = withSpring(1.1);
          hapticLight();
        },
        onPanResponderMove: (_, gesture) => {
          const next = clampFabToViewport(
            dragStartX.current + gesture.dx,
            dragStartY.current + gesture.dy,
          );
          positionX.value = next.x;
          positionY.value = next.y;
        },
        onPanResponderRelease: (_, gesture) => {
          pressScale.value = withSpring(1);

          // Tap
          if (
            Math.abs(gesture.dx) < FAB_DRAG_THRESHOLD &&
            Math.abs(gesture.dy) < FAB_DRAG_THRESHOLD
          ) {
            handlePress();
            return;
          }

          const next = clampFabToViewport(positionX.value, positionY.value);
          positionX.value = withSpring(next.x, { damping: 15 });
          positionY.value = withSpring(next.y, { damping: 15 });
          persistWebPosition(next.x, next.y);
        },
      }),
    ).current;

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

    const closeDrawer = useCallback(() => setIsDrawerVisible(false), []);

    const handleBreathingReset = useCallback(() => {
      setIsDrawerVisible(false);
      onBreathingReset?.();
    }, [onBreathingReset]);

    const handleActionPress = useCallback((action: ActionItem) => {
      setIsDrawerVisible(false);
      action.onPress();
    }, []);

    if (!isVisible) return null;

    return (
      <Box className="absolute inset-0 z-[1000] pointer-events-none">
        <Animated.View
          {...panResponder.panHandlers}
          style={[containerStyle]}
          className="absolute w-14 h-14 items-center justify-center pointer-events-auto"
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

        {/* Action Drawer */}
        <UniversalModal isOpen={isDrawerVisible} onClose={closeDrawer}>
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
