import type { Capacity } from '@repo/core/types';

export type DeveloperOnboardingTemplate = {
  name: string;
  role: Capacity;
  pricing: string;
  citizenship: string;
  schoolId: string | null;
};

export type DeveloperOnboardingIntent =
  | { kind: 'disabled' }
  | { kind: 'menu' }
  | { kind: 'template'; template: DeveloperOnboardingTemplate };

const DEFAULT_TEMPLATE: DeveloperOnboardingTemplate = {
  name: 'Dev User',
  role: 'teacher',
  pricing: 'FREE',
  citizenship: 'WANDERER',
  schoolId: null,
};

export function isDeveloperShortcutEnabled(isDevMode: boolean, value: string) {
  return isDevMode && value.trim().startsWith('dev::');
}

export function parseDeveloperOnboardingTemplate(rawInput: string): DeveloperOnboardingIntent {
  const trimmed = rawInput.trim();
  if (!trimmed.startsWith('dev::')) return { kind: 'disabled' };

  if (trimmed === 'dev::sandbox' || trimmed === 'dev::menu') {
    return { kind: 'menu' };
  }

  const configContent = trimmed.substring(5);
  const parts = configContent.split(',');
  const config: Record<string, string> = {};

  for (const part of parts) {
    const colonIndex = part.indexOf(':');
    if (colonIndex === -1) continue;
    const key = part.substring(0, colonIndex).trim().toLowerCase();
    const val = part.substring(colonIndex + 1).trim();
    config[key] = val;
  }

  return {
    kind: 'template',
    template: {
      name: config.name || config.display_name || DEFAULT_TEMPLATE.name,
      role: (config.role || config.capacity || DEFAULT_TEMPLATE.role) as Capacity,
      pricing: (config.pricing || config.tier || DEFAULT_TEMPLATE.pricing).toUpperCase(),
      citizenship: (config.citizenship || DEFAULT_TEMPLATE.citizenship).toUpperCase(),
      schoolId: config.school || config.school_id || null,
    },
  };
}

export function formatDeveloperOnboardingPrompt() {
  return 'Use dev::name:Naween,role:teacher,pricing:pro,citizenship:WANDERER,school:abc';
}

export function shouldUseDeveloperSandbox(isDevMode: boolean) {
  return isDevMode || process.env.EXPO_PUBLIC_ENABLE_DEV_SANDBOX === 'true';
}
