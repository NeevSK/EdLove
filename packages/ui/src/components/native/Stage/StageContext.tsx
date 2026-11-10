/**
 * The stage for the whole app: one floor under every screen, one tier for every part. Screens never
 * mount a scene; they say how present the floor may be (`useFloorPresence`) and report scrolling
 * (`useStageScroll`), and the stage eases between them. Kit parts read `useStage()` to know what
 * the phone can afford (press scale, rich surfaces, transitions).
 */

import { useIsFocused } from 'expo-router';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { useVisualCapabilities } from '../../../context/VisualCapabilities';
import { useWorld } from '../../../theme/native/WorldContext';
import type { ScenePresence } from '../../../theme/scene';
import { type Stage, type StageTier, stageOf } from '../../../theme/stage';
import { WorldFloor } from './WorldFloor';

export interface StageContextValue {
  stage: Stage;
  presence: ScenePresence;
  scrolling: boolean;
  setPresence: (presence: ScenePresence) => void;
  setScrolling: (scrolling: boolean) => void;
}

/** Outside a stage (tests, previews) the kit still knows a tier: the middle one, never moving. */
const FALLBACK: StageContextValue = {
  stage: stageOf({
    quality: 'reduced',
    effectiveFidelity: 'high',
    experience: { motion: 'refined', visualEffects: 'refined', celebration: 'refined' },
  }),
  presence: 'quiet',
  scrolling: false,
  setPresence: () => undefined,
  setScrolling: () => undefined,
};

const StageContext = createContext<StageContextValue | null>(null);

export function useStageContext(): StageContextValue {
  return useContext(StageContext) ?? FALLBACK;
}

/** What this phone can afford now: one tier for the floor, the kit and the shell. */
export function useStage(): Stage {
  return useStageContext().stage;
}

/**
 * Say how present the floor is while this screen is focused: `full` on a room's home, `band` on a
 * working screen (the floor shows only through the header), `quiet` on a focused task.
 */
export function useFloorPresence(presence: ScenePresence): void {
  const { setPresence } = useStageContext();
  let focused = true;
  try {
    // Outside a navigator (previews, tests) the screen counts as focused.
    focused = useIsFocused();
  } catch {
    focused = true;
  }
  useEffect(() => {
    if (focused) setPresence(presence);
  }, [focused, presence, setPresence]);
}

/** Handlers a scrolling surface passes on, so the floor's life pauses while the person scrolls. */
export function useStageScroll() {
  const { setScrolling } = useStageContext();
  const idle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(idle.current), []);
  const begin = useCallback(() => {
    clearTimeout(idle.current);
    setScrolling(true);
  }, [setScrolling]);
  const end = useCallback(() => {
    clearTimeout(idle.current);
    // A fling keeps moving after the finger lifts; wait a moment before the floor wakes.
    idle.current = setTimeout(() => setScrolling(false), 400);
  }, [setScrolling]);
  return { onScrollBeginDrag: begin, onMomentumScrollEnd: end, onScrollEndDrag: end };
}

export interface WorldStageProps {
  children: ReactNode;
  /** Cap the tier (the on-phone stage panel, previews); verger's tier otherwise. */
  cap?: StageTier;
  /** The floor's presence before any screen asks. */
  initialPresence?: ScenePresence;
}

/** The app's one floor, with everything else on top of it. Mount once, at the root. */
export function WorldStage({ children, cap, initialPresence = 'full' }: WorldStageProps) {
  const world = useWorld();
  const budget = useVisualCapabilities();
  const [presence, setPresenceState] = useState<ScenePresence>(initialPresence);
  const [scrolling, setScrollingState] = useState(false);
  const stage = useMemo(() => stageOf(budget, cap), [budget, cap]);
  const setPresence = useCallback((next: ScenePresence) => setPresenceState(next), []);
  const setScrolling = useCallback((next: boolean) => setScrollingState(next), []);
  const value = useMemo(
    () => ({ stage, presence, scrolling, setPresence, setScrolling }),
    [stage, presence, scrolling, setPresence, setScrolling],
  );
  return (
    <StageContext value={value}>
      <View style={[styles.root, { backgroundColor: world.tokens.ground }]}>
        <WorldFloor stage={stage} presence={presence} scrolling={scrolling} />
        {children}
      </View>
    </StageContext>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
