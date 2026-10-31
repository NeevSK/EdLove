import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  Text as RNText,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  View,
} from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import type { TaskTab, TaskTabsContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { useWorldMotion } from '../../../theme/native/motion';
import { radiusStyle, shadowStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { dropIndex, TASK_TABS_ENGLISH } from '../../shared/agent';

export type TaskTabsProps = TaskTabsContract;

const PAD = 3;
const HOME = '__home__';

interface Frame {
  x: number;
  width: number;
}

interface TabProps {
  tab: TaskTab;
  active: boolean;
  labels: typeof TASK_TABS_ENGLISH;
  onSelect: () => void;
  onClose: () => void;
  onDrop: (id: string, translationX: number) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onFrame: (id: string, frame: Frame) => void;
}

/**
 * One task. Quiet words until chosen; the chosen one sits on the gliding
 * marker and alone shows its close mark. Long-press lifts it to drag; screen
 * readers close and move it with actions on the tab itself.
 */
function Tab({ tab, active, labels, onSelect, onClose, onDrop, onMove, onFrame }: TabProps) {
  const { world, language } = useWorldContext();
  const m = useWorldMotion();
  const feedback = useFeedback();
  const t = world.tokens;
  const x = useSharedValue(0);
  const lifted = useSharedValue(false);
  const spring = m.spring ?? { damping: 18, stiffness: 220 };
  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() }, { scale: lifted.get() && m.animates ? 1.05 : 1 }],
    zIndex: lifted.get() ? 2 : 0,
    opacity: lifted.get() ? 0.92 : 1,
  }));
  const lift = () => feedback('step');
  const drop = (id: string, dx: number) => {
    feedback('commit');
    onDrop(id, dx);
  };
  const drag = usePanGesture({
    activateAfterLongPress: 280,
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
  return (
    <GestureDetector gesture={drag}>
      <Animated.View
        collapsable={false}
        onLayout={(e) =>
          onFrame(tab.id, { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width })
        }
        style={[styles.tab, dragStyle]}
      >
        <Pressable
          role="tab"
          aria-selected={active}
          accessibilityLabel={tab.title}
          accessibilityHint={labels.reorderHint}
          accessibilityActions={[
            { name: 'close', label: labels.close(tab.title) },
            { name: 'moveEarlier', label: labels.moveEarlier },
            { name: 'moveLater', label: labels.moveLater },
          ]}
          onAccessibilityAction={({ nativeEvent }) => {
            if (nativeEvent.actionName === 'close') onClose();
            if (nativeEvent.actionName === 'moveEarlier') onMove(tab.id, -1);
            if (nativeEvent.actionName === 'moveLater') onMove(tab.id, 1);
          }}
          onPress={() => {
            if (active) return;
            feedback('select');
            onSelect();
          }}
          style={styles.words}
        >
          <RNText
            numberOfLines={1}
            style={[
              typeStyle(world.recipes.chip.label, language, world),
              { color: active ? t.ink : t.inkSoft, fontWeight: active ? '600' : undefined },
            ]}
          >
            {tab.title}
          </RNText>
        </Pressable>
        {active ? (
          <Pressable
            role="button"
            accessibilityLabel={labels.close(tab.title)}
            hitSlop={10}
            onPress={() => {
              feedback('press');
              onClose();
            }}
            style={({ pressed }) => [
              styles.close,
              { backgroundColor: pressed ? t.sunken : 'transparent' },
            ]}
          >
            <RNText aria-hidden style={{ color: t.inkSoft, fontSize: 15, lineHeight: 17 }}>
              ×
            </RNText>
          </Pressable>
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * Open tasks in one quiet well, Home first. A single raised marker glides to
 * the chosen task in the world's motion (it simply moves when motion is off),
 * so the strip reads as one control rather than a row of boxes. The chosen
 * task scrolls into view.
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
  const m = useWorldMotion();
  const l = { ...TASK_TABS_ENGLISH, ...labels };
  const frames = useRef(new Map<string, Frame>());
  const scroller = useRef<ScrollViewInstance>(null);
  const [measured, setMeasured] = useState(0);
  const inset = world.recipes.surface.inset;
  const raised = world.recipes.surface.raised;
  const order = tabs.map((t) => t.id);
  const chosen = home?.selected ? HOME : activeId;
  const markX = useSharedValue(0);
  const markW = useSharedValue(0);
  const ms = world.recipes.motion.settleMs;

  // `measured` re-runs this once frames arrive; the frame map itself is a ref.
  useEffect(() => {
    const f = chosen ? frames.current.get(chosen) : undefined;
    if (!f) {
      markW.set(0);
      return;
    }
    const first = markW.get() === 0;
    if (m.animates && !first) {
      markX.set(withSpring(f.x, m.spring ?? { damping: 20, stiffness: 240 }));
      markW.set(withTiming(f.width, { duration: ms }));
    } else {
      markX.set(f.x);
      markW.set(f.width);
    }
    scroller.current?.scrollTo({ x: Math.max(0, f.x - 48), animated: m.animates });
  }, [chosen, measured, m, ms, markX, markW]);

  const markStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: markX.get() }],
    width: markW.get(),
    opacity: markW.get() > 0 ? 1 : 0,
  }));

  if (tabs.length === 0) return null;

  const move = (id: string, direction: -1 | 1) => {
    const to = order.indexOf(id) + direction;
    if (to >= 0 && to < order.length) onReorder(id, to);
  };
  const onFrame = (id: string, frame: Frame) => {
    const old = frames.current.get(id);
    frames.current.set(id, frame);
    if (!old || old.x !== frame.x || old.width !== frame.width) setMeasured((n) => n + 1);
  };
  const centres = () =>
    new Map([...frames.current].map(([id, f]) => [id, f.x + f.width / 2] as const));

  return (
    <View style={[styles.strip, { backgroundColor: world.tokens.ground }]}>
      <View
        style={[
          styles.well,
          { backgroundColor: inset.fill ?? world.tokens.sunken },
          radiusStyle(999),
        ]}
      >
        <ScrollView
          ref={scroller}
          horizontal
          showsHorizontalScrollIndicator={false}
          accessibilityRole="tablist"
          accessibilityLabel={label}
          contentContainerStyle={styles.row}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.mark,
              { backgroundColor: raised.fill ?? world.tokens.raised },
              shadowStyle(raised.shadow),
              markStyle,
            ]}
          />
          {home ? (
            <Pressable
              role="tab"
              aria-selected={home.selected}
              accessibilityLabel={home.label}
              onLayout={(e) =>
                onFrame(HOME, { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width })
              }
              onPress={() => {
                if (home.selected) return;
                feedback('select');
                home.onPress();
              }}
              style={[styles.tab, styles.words]}
            >
              <RNText
                style={[
                  typeStyle(world.recipes.chip.label, language, world),
                  {
                    color: home.selected ? world.tokens.ink : world.tokens.inkSoft,
                    fontWeight: home.selected ? '600' : undefined,
                  },
                ]}
              >
                {home.label}
              </RNText>
            </Pressable>
          ) : null}
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              tab={tab}
              active={tab.id === activeId && !home?.selected}
              labels={l}
              onSelect={() => onSelect(tab.id)}
              onClose={() => onClose(tab.id)}
              onDrop={(id, dx) => {
                const to = dropIndex(id, dx, centres(), order);
                if (to !== null) onReorder(id, to);
              }}
              onMove={move}
              onFrame={onFrame}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: { paddingHorizontal: 12, paddingVertical: 6 },
  well: { padding: PAD, overflow: 'hidden' },
  row: { alignItems: 'center' },
  mark: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 999 },
  tab: { flexDirection: 'row', alignItems: 'center', minHeight: 38, maxWidth: 220 },
  words: { paddingHorizontal: 14, minHeight: 38, justifyContent: 'center', flexShrink: 1 },
  close: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 6,
    marginLeft: -6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
