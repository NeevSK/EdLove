import { defineHost, VERGER_BUILTIN_LEVERS, VERGER_GLOBAL_MOTION } from '@repo/verger-core';
import { EXPERIENCE_LEVER_IDS } from './experience';
import { GURUDEVI_APP_LEVERS, GURUDEVI_LEVERS } from './gurudeviLevers';
import { GURUDEVI_WORKLOADS, workloadsFor } from './gurudeviWorkloads';

/**
 * Gurudevi's telemetry budget per launch, for users on prepaid data (the vision asks for a few
 * kilobytes a day): at most 28 events, a summary every 15 minutes. A chair, remotely tunable
 * (`gurudevi.verger.config`).
 */
const FIELD_TELEMETRY = {
  telemetryMaxEvents: 24,
  telemetryMaxSummaries: 4,
  telemetrySummaryEveryMs: 15 * 60_000,
} as const;

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
const VIEW_LEVERS = GURUDEVI_APP_LEVERS.filter((lever) =>
  (EXPERIENCE_LEVER_IDS as readonly string[]).includes(lever.id),
);
const MOBILE_LEVERS = [...VERGER_BUILTIN_LEVERS, ...VIEW_LEVERS];

export const GURUDEVI_MOBILE_HOST = defineHost({
  name: 'gurudevi',
  levers: MOBILE_LEVERS,
  workloads: workloadsFor(MOBILE_LEVERS),
  config: FIELD_TELEMETRY,
});

/**
 * The levers the web app's pages apply today: the wallpaper's blur (`wallpaperOf` reads
 * `allowBlur`). A view lever joins here only when a web page reads its field; governing one
 * nothing applies would let the closed loop "relieve" strain with a move that changes nothing.
 */
export const WEB_VIEW_LEVER_IDS = ['blur'] as const;

/**
 * What the web app governs: the levers its pages apply through the same view, and app-wide
 * reduced motion (applied as a document attribute). No refresh cap: a browser cannot set the
 * display's rate. Its own name, so its memory never mixes with the phone's.
 */
const WEB_LEVERS = [
  VERGER_GLOBAL_MOTION,
  ...VIEW_LEVERS.filter((lever) => (WEB_VIEW_LEVER_IDS as readonly string[]).includes(lever.id)),
];

export const GURUDEVI_WEB_HOST = defineHost({
  name: 'gurudevi-web',
  levers: WEB_LEVERS,
  workloads: workloadsFor(WEB_LEVERS),
  config: FIELD_TELEMETRY,
});
