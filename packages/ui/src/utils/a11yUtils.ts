/**
 * a11yUtils — Pure Canonical Re-export Surface
 *
 * All accessibility mathematics, WCAG 2.2/3 models, APCA contrast calculations,
 * CVD cone simulations, spatial grids, motion spring physics, and mobile ergonomics
 * are canonical to and authored inside `@intuitui-labs/a11y-gate`.
 *
 * This file serves purely as a downstream re-export bridge for `@repo/ui`.
 */

export * from '@intuitui-labs/a11y-gate';
export * from '@intuitui-labs/a11y-gate/mobile';
export * from '@intuitui-labs/a11y-gate/wcag3';
export * from '@intuitui-labs/a11y-gate/web';

// Downstream alias compatibility
export { MOBILE_A11Y_STANDARDS as MOBILE_A11Y } from '@intuitui-labs/a11y-gate/mobile';
export { hexToRgb as a11yHexToRgb } from '@intuitui-labs/a11y-gate';
