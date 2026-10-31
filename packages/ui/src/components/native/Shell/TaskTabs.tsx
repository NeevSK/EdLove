import { useRef } from 'react';
import { Pressable, Text as RNText, ScrollView, StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { alpha } from '../../../theme/color';
import type { TaskTab, TaskTabsContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { useLivingStyle, useWorldMotion } from '../../../theme/native/motion';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { gapFor } from '../../../tokens/space';
import { dropIndex, TASK_TABS_ENGLISH } from '../../shared/agent';
import { ChipPaint, chipFrame } from '../Chip/Chip';

export type TaskTabsProps = TaskTabsContract;

/** The lit underline under the chosen tab; it glides in and out with the world's light. */
function Underline({ on }: { on: boolean }) {
  const { world } = useWorldContext();
  const lit = useLivingStyle({
    backgroundColor: on ? world.tokens.lampDeep : alpha(world.tokens.lampDeep, 0),
  });
  return <Animated.View pointerEvents="none" style={[styles.underline, lit]} />;
}

interface PillProps {
  tab: TaskTab;
  active: boolean;
  labels: typeof TASK_TABS_ENGLISH;
  onSelect: () => void;
  onClose: () => void;
  onDrop: (id: string, translationX: number) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onCentre: (id: string, centre: number) => void;
}

function Pill({ tab, active, labels, onSelect, onClose, onDrop, onMove, onCentre }: PillProps) {
  const { world, language } = useWorldContext();
  const m = useWorldMotion();
  const feedback = useFeedback();
  const chip = world.recipes.chip;
  const t = world.tokens;
  const x = useSharedValue(0);
  const lifted = useSharedValue(false);
  const spring = m.spring ?? { damping: 18, stiffness: 220 };
  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() }, { scale: lifted.get() && m.animates ? 1.04 : 1 }],
    zIndex: lifted.get() ? 2 : 0,
  }));
  const lift = () => feedback('step');
  const drop = (id: string, dx: number) => {
    feedback('commit');
    onDrop(id, dx);
  };
  const drag = usePanGesture({
    activateAfterLongPress: 260,
    activeOffsetX: [-10, 10],
    onActivate: () => {
      'worklet';
      lifted.set(true);
      scheduleOnRN(lift);
    },
    onUpdate: (e) => {
      'worklet';
      x.set(e.translationX);
    },
    onDeactivate: (e) => {
      'worklet';
      if (!e.canceled && Math.abs(e.translationX) >= 8) scheduleOnRN(drop, tab.id, e.translationX);
    },
    onFinalize: () => {
      'worklet';
      lifted.set(false);
      x.set(withSpring(0, spring));
    },
  });
  const s = active ? chip.selected : chip.rest;
  return (
    <Animated.View
      onLayout={(e) => onCentre(tab.id, e.nativeEvent.layout.x + e.nativeEvent.layout.width / 2)}
      style={[styles.pill, chipFrame(chip, s), dragStyle]}
    >
      <ChipPaint recipe={chip} selected={active} />
      <GestureDetector gesture={drag}>
        <Animated.View collapsable={false}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={labels.reorder(tab.title)}
            accessibilityHint={labels.reorderHint}
            accessibilityActions={[
              { name: 'moveEarlier', label: labels.moveEarlier },
              { name: 'moveLater', label: labels.moveLater },
            ]}
            onAccessibilityAction={({ nativeEvent }) => {
              if (nativeEvent.actionName === 'moveEarlier') onMove(tab.id, -1);
              if (nativeEvent.actionName === 'moveLater') onMove(tab.id, 1);
            }}
            hitSlop={6}
            style={styles.grip}
          >
            <RNText aria-hidden style={{ color: t.inkFaint, fontSize: 12 }}>
              ⋮
            </RNText>
          </Pressable>
        </Animated.View>
      </GestureDetector>
      <Pressable
        role="tab"
        aria-selected={active}
        accessibilityLabel={tab.title}
        onPress={() => {
          feedback('select');
          onSelect();
        }}
        style={styles.label}
      >
        <RNText
          numberOfLines={1}
          style={[typeStyle(chip.label, language, world), { color: s.ink, flexShrink: 1 }]}
        >
          {tab.title}
        </RNText>
      </Pressable>
      <Pressable
        role="button"
        accessibilityLabel={labels.close(tab.title)}
        hitSlop={8}
        onPress={() => {
          feedback('press');
          onClose();
        }}
        style={[styles.close, { backgroundColor: active ? alpha(t.ink, 0.06) : 'transparent' }]}
      >
        <RNText
          aria-hidden
          style={{ color: active ? t.ink : t.inkFaint, fontSize: 14, lineHeight: 16 }}
        >
          ×
        </RNText>
      </Pressable>
      <Underline on={active} />
    </Animated.View>
  );
}

/**
 * Open tasks as tabs, Home first. Choosing ticks, closing presses, a long-press
 * lifts a tab to drag it into place and it lands with a commit; screen readers
 * move tabs with actions. The chosen tab is lit by the world's chip paint and a
 * gliding underline.
 */
export function TaskTabs({
  label,
  home,
  tabs,
  activeId,
  onSelect,
  onClose,
  onReorder,
  labels,
}: TaskTabsProps) {
  const { world, language } = useWorldContext();
  const feedback = useFeedback();
  const l = { ...TASK_TABS_ENGLISH, ...labels };
  const centres = useRef(new Map<string, number>());
  const chip = world.recipes.chip;
  const order = tabs.map((t) => t.id);
  if (tabs.length === 0) return null;

  const move = (id: string, direction: -1 | 1) => {
    const to = order.indexOf(id) + direction;
    if (to >= 0 && to < order.length) onReorder(id, to);
  };

  return (
    <View
      style={[
        styles.strip,
        {
          backgroundColor: world.tokens.ground,
          borderBottomColor: world.tokens.line,
          borderBottomWidth: world.definition.style.lineWeight,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityRole="tablist"
        accessibilityLabel={label}
        contentContainerStyle={{ alignItems: 'center', gap: gapFor('inside') }}
      >
        {home ? (
          <Pressable
            role="tab"
            aria-selected={home.selected}
            accessibilityLabel={home.label}
            onPress={() => {
              feedback('select');
              home.onPress();
            }}
            style={[styles.pill, chipFrame(chip, home.selected ? chip.selected : chip.rest)]}
          >
            <ChipPaint recipe={chip} selected={home.selected} />
            <RNText
              style={[
                typeStyle(chip.label, language, world),
                { color: (home.selected ? chip.selected : chip.rest).ink },
              ]}
            >
              {home.label}
            </RNText>
            <Underline on={home.selected} />
          </Pressable>
        ) : null}
        {tabs.map((tab) => (
          <Pill
            key={tab.id}
            tab={tab}
            active={tab.id === activeId}
            labels={l}
            onSelect={() => onSelect(tab.id)}
            onClose={() => onClose(tab.id)}
            onDrop={(id, dx) => {
              const to = dropIndex(id, dx, centres.current, order);
              if (to !== null) onReorder(id, to);
            }}
            onMove={move}
            onCentre={(id, c) => centres.current.set(id, c)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: { paddingHorizontal: 8, paddingVertical: 6 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 40, maxWidth: 240 },
  grip: { width: 22, height: 32, alignItems: 'center', justifyContent: 'center' },
  label: { minWidth: 0, maxWidth: 180, flexShrink: 1, paddingVertical: 4, paddingHorizontal: 2 },
  close: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  underline: { position: 'absolute', left: 10, right: 10, bottom: 2, height: 2, borderRadius: 1 },
});
