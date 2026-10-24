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
  visualSignalsOf,
} from './experience';
export { GURUDEVI_APP_LEVERS, GURUDEVI_LEVERS } from './gurudeviLevers';
export { GURUDEVI_WORKLOADS, workloadsFor } from './gurudeviWorkloads';
export { GURUDEVI_HOST, GURUDEVI_MOBILE_HOST } from './host';
