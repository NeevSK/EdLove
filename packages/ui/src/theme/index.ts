/**
 * @repo/ui/theme — the world engine (platform-neutral).
 *
 * Data and pure functions only: worlds, tokens, recipes, CSS variables.
 * Platform bindings are `@repo/ui/theme/native` and `@repo/ui/theme/web`;
 * the scene (sky, season, weather, landscape) is `@repo/ui/theme/scene`.
 * Components in `@repo/ui/components/native` and `@repo/ui/components/web`
 * render from what this module resolves.
 */

export { buildRecipes } from './build';
export * from './color';
export * from './contracts';
export * from './floorFit';
export * from './miniChart';
export * from './taskToolbar';
export {
  boxShadowCss,
  paintCss,
  radiusCss,
  worldCssVariables,
  worldScopeStyle,
  worldStylesheet,
} from './css';
export { FACES, fontNamesOf, MOTION } from './faces';
export {
  type FeedbackEvent,
  type FeedbackMotion,
  type HapticKind,
  hapticFor,
  motionFor,
} from './feedback';
export {
  type Bezier,
  CURVES,
  type ResolvedMotion,
  resolveMotion,
  type WorldSpring,
} from './motion';
export {
  PERCH_VIEWBOX,
  PERCHES,
  type PerchElement,
  type PerchGroup,
  type PerchInk,
  type PerchShape,
} from './perches';
export {
  COMFORT_SCALE,
  phaseTokens,
  resolveWorld,
  STANDARD_ACCESS,
  scaleRecipes,
} from './resolve';
export { SIGN_CYCLE_MS, SIGN_REST, SIGNS, type SignKind } from './signs';
export type * from './types';
export { DEFAULT_WORLD, isWorldId, WORLD_IDS, WORLDS, worldName } from './worlds';
export {
  type AspectClass,
  aspectClassOf,
  HUD_MAX_HEIGHT,
  type Posture,
  type ShellLayout,
  type SizeClass,
  type Stance,
  shellLayoutOf,
  sizeClassOf,
} from './size';
export { fitRadius, type RoomMark, roomMarkOf } from './shellMarks';
export {
  type CelebrationLevel,
  type MomentShape,
  momentOf,
  momentPieces,
  type WorldMomentStyle,
} from './moments';
export {
  atLeast,
  type Stage,
  type StageTier,
  STAGE_TIERS,
  stageNamed,
  stageOf,
  stageTierOf,
} from './stage';
