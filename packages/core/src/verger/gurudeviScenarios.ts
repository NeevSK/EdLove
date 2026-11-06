import type { ActivationPatch } from '@repo/verger-core';

/**
 * Operational scenarios for Gurudevi, inspired by OEM user scenarios (such as MSI Center Pro).
 * Scenarios allow teachers, students, or field administrators to apply high-level operational
 * intent ('exam', 'power-cut', 'low-data', 'auto') that overlays Verger's envelope without
 * violating cybernetic invariants or the Convivial Limit.
 */
export type GurudeviScenario = 'auto' | 'exam' | 'power-cut' | 'low-data';

export const GURUDEVI_SCENARIOS: readonly GurudeviScenario[] = [
  'auto',
  'exam',
  'power-cut',
  'low-data',
] as const;

export function isGurudeviScenario(value: unknown): value is GurudeviScenario {
  return typeof value === 'string' && (GURUDEVI_SCENARIOS as readonly string[]).includes(value);
}

export interface ScenarioMeta {
  readonly id: GurudeviScenario;
  readonly title: string;
  readonly description: string;
  readonly intent: 'balanced' | 'focus' | 'energy' | 'network';
}

export const SCENARIO_METADATA: Readonly<Record<GurudeviScenario, ScenarioMeta>> = {
  auto: {
    id: 'auto',
    title: 'Balanced Auto',
    description: 'Autonomous closed-loop cybernetic regulation based on real-time device strain.',
    intent: 'balanced',
  },
  exam: {
    id: 'exam',
    title: 'Classroom Exam',
    description:
      'Zero distracting animations, static placeholders, no background prefetch, critical attendance prioritised.',
    intent: 'focus',
  },
  'power-cut': {
    id: 'power-cut',
    title: 'Power-Cut Saver',
    description:
      'Aggressive energy preservation: refresh rate capped at 60Hz, flat tints, particles suppressed.',
    intent: 'energy',
  },
  'low-data': {
    id: 'low-data',
    title: 'Field Low-Data',
    description:
      'Metered connectivity preservation: background sync restricted to essential deltas, prefetch disabled.',
    intent: 'network',
  },
};

/**
 * Activation patch associated with a high-level operational scenario.
 * Governs admission and hardware levers; lever level caps are applied downstream in experienceOf.
 */
export function activationPatchForScenario(scenario: GurudeviScenario): ActivationPatch {
  switch (scenario) {
    case 'exam':
      return {
        admission: 'shadow',
      };
    case 'power-cut':
      return {
        hardware: true,
        admission: 'shadow',
      };
    case 'low-data':
      return {
        admission: 'shadow',
      };
    case 'auto':
    default:
      return {};
  }
}

