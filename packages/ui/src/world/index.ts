/**
 * @repo/ui/world — the world layer (platform-neutral).
 *
 * Data and pure functions only: worlds, tokens, recipes, CSS variables.
 * Native components live in `@repo/ui/world/native`, DOM components in
 * `@repo/ui/world/dom`. Both render from what this module resolves.
 */

export { buildRecipes } from './build';
export * from './color';
export {
  boxShadowCss,
  paintCss,
  radiusCss,
  worldCssVariables,
  worldScopeStyle,
  worldStylesheet,
} from './css';
export { FACES, fontNamesOf, MOTION } from './faces';
export { phaseTokens, resolveWorld } from './resolve';
export type * from './types';
export { DEFAULT_WORLD, isWorldId, WORLD_IDS, WORLDS } from './worlds';
