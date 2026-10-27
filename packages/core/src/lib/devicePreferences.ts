import { storage } from '@repo/core/lib/storage';

export const DEVICE_THEME_MODE_KEY = '@gurudevi/theme_mode';
export type DeviceThemeMode = 'light' | 'dark' | 'system' | 'auto';

export function isDeviceThemeMode(value: unknown): value is DeviceThemeMode {
  return value === 'light' || value === 'dark' || value === 'system' || value === 'auto';
}

let themeMigration: Promise<void> | null = null;

async function migrateDeviceTheme(): Promise<void> {
  if ((await storage.getStringAsync(DEVICE_THEME_MODE_KEY)) !== undefined) return;
  const legacy = await storage.getStringAsync('gurudevi-ui-storage');
  if (!legacy) return;
  let value: unknown;
  try {
    value = JSON.parse(legacy);
  } catch {
    return;
  }
  if (!value || typeof value !== 'object' || !('state' in value)) return;
  const state = value.state;
  if (!state || typeof state !== 'object') return;
  const mode =
    'themeMode' in state && isDeviceThemeMode(state.themeMode)
      ? state.themeMode
      : 'theme' in state && isDeviceThemeMode(state.theme)
        ? state.theme
        : undefined;
  if (mode === undefined) return;
  // A concurrent explicit settings write takes precedence over the old hint.
  if ((await storage.getStringAsync(DEVICE_THEME_MODE_KEY)) !== undefined) return;
  await storage.setAsync(DEVICE_THEME_MODE_KEY, mode);
}

/** Preserve the old device choice before the mixed UI record can be rewritten. */
export function ensureDeviceThemePreference(): Promise<void> {
  if (!themeMigration) {
    themeMigration = migrateDeviceTheme().finally(() => {
      themeMigration = null;
    });
  }
  return themeMigration;
}
