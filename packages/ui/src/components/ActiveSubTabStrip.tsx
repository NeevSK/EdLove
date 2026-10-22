import {
  type ActiveSubTabDomain,
  type ActiveSubTabItem,
  useActiveSubTabsStore,
} from '@repo/core/store/useActiveSubTabsStore';
import { GripVertical, X } from '@repo/ui/icons';
import { Box, Pressable, ScrollView, Text } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { hapticLight, hapticSelection } from '@repo/ui/utils/haptics';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { usePathname, useRouter } from 'expo-router';
import React, { useCallback, useRef } from 'react';

const EMPTY_TABS: ActiveSubTabItem[] = [];
const HOME_ICON_STYLE = { fontSize: tokens.typography.sizes.sm };

export interface ActiveSubTabStripProps {
  domain: ActiveSubTabDomain;
  /** The owning domain route decides where its overview floor lives. */
  onReturnToOverview?: () => void;
}

type TaskPillProps = Readonly<{
  tab: ActiveSubTabItem;
  active: boolean;
  onSelect: () => void;
  onClose: () => void;
  onDrop: (taskId: string, translationX: number) => void;
  onMove: (taskId: string, direction: -1 | 1) => void;
  onLayout: (taskId: string, center: number) => void;
}>;

function DraggableTaskPill({
  tab,
  active,
  onSelect,
  onClose,
  onDrop,
  onMove,
  onLayout,
}: TaskPillProps) {
  const translationX = useSharedValue(0);
  const dragging = useSharedValue(false);
  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translationX.value }, { scale: dragging.value ? 1.04 : 1 }],
    zIndex: dragging.value ? 2 : 0,
  }));
  const dragGesture = Gesture.Pan()
    .activateAfterLongPress(260)
    .activeOffsetX([-10, 10])
    .onStart(() => {
      'worklet';
      dragging.value = true;
    })
    .onUpdate((event: any) => {
      'worklet';
      translationX.value = event.translationX;
    })
    .onEnd((event: any) => {
      'worklet';
      if (Math.abs(event.translationX) >= 8) {
        scheduleOnRN(onDrop, tab.id, event.translationX);
      }
    })
    .onFinalize(() => {
      'worklet';
      dragging.value = false;
      translationX.value = withSpring(0, {
        duration: 400,
        dampingRatio: 0.8,
        overshootClamping: true,
      });
    });

  return (
    <Animated.View
      onLayout={(event) =>
        onLayout(tab.id, event.nativeEvent.layout.x + event.nativeEvent.layout.width / 2)
      }
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: active
            ? tokens.semantic.surface.elevated
            : 'transparent',
          borderBottomWidth: active ? 2 : 0,
          borderBottomColor: tokens.colors.primary,
          borderRadius: tokens.radii.sm,
          paddingVertical: 3,
          paddingLeft: 3,
          paddingRight: 4,
          gap: 4,
        },
        dragStyle,
      ]}
    >
      <GestureDetector gesture={dragGesture}>
        <Animated.View collapsable={false}>
          <Pressable
            accessibilityActions={[
              { name: 'moveEarlier', label: 'Move earlier' },
              { name: 'moveLater', label: 'Move later' },
            ]}
            accessibilityHint="Hold and drag to reorder this task. Screen reader users can move it earlier or later."
            accessibilityLabel={`Reorder ${tab.title}`}
            accessibilityRole="button"
            hitSlop={{ top: 5, bottom: 5, left: 4, right: 4 }}
            onAccessibilityAction={({ nativeEvent }) => {
              if (nativeEvent.actionName === 'moveEarlier') onMove(tab.id, -1);
              if (nativeEvent.actionName === 'moveLater') onMove(tab.id, 1);
            }}
            style={{
              width: 25,
              height: 34,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: tokens.radii.full,
            }}
          >
            <GripVertical size={13} color={tokens.semantic.text.muted} />
          </Pressable>
        </Animated.View>
      </GestureDetector>

      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={`${tab.title} active task tab`}
        onPress={onSelect}
        style={{
          minWidth: 0,
          maxWidth: 210,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingVertical: 5,
          paddingHorizontal: 5,
        }}
      >
        {active ? (
          <Box
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: tokens.colors.primary,
            }}
          />
        ) : null}
        <Text
          style={{
            flexShrink: 1,
            fontSize: tokens.typography.sizes.xs,
            fontWeight: active ? '700' : '500',
            color: active ? tokens.semantic.text.primary : tokens.semantic.text.secondary,
          }}
          numberOfLines={1}
        >
          {tab.title}
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Close ${tab.title} tab`}
        hitSlop={{ top: 8, bottom: 8, left: 5, right: 5 }}
        onPress={onClose}
        style={{
          width: 25,
          height: 30,
          borderRadius: tokens.radii.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active ? tokens.semantic.surface.interactive : 'transparent',
        }}
      >
        <X size={12} color={active ? tokens.semantic.text.primary : tokens.semantic.text.muted} />
      </Pressable>
    </Animated.View>
  );
}

/** Home stays fixed; active tasks can be reordered without keeping their screens mounted. */
export const ActiveSubTabStrip: React.FC<ActiveSubTabStripProps> = ({
  domain,
  onReturnToOverview,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const tabs = useActiveSubTabsStore((state) => state.tabsByDomain[domain] ?? EMPTY_TABS);
  const activeTabId = useActiveSubTabsStore((state) => state.activeTabByDomain[domain] || '');
  const showActiveSubTabs = useActiveSubTabsStore((state) => state.preferences.showActiveSubTabs);
  const setActiveTab = useActiveSubTabsStore((state) => state.setActiveTab);
  const closeTab = useActiveSubTabsStore((state) => state.closeTab);
  const reorderTab = useActiveSubTabsStore((state) => state.reorderTab);
  const itemCenters = useRef(new Map<string, number>());

  const handleSelectTab = useCallback(
    (tab: ActiveSubTabItem) => {
      hapticSelection();
      setActiveTab(domain, tab.id);
      router.push({
        pathname: tab.route,
        params: tab.params,
      } as Parameters<typeof router.push>[0]);
    },
    [domain, router, setActiveTab],
  );

  const handleCloseTab = useCallback(
    (tabId: string) => {
      hapticLight();
      const result = closeTab(domain, tabId);
      if (result.kind === 'overview') {
        onReturnToOverview?.();
      } else if (result.kind === 'focused-task' && activeTabId === tabId) {
        router.push({
          pathname: result.nextTask.route,
          params: result.nextTask.params,
        } as Parameters<typeof router.push>[0]);
      }
    },
    [activeTabId, closeTab, domain, onReturnToOverview, router],
  );

  const handleDrop = useCallback(
    (taskId: string, translationX: number) => {
      const sourceCenter = itemCenters.current.get(taskId);
      if (sourceCenter === undefined) return;
      const destinationCenter = sourceCenter + translationX;
      const remaining = tabs
        .filter((tab) => tab.id !== taskId)
        .map((tab) => ({ tab, center: itemCenters.current.get(tab.id) }))
        .filter((item): item is { tab: ActiveSubTabItem; center: number } =>
          Number.isFinite(item.center),
        )
        .sort((left, right) => left.center - right.center);
      const destinationIndex = remaining.findIndex((item) => destinationCenter < item.center);
      reorderTab(domain, taskId, destinationIndex < 0 ? remaining.length : destinationIndex);
    },
    [domain, reorderTab, tabs],
  );

  const handleAccessibleMove = useCallback(
    (taskId: string, direction: -1 | 1) => {
      const currentIndex = tabs.findIndex((tab) => tab.id === taskId);
      const destinationIndex = currentIndex + direction;
      if (destinationIndex < 0 || destinationIndex >= tabs.length) return;
      reorderTab(domain, taskId, destinationIndex);
    },
    [domain, reorderTab, tabs],
  );

  if (!showActiveSubTabs || tabs.length === 0) {
    return null;
  }

  const pillElements = tabs.map((tab) => (
    <DraggableTaskPill
      active={tab.id === activeTabId}
      key={tab.id}
      onClose={() => handleCloseTab(tab.id)}
      onDrop={handleDrop}
      onLayout={(taskId, center) => itemCenters.current.set(taskId, center)}
      onMove={handleAccessibleMove}
      onSelect={() => handleSelectTab(tab)}
      tab={tab}
    />
  ));

  return (
    <Box
      style={{
        backgroundColor: tokens.semantic.surface.canvas,
        borderBottomWidth: 1,
        borderBottomColor: tokens.semantic.border.subtle,
        paddingHorizontal: tokens.spacing.sm,
        paddingVertical: 6,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center', gap: tokens.spacing.xs }}
      >
        {tabs.length > 0 && onReturnToOverview ? (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: pathname === `/${domain}` }}
            accessibilityLabel={pathname === `/${domain}` ? 'Home' : 'Open Home'}
            onPress={onReturnToOverview}
            style={{
              minHeight: 42,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: tokens.spacing.sm,
              borderBottomWidth: pathname === `/${domain}` ? 2 : 0,
              borderBottomColor: tokens.colors.primary,
            }}
          >
            <Text style={HOME_ICON_STYLE}>🏠</Text>
            <Text
              style={{
                fontSize: tokens.typography.sizes.xs,
                fontWeight: pathname === `/${domain}` ? '700' : '500',
                color: tokens.semantic.text.primary,
              }}
            >
              Home
            </Text>
          </Pressable>
        ) : null}

        {pillElements}

      </ScrollView>
    </Box>
  );
};
