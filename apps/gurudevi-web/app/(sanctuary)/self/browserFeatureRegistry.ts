type BrowserFeatureRegistration = Readonly<{
  taskKind: 'task' | 'modal';
  renderer: 'fire-journal' | 'mood-lotus' | 'breath-guide';
}>;

/**
 * This is an application delivery registry, not a second feature catalog.
 * The shared catalog owns identity, access and spatial metadata. This map only
 * records which existing browser implementations can safely render in Next.
 */
export const BROWSER_SELF_FEATURES: Readonly<Record<string, BrowserFeatureRegistration>> = {
  fire_journal: {
    renderer: 'fire-journal',
    taskKind: 'task',
  },
  mood_lotus: {
    renderer: 'mood-lotus',
    taskKind: 'modal',
  },
  daily_pulse: {
    renderer: 'mood-lotus',
    taskKind: 'modal',
  },
  breath_guide: {
    renderer: 'breath-guide',
    taskKind: 'modal',
  },
};

function browserSelfFeature(featureId: string): BrowserFeatureRegistration | null {
  return BROWSER_SELF_FEATURES[featureId] ?? null;
}

export function getBrowserSelfFeature(featureId: string): BrowserFeatureRegistration | null {
  return browserSelfFeature(featureId);
}

export function isBrowserSelfFeatureDelivered(featureId: string): boolean {
  return browserSelfFeature(featureId) !== null;
}
