import type { Capacity } from '@repo/core/types';
import {
  isDeveloperShortcutEnabled,
  parseDeveloperOnboardingTemplate,
  shouldUseDeveloperSandbox,
  type DeveloperOnboardingIntent,
} from './devOnboardingFastTrack';

export type OnboardingDevResolution =
  | { kind: 'none' }
  | { kind: 'menu' }
  | { kind: 'template'; intent: Extract<DeveloperOnboardingIntent, { kind: 'template' }> };

export function resolveOnboardingDevIntent(params: {
  isDevMode: boolean;
  input: string;
}): OnboardingDevResolution {
  const { isDevMode, input } = params;
  if (!shouldUseDeveloperSandbox(isDevMode)) return { kind: 'none' };
  if (!isDeveloperShortcutEnabled(true, input)) return { kind: 'none' };

  const intent = parseDeveloperOnboardingTemplate(input);
  if (intent.kind === 'menu') return { kind: 'menu' };
  return { kind: 'template', intent };
}

export function getDevOnboardingTemplateLabel(template: {
  role: Capacity;
  name: string;
}) {
  return `Developer Account (${template.role}) Setup Success!`;
}
