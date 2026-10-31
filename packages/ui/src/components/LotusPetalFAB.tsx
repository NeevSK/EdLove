import { useBottomTabPadding } from '@repo/ui/components/ScreenWrapper';
import { useFAB } from '@repo/ui/context/FABContext';
import { useVisualCapabilities } from '@repo/ui/context/VisualCapabilities';
import {
  BookOpen,
  Building2,
  Crown,
  EyeOff,
  Flower2,
  Landmark,
  MessageCircle,
  MessageSquare,
  Plus,
  School,
  Sparkles,
  User,
  Wind,
  Zap,
} from '@repo/ui/icons';
import { hapticLight } from '@repo/ui/utils/haptics';
import type React from 'react';
import {
  type ComponentType,
  type FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import type { FabAction, KitIconProps } from '../theme/contracts';
import { useWorld } from '../theme/native/WorldContext';
import { ActionFab, FabMenu } from './native/Agent/Fab';

// ============================================================================
// TYPES
// ============================================================================

import type { ActionItem, AICompanionLaunchOptions, TabType } from '@repo/ui/types/fab';

interface LotusPetalFABProps {
  currentTab?: TabType | null;
  onPress?: () => void;
  primaryActionLabel?: string;
  icon?: React.ReactNode;
  actions?: ActionItem[];
  scrollY?: SharedValue<number>;
  disabled?: boolean;
  bottomInset?: number;
  hasActiveGaps?: boolean;
  gapPriority?: 'low' | 'medium' | 'high';
  onBreathingReset?: () => void;
  onOpenAICompanion?: (options?: AICompanionLaunchOptions) => void;
  contextSummary?: string;
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
/** A release this soon after a drag is the drag ending, not a tap. */
const FAB_DRAG_SETTLE_MS = 400;

const fabConfig: Record<TabType, { icon: ComponentType<KitIconProps>; label: string }> = {
  self: { icon: Flower2, label: 'Reflection' },
  classroom: { icon: Plus, label: 'Add' },
  community: { icon: MessageCircle, label: 'Community' },
  library: { icon: BookOpen, label: 'Library' },
  profile: { icon: User, label: 'Profile' },
  section: { icon: Building2, label: 'Section' },
  grade: { icon: School, label: 'Grade' },
  principal: { icon: Crown, label: 'Management' },
  founder: { icon: Landmark, label: 'Founder' },
};

/** Workspace screens register their own kinds of action (a principal's, a founder's). */
const WORKSPACE_FAB_TYPES = new Set<TabType>([
  'classroom',
  'section',
  'grade',
  'principal',
  'founder',
]);

/**
 * Whether an action registered by a screen belongs to the tab on screen. Tabs keep their other
 * screens mounted, so a registration alone does not say the screen is the one in front.
 */
export function fabBelongsTo(current: TabType, registered: TabType): boolean {
  if (current === registered) return true;
  if (current === 'classroom') return WORKSPACE_FAB_TYPES.has(registered);
  // Public profiles open inside Community as well as Profile.
  if (current === 'community') return registered === 'profile';
  return false;
}

/** The menu a FAB opens, in the order it has always listed: primary, reset, screen actions, AI. */
export function fabMenuActions({
  tab,
  label,
  onPress,
  primaryActionLabel,
  onBreathingReset,
  actions,
  onOpenAICompanion,
  contextSummary,
}: {
  tab: TabType;
  label: string;
  onPress?: () => void;
  primaryActionLabel?: string;
  onBreathingReset?: () => void;
  actions?: readonly ActionItem[];
  onOpenAICompanion?: (options?: AICompanionLaunchOptions) => void;
  contextSummary?: string;
}): FabAction[] {
  const menu: FabAction[] = [];
  if (onPress)
    menu.push({
      key: 'primary',
      label: primaryActionLabel || `New ${label} Action`,
      icon: fabConfig[tab].icon,
      tone: 'lamp',
      onPress,
    });
  if (onBreathingReset)
    menu.push({
      key: 'breathing',
      label: 'Breathing Reset',
      icon: Wind,
      onPress: onBreathingReset,
    });
  actions?.forEach((action, i) =>
    menu.push({
      key: `action-${i}`,
      label: action.label,
      icon: action.icon ? strokeIcon(action.icon) : undefined,
      onPress: action.onPress,
    }),
  );
  if (onOpenAICompanion) {
    const group = 'Sanctuary AI Companion';
    menu.push({
      key: 'ai-ask',
      group,
      label: `Ask AI Companion (${label})`,
      hint: contextSummary ? `Context ready: ${contextSummary}` : undefined,
      icon: Sparkles,
      onPress: () => onOpenAICompanion({ mode: 'saved', tab: 'chat' }),
    });
    if (tab === 'community')
      menu.push({
        key: 'ai-mentor',
        group,
        label: 'Open Persistent AI Mentor DM',
        icon: MessageSquare,
        onPress: () => onOpenAICompanion({ mode: 'saved', tab: 'chat', threadId: 'mentor-dm' }),
      });
    if (tab === 'classroom' || tab === 'library')
      menu.push({
        key: 'ai-agent',
        group,
        label: 'Commission Deep Agent Mission',
        icon: Zap,
        onPress: () => onOpenAICompanion({ mode: 'saved', tab: 'agent' }),
      });
    menu.push({
      key: 'ai-incognito',
      group,
      label: 'Quick Incognito Ask (Zero-Trace)',
      icon: EyeOff,
      onPress: () => onOpenAICompanion({ mode: 'incognito', tab: 'chat' }),
    });
  }
  return menu;
}

/** Screen actions carry stroke icons; the menu draws kit icons, at its own size and tone. */
const strokeIcons = new WeakMap<NonNullable<ActionItem['icon']>, ComponentType<KitIconProps>>();
function strokeIcon(Glyph: NonNullable<ActionItem['icon']>): ComponentType<KitIconProps> {
  const known = strokeIcons.get(Glyph);
  if (known) return known;
  function ActionIcon({ size = 20, color = 'currentColor' }: KitIconProps) {
    return <Glyph size={size} color={color} strokeWidth={2} />;
  }
  strokeIcons.set(Glyph, ActionIcon);
  return ActionIcon;
}

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
// MAIN COMPONENT
// ============================================================================

/**
 * The app's floating action, drawn with the kit's `ActionFab` and `FabMenu`: the world's
 * lamp, its press motion and light, and a worded signal when something needs the person.
 * It keeps its place on screen, drags to a new one, and breathes only when motion allows.
 */
export const LotusPetalFAB: FC<LotusPetalFABProps> = memo(function LotusPetalFAB({
  currentTab: propTab,
  onPress: propPress,
  primaryActionLabel: propPrimaryLabel,
  icon: customIcon,
  actions: propActions,
  disabled = false,
  bottomInset = 24,
  hasActiveGaps: propGaps,
  onBreathingReset: propReset,
  onOpenAICompanion: propOpenAI,
  contextSummary: propContextSummary,
  useGlobal = true,
}: LotusPetalFABProps) {
  const { state: globalState } = useFAB();
  // Verger's motion level already includes the OS reduce-motion setting.
  const motion = useVisualCapabilities().experience.motion;
  const breathes = motion === 'rich' || motion === 'refined';
  const world = useWorld().tokens;
  const bottomTabPadding = useBottomTabPadding();
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();

  // Reconcile props with global state
  // The registered kind decides the label: a principal's dashboard is not a teacher's.
  const currentTab = (
    useGlobal ? globalState.tabType : (propTab ?? globalState.tabType)
  ) as TabType;
  const actions = propActions || globalState.actions;
  const hasActiveGaps = propGaps ?? globalState.hasActiveGaps;
  const onPress = propPress || globalState.onPress;
  const primaryActionLabel = propPrimaryLabel || globalState.primaryActionLabel;
  const onBreathingReset = propReset || globalState.onBreathingReset;
  const onOpenAICompanion = propOpenAI || globalState.onOpenAICompanion;
  const contextSummary = propContextSummary || globalState.contextSummary;
  const isVisible = useGlobal
    ? globalState.visible &&
      propTab !== null &&
      (propTab === undefined || fabBelongsTo(propTab, globalState.tabType))
    : true;
  const icon = customIcon || globalState.icon;

  const tab = fabConfig[currentTab] ? currentTab : 'self';
  const config = fabConfig[tab];
  // A screen may still hand over a drawn icon; it sits inside the kit's lamp as given.
  const Glyph = useMemo<ComponentType<KitIconProps>>(() => {
    if (!icon) return config.icon;
    return function RegisteredIcon() {
      return <>{icon}</>;
    };
  }, [icon, config.icon]);

  const menu = useMemo(
    () =>
      fabMenuActions({
        tab,
        label: config.label,
        onPress,
        primaryActionLabel,
        onBreathingReset,
        actions,
        onOpenAICompanion,
        contextSummary,
      }),
    [
      tab,
      config.label,
      onPress,
      primaryActionLabel,
      onBreathingReset,
      actions,
      onOpenAICompanion,
      contextSummary,
    ],
  );

  // Reanimated Shared Values
  const pressScale = useSharedValue(1);
  const breathingScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.4);

  // Position Shared Values for Draggability
  const positionX = useSharedValue(0);
  const positionY = useSharedValue(0);
  const dragStartX = useSharedValue(0);
  const dragStartY = useSharedValue(0);
  const draggedAt = useRef(0);

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
    positionX.set(next.x);
    positionY.set(next.y);
  }, [
    bottomInset,
    bottomTabPadding,
    clampFabToViewport,
    positionX,
    positionY,
    viewportHeight,
    viewportWidth,
  ]);

  const markDragged = useCallback(() => {
    draggedAt.current = Date.now();
  }, []);

  // The kit's press already gives the press feedback; this only decides what a tap opens.
  const handlePress = useCallback(() => {
    if (disabled || Date.now() - draggedAt.current < FAB_DRAG_SETTLE_MS) return;
    if ((actions && actions.length > 0) || onOpenAICompanion || onBreathingReset) {
      setIsDrawerVisible(true);
      return;
    }
    onPress?.();
  }, [disabled, onPress, actions, onOpenAICompanion, onBreathingReset]);

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
              positionX.set(next.x);
              positionY.set(next.y);
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
    const next = clampFabToViewport(positionX.get(), positionY.get());
    positionX.set(next.x);
    positionY.set(next.y);
    persistWebPosition(next.x, next.y);
  }, [clampFabToViewport, persistWebPosition, positionX, positionY]);

  // Taps reach the kit's button; a drag past the threshold moves it instead.
  const dragGesture = usePanGesture({
    enabled: !disabled,
    minDistance: FAB_DRAG_THRESHOLD,
    maxPointers: 1,
    onActivate: () => {
      'worklet';
      dragStartX.set(positionX.get());
      dragStartY.set(positionY.get());
      pressScale.set(withSpring(1.1));
      scheduleOnRN(markDragged);
      scheduleOnRN(hapticLight);
    },
    onUpdate: (event) => {
      'worklet';
      const next = clampGesturePosition(
        dragStartX.get() + event.translationX,
        dragStartY.get() + event.translationY,
        viewportWidth,
        viewportHeight,
        bottomInset,
        bottomTabPadding,
      );
      positionX.set(next.x);
      positionY.set(next.y);
    },
    onDeactivate: (event) => {
      'worklet';
      pressScale.set(withSpring(1));
      scheduleOnRN(markDragged);
      if (!event.canceled) {
        scheduleOnRN(persistWebPosition, positionX.get(), positionY.get());
      }
      positionX.set(withSpring(positionX.get(), { damping: 15 }));
      positionY.set(withSpring(positionY.get(), { damping: 15 }));
    },
    onFinalize: () => {
      'worklet';
      pressScale.set(withSpring(1));
    },
  });

  // Breathing Animation
  // Only while it is on screen and verger allows motion: a hidden FAB must cost nothing.
  useEffect(() => {
    if (disabled || !isVisible || !breathes) {
      cancelAnimation(breathingScale);
      cancelAnimation(pulseOpacity);
      breathingScale.set(1);
      pulseOpacity.set(0.4);
      return;
    }
    breathingScale.set(
      withRepeat(withTiming(1.1, { duration: 4000, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
    pulseOpacity.set(
      withRepeat(withTiming(0.7, { duration: 4000, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
    return () => {
      cancelAnimation(breathingScale);
      cancelAnimation(pulseOpacity);
    };
  }, [disabled, isVisible, breathes, breathingScale, pulseOpacity]);

  const containerStyle = useAnimatedStyle(() => ({
    left: positionX.get(),
    top: positionY.get(),
    transform: [{ scale: pressScale.get() }],
  }));

  const breathingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathingScale.get() }],
    opacity: pulseOpacity.get(),
  }));

  const closeDrawer = useCallback(() => setIsDrawerVisible(false), []);

  if (!isVisible) return null;

  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <GestureDetector gesture={dragGesture}>
        <Animated.View style={[styles.place, containerStyle]}>
          {/* The breath behind the lamp; still when motion is reduced or the FAB is hidden. */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.breath,
              { backgroundColor: hasActiveGaps ? world.danger : world.glow },
              breathingStyle,
            ]}
          />
          <ActionFab
            label={`${config.label} actions`}
            icon={Glyph}
            onPress={handlePress}
            signal={hasActiveGaps}
            signalLabel="urgent"
          />
        </Animated.View>
      </GestureDetector>

      <FabMenu
        open={isDrawerVisible}
        onClose={closeDrawer}
        label={`${config.label} Actions`}
        actions={menu}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 1000 },
  place: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breath: { position: 'absolute', width: 72, height: 72, borderRadius: 36 },
});

export default LotusPetalFAB;
