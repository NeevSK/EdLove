import { WORLD_IDS } from '@repo/ui/theme';
import { PHASE_START_HOUR } from '@repo/ui/theme/scene';

/** Phase start hours, latest first, so the first paint picks the same phase as `phaseAt`. */
const PHASE_STARTS_DESC = Object.entries(PHASE_START_HOUR).sort(([, a], [, b]) => b - a);

/**
 * Puts this device's saved choices on the document before the app first renders, so the first
 * paint is already in the person's language, world, light and density: nothing flashes from a
 * default to their choice. Unknown or unreadable values leave the document's defaults.
 */
export function applySavedPreferences(
  root: HTMLElement = document.documentElement,
  now: Date = new Date(),
): void {
  let storage: Storage;
  try {
    storage = window.localStorage;
  } catch {
    // Storage can be blocked (private mode, embedded browsers); the defaults still render.
    return;
  }
  const locale = storage.getItem('gd_locale');
  if (locale === 'en' || locale === 'si' || locale === 'ta') {
    root.lang = locale;
    root.setAttribute('data-locale', locale);
  }

  const world = storage.getItem('gurudevi_world');
  if (world && WORLD_IDS.some((id) => id === world)) root.setAttribute('data-world', world);

  // The appearance preset came before light modes; its night still means dark.
  let mode = storage.getItem('gurudevi_mode');
  if (!mode && storage.getItem('gurudevi_appearance_preset') === 'night') mode = 'dark';
  mode ??= 'system';
  const dark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  root.setAttribute('data-mode', mode === 'system' ? (dark ? 'dark' : 'light') : mode);

  const hour = now.getHours();
  root.setAttribute(
    'data-phase',
    PHASE_STARTS_DESC.find(([, start]) => hour >= start)?.[0] ?? 'night',
  );

  if (storage.getItem('gurudevi_density') === 'simplified')
    root.setAttribute('data-density', 'simplified');
  const consent = storage.getItem('gurudevi_pdpa_consent');
  if (consent) root.setAttribute('data-pdpa-consent', consent);
}
