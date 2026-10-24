import { defineHost, VERGER_BUILTIN_LEVERS } from '@repo/verger-core';
import { GURUDEVI_LEVERS } from './gurudeviLevers';
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
 * verger's built-in refresh cap and global reduced motion.
 */
export const GURUDEVI_MOBILE_HOST = defineHost({
  name: 'gurudevi',
  levers: VERGER_BUILTIN_LEVERS,
  workloads: workloadsFor(VERGER_BUILTIN_LEVERS),
});
