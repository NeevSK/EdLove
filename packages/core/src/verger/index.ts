/**
 * Gurudevi as a verger host. Verger (`@repo/verger-core`) is the host-neutral supervisor; this
 * module is Gurudevi's half: its levers, with their declared rules, and its host definition.
 * Everything verger exports is re-exported so existing imports keep working.
 */
export * from '@repo/verger-core';
export {
  type DeviceTier,
  type ExperienceLevel,
  type ExperienceProfile,
  type ExperienceSettings,
  experienceOf,
  type GurudeviExperience,
  type VisualQuality,
} from './experience';
export {
  buildResponsiveWallpaperUrl,
  type WallpaperPresentation,
  type WallpaperReading,
  wallpaperAllowed,
  wallpaperOf,
} from './wallpaper';
export { GURUDEVI_APP_LEVERS, GURUDEVI_LEVERS } from './gurudeviLevers';
export { GURUDEVI_WORKLOADS, workloadsFor } from './gurudeviWorkloads';
export { GURUDEVI_HOST, GURUDEVI_MOBILE_HOST, GURUDEVI_WEB_HOST, WEB_VIEW_LEVER_IDS } from './host';
export {
  hostWith,
  hostWithConfig,
  resolveVergerPolicy,
  VERGER_LAB_POLICY_KEY,
  VERGER_POLICIES,
  type VergerPolicyInputs,
  type VergerPolicyLaunch,
  type VergerPolicyName,
  resolveVergerConfig,
  resolveVergerLaunch,
  VERGER_LAB_CONFIG_KEY,
  VERGER_LAB_PATCH_KEY,
  VERGER_REMOTE_FLAG_KEYS,
  type VergerRemoteInputs,
  vergerRemoteFromFlags,
  VERGER_LAB_RECORD_EVENTS,
  type RuntimeMode,
  type VergerConfigInputs,
  type VergerConfigLaunch,
  type VergerLaunch,
  type VergerLaunchInputs,
} from './launch';
