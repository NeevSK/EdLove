import type { FeedbackSceneContract } from '../../theme/contracts';
import type { WorldTokens } from '../../theme/types';

type FeedbackState = FeedbackSceneContract['state'];
type SceneInk = 'lamp' | 'ornament' | 'inkFaint' | 'success' | 'glow';

/** Static fallback geometry from components/FireflyMascot.tsx; this is not an approved artwork asset. */
export const FEEDBACK_SCENE_GEOMETRY = {
  defaultSize: 156,
  viewBox: '0 0 240 260',
  center: { x: 120, y: 130 },
  haloRadius: 106,
  coreRadius: 52,
  outerRadius: 18,
  innerRadius: 8,
  haloStops: [{ offset: 0, opacity: 0.32 }, { offset: 1, opacity: 0 }],
  coreStops: [{ offset: 0, opacity: 0.95 }, { offset: 0.4, opacity: 0.8 }, { offset: 1, opacity: 0 }],
  innerOpacity: 0.9,
} as const;

interface FeedbackPresentation {
  pathInk: SceneInk;
  mascotInk: SceneInk;
  outerOpacity: number;
  accessibilityLabel: string;
}

/** State meanings follow components/fireflyFeedback.ts and mascotStateMachine.ts. */
const presentations: Record<FeedbackState, FeedbackPresentation> = {
  loading: { pathInk: 'lamp', mascotInk: 'glow', outerOpacity: 0.88, accessibilityLabel: 'Firefly guide is active while this loads' },
  empty: { pathInk: 'ornament', mascotInk: 'glow', outerOpacity: 0.88, accessibilityLabel: 'Firefly guide marks an available next step' },
  offline: { pathInk: 'inkFaint', mascotInk: 'glow', outerOpacity: 0.88, accessibilityLabel: 'Firefly guide marks a paused connection' },
  error: { pathInk: 'inkFaint', mascotInk: 'inkFaint', outerOpacity: 0.35, accessibilityLabel: 'Firefly guide marks a paused task' },
  success: { pathInk: 'success', mascotInk: 'glow', outerOpacity: 0.88, accessibilityLabel: 'Firefly guide marks a completed step' },
};

export function feedbackScene(state: FeedbackState): FeedbackPresentation {
  return presentations[state];
}

export function feedbackSceneColors(state: FeedbackState, tokens: WorldTokens) {
  const presentation = feedbackScene(state);
  return { path: tokens[presentation.pathInk], mascot: tokens[presentation.mascotInk], center: tokens.raised };
}
