import { defineHost, VERGER_BUILTIN_LEVERS } from '@repo/verger-core';
import { EXPERIENCE_LEVER_IDS } from './experience';
import { GURUDEVI_APP_LEVERS, GURUDEVI_LEVERS } from './gurudeviLevers';
import { GURUDEVI_WORKLOADS, workloadsFor } from './gurudeviWorkloads';

/** Gurudevi's full manifest: every lever it can govern, on verger's default thresholds. */
export const GURUDEVI_HOST = defineHost({
  name: 'gurudevi',
  levers: GURUDEVI_LEVERS,
  workloads: GURUDEVI_WORKLOADS,
});

/**
 * What the mobile build governs today. A lever joins only when a consumer in the app applies
 * it; lowering a lever nobody reads costs a stress period and changes nothing. Today that is
 * verger's built-in refresh cap and global reduced motion, and the levers Gurudevi's components
 * apply through `experienceOf` (`EXPERIENCE_LEVER_IDS`).
 */
const MOBILE_LEVERS = [
  ...VERGER_BUILTIN_LEVERS,
  ...GURUDEVI_APP_LEVERS.filter((lever) =>
    (EXPERIENCE_LEVER_IDS as readonly string[]).includes(lever.id),
  ),
];

export const GURUDEVI_MOBILE_HOST = defineHost({
  name: 'gurudevi',
  levers: MOBILE_LEVERS,
  workloads: workloadsFor(MOBILE_LEVERS),
});
