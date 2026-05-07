export type ExperienceMode = 'live' | 'demo' | 'sandbox';

export const DEFAULT_EXPERIENCE_MODE: ExperienceMode = 'live';

export function isExperienceModeActive(mode: ExperienceMode): boolean {
  return mode !== 'live';
}

export function isDemoExperienceMode(mode: ExperienceMode): boolean {
  return mode === 'demo';
}

export function isSandboxExperienceMode(mode: ExperienceMode): boolean {
  return mode === 'sandbox';
}

export function resolveDemoBoolean(mode: ExperienceMode): boolean {
  return mode === 'demo';
}
