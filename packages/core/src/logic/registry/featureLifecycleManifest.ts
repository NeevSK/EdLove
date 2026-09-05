import {
  type FeatureFlagClass,
  FeatureFlagClassSchema,
  type FeatureLifecycle,
  FeatureLifecycleSchema,
} from '@repo/core/logic/registry/domainEntry';
import { DEFAULT_FEATURE_FLAGS } from '@repo/core/store/types/featureFlags';
import { z } from 'zod';

export type FeatureFlagMetadata = Omit<FeatureLifecycle, 'flagClass'> & {
  class: FeatureFlagClass;
  disposition: 'retire-after-migration' | 'retain-operational';
  purpose: string;
  intendedAudience: string;
  safeDefault: boolean;
  cleanupNote: string;
  /** Canonical GrowthBook key: `gurudevi.<domain>.<feature>`. See ADR-012. */
  growthbookKey: string;
  legacy?: boolean;
};

export const FeatureFlagMetadataSchema = FeatureLifecycleSchema.extend({
  class: FeatureFlagClassSchema,
  disposition: z.enum(['retire-after-migration', 'retain-operational']),
  purpose: z.string().min(1),
  intendedAudience: z.string().min(1),
  safeDefault: z.boolean(),
  cleanupNote: z.string().min(1),
  growthbookKey: z
    .string()
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+(-[a-z0-9]+)*)*$/,
      'growthbookKey must be namespaced kebab-case, e.g. gurudevi.<domain>.<feature>.',
    ),
  legacy: z.boolean().optional(),
}).superRefine((metadata, context) => {
  const isOperational = metadata.class === 'operational';
  const retainsOperational = metadata.disposition === 'retain-operational';

  if (isOperational !== retainsOperational) {
    context.addIssue({
      code: 'custom',
      message: 'Flag class and lifecycle disposition must agree.',
      path: ['class'],
    });
  }

  if (isOperational && !metadata.permanentJustification) {
    context.addIssue({
      code: 'custom',
      message: 'Operational flags require permanentJustification.',
      path: ['permanentJustification'],
    });
  }

  if (!isOperational && !metadata.removalTarget) {
    context.addIssue({
      code: 'custom',
      message: 'Temporary flags require removalTarget.',
      path: ['removalTarget'],
    });
  }
});

export const legacyRelease = (
  owner: string,
  purpose: string,
): Omit<FeatureFlagMetadata, 'growthbookKey'> => ({
  owner,
  class: 'release',
  disposition: 'retire-after-migration',
  purpose,
  intendedAudience: 'Controlled release cohort',
  safeDefault: true,
  cleanupNote:
    'Remove the release branch and archive the GrowthBook key after general availability.',
  createdAt: '2026-07-26',
  reviewAt: '2026-09-30',
  removalTarget: '2026-09-30',
  legacy: true,
});

const legacyBeta = (
  owner: string,
  purpose: string,
): Omit<FeatureFlagMetadata, 'growthbookKey'> => ({
  owner,
  class: 'beta',
  disposition: 'retire-after-migration',
  purpose,
  intendedAudience: 'Named beta cohort only',
  safeDefault: false,
  cleanupNote: 'Remove the beta branch and archive the GrowthBook key after the cohort decision.',
  createdAt: '2026-07-26',
  reviewAt: '2026-09-30',
  removalTarget: '2026-09-30',
  legacy: true,
});

const permanentOperational = (
  owner: string,
  permanentJustification: string,
  purpose: string,
  safeDefault: boolean,
): Omit<FeatureFlagMetadata, 'growthbookKey'> => ({
  owner,
  class: 'operational',
  disposition: 'retain-operational',
  purpose,
  intendedAudience: 'All supported clients',
  safeDefault,
  cleanupNote: 'Review ownership and emergency response value at each lifecycle review.',
  createdAt: '2026-07-26',
  reviewAt: '2026-09-30',
  permanentJustification,
  legacy: true,
});

/**
 * Transitional metadata for the existing boolean rollout surface.
 * New flags must be added with an explicit lifecycle record and must not use
 * the legacy helpers once the current keys have been migrated.
 */
export const FEATURE_FLAG_MANIFEST = {
  isInventoryEnabled: {
    ...legacyBeta('admin', 'Controlled release of inventory operations.'),
    growthbookKey: 'gurudevi.admin.inventory',
  },
  isAccountingEnabled: {
    ...legacyBeta('admin', 'Controlled release of accounting operations.'),
    growthbookKey: 'gurudevi.admin.accounting',
  },
  isAIAssistantEnabled: {
    ...legacyBeta('ai', 'Controlled release of the AI assistant.'),
    growthbookKey: 'gurudevi.ai.assistant',
  },
  isGuardianWorkspaceEnabled: {
    ...legacyBeta('admin', 'Controlled release of the guardian workspace.'),
    growthbookKey: 'gurudevi.admin.guardian-workspace',
  },
  isDevelopingWorkspace: {
    ...legacyBeta('admin', 'Controlled development workspace access.'),
    growthbookKey: 'gurudevi.admin.workspace-development',
  },
  isDevelopingWorkforce: {
    ...legacyBeta('workforce', 'Controlled release of workforce operations.'),
    growthbookKey: 'gurudevi.workforce.development',
  },
  isDevelopingFormBuilder: {
    ...legacyBeta('form-builder', 'Controlled release of form builder capabilities.'),
    growthbookKey: 'gurudevi.form-builder.development',
  },
  isGraphicsEngineEnabled: {
    ...permanentOperational(
      'graphics',
      'Retain an emergency fallback for disabling the accelerated rendering engine while preserving standard rendering.',
      'Emergency control for the accelerated graphics engine.',
      true,
    ),
    growthbookKey: 'gurudevi.core.graphics-engine',
  },
  isAnalyticsEnabled: {
    ...permanentOperational(
      'platform-core',
      'Disable analytics collection during an incident or privacy response.',
      'Emergency control for analytics collection.',
      true,
    ),
    growthbookKey: 'gurudevi.core.analytics',
  },
  isSocialShieldEnabled: {
    ...permanentOperational(
      'community',
      'Retain an emergency safety control for social surfaces.',
      'Emergency safety control for social interactions.',
      true,
    ),
    growthbookKey: 'gurudevi.core.social-shield',
  },
  isUnderMaintenance: {
    ...permanentOperational(
      'platform-core',
      'Emergency platform-wide availability control.',
      'Platform-wide maintenance availability control.',
      false,
    ),
    growthbookKey: 'gurudevi.core.maintenance',
  },
  isPowerSyncEnabled: {
    ...permanentOperational(
      'platform-core',
      'Emergency control for the synchronization subsystem.',
      'Emergency control for offline synchronization.',
      false,
    ),
    growthbookKey: 'gurudevi.core.power-sync',
  },
  isComposerPasteEnabled: {
    ...legacyBeta('editorial', 'Controlled release of rich paste (images/GIFs/stickers) in composer.'),
    growthbookKey: 'gurudevi.editorial.composer-paste',
  },
  isNitroFetchEnabled: {
    ...legacyBeta('platform-core', 'Controlled release of Nitro Fetch (Cronet/URLSession) for native network stack.'),
    growthbookKey: 'gurudevi.core.nitro-fetch',
  },
} as const satisfies Record<string, FeatureFlagMetadata>;

export type FeatureFlagKey = keyof typeof FEATURE_FLAG_MANIFEST;

export function validateFeatureFlagManifest(): void {
  Object.entries(FEATURE_FLAG_MANIFEST).forEach(([key, metadata]) => {
    FeatureFlagMetadataSchema.parse(metadata);

    const declaredDefault = DEFAULT_FEATURE_FLAGS[key as keyof typeof DEFAULT_FEATURE_FLAGS];
    if (declaredDefault !== metadata.safeDefault) {
      throw new Error(
        `Feature lifecycle: safe default mismatch for "${key}" (manifest=${metadata.safeDefault}, runtime=${declaredDefault}).`,
      );
    }
  });

  const growthbookKeys = Object.values(FEATURE_FLAG_MANIFEST).map(
    ({ growthbookKey }) => growthbookKey,
  );
  const duplicateGrowthbookKeys = growthbookKeys.filter(
    (key, index) => growthbookKeys.indexOf(key) !== index,
  );
  if (duplicateGrowthbookKeys.length > 0) {
    throw new Error(
      `Feature lifecycle: duplicate GrowthBook keys: ${[...new Set(duplicateGrowthbookKeys)].join(', ')}.`,
    );
  }
}

/** Resolve the canonical GrowthBook key for an app flag key. */
export function resolveGrowthBookKey(key: string): string | undefined {
  return FEATURE_FLAG_MANIFEST[key as keyof typeof FEATURE_FLAG_MANIFEST]?.growthbookKey;
}

/** Reverse map: canonical GrowthBook key → app flag key. */
export const GROWTHBOOK_KEY_BY_FLAG = Object.fromEntries(
  Object.entries(FEATURE_FLAG_MANIFEST).map(([key, metadata]) => [metadata.growthbookKey, key]),
) as Record<string, FeatureFlagKey>;

/** Retired keys are append-only and must never be reused. */
export const RETIRED_FEATURE_FLAG_HISTORY = [
  {
    key: 'isPaymentsEnabled',
    retiredAt: '2026-07-26',
    reason: 'Superseded by the entitlement system; no runtime rollout references remain.',
  },
  {
    key: 'canUseOCR',
    retiredAt: '2026-07-26',
    reason: 'Legacy capability flag removed from the active product surface.',
  },
  {
    key: 'isBackgroundSyncEnabled',
    retiredAt: '2026-07-26',
    reason: 'Sync availability is now governed by the operational PowerSync control.',
  },
  {
    key: 'isDevelopingVoiceNavigation',
    retiredAt: '2026-07-26',
    reason: 'Development-only navigation branch removed after migration.',
  },
  {
    key: 'isFormBuilderEnabled',
    retiredAt: '2026-07-26',
    reason: 'Replaced by the current form-builder lifecycle key.',
  },
  {
    key: 'isNewOnboardingEnabled',
    retiredAt: '2026-07-26',
    reason: 'Onboarding is now part of the stable application flow.',
  },
  {
    key: 'isPublicSensingEnabled',
    retiredAt: '2026-07-26',
    reason: 'Legacy sensing surface removed from the active catalog.',
  },
  {
    key: 'isStudentAssignmentQueueEnabled',
    retiredAt: '2026-07-26',
    reason: 'Assignment queue capability was removed from the active product surface.',
  },
  {
    key: 'isStudentGoalsWorkspaceEnabled',
    retiredAt: '2026-07-26',
    reason: 'Goals workspace is represented by the current catalog capability model.',
  },
  {
    key: 'isStudentProgressWorkspaceEnabled',
    retiredAt: '2026-07-26',
    reason: 'Progress workspace is represented by the current catalog capability model.',
  },
  {
    key: 'isStudentRewardsWorkspaceEnabled',
    retiredAt: '2026-07-26',
    reason: 'Rewards workspace was removed from the active catalog.',
  },
  {
    key: 'isWorkforceEnabled',
    retiredAt: '2026-07-26',
    reason: 'Replaced by the current workforce development lifecycle key.',
  },
  {
    key: 'isDevelopingAI',
    retiredAt: '2026-07-26',
    reason: 'Replaced by the current AI assistant lifecycle key.',
  },
  {
    key: 'isDevelopingAnalyticsDashboard',
    retiredAt: '2026-07-26',
    reason: 'Analytics dashboard rollout was consolidated under the operational analytics control.',
  },
] as const;

export const RETIRED_FEATURE_FLAG_KEYS = RETIRED_FEATURE_FLAG_HISTORY.map(({ key }) => key);

/** Resolve a snapshot while preventing absent beta/experiment flags from failing open. */
export function fallbackForFeatureFlagClass(
  flagClass: FeatureFlagMetadata['class'] | undefined,
): boolean {
  return flagClass !== 'beta' && flagClass !== 'experiment';
}

/** Return the declared lifecycle class for diagnostics and permission results. */
export function resolveFeatureFlagClass(key: string): FeatureFlagMetadata['class'] {
  return FEATURE_FLAG_MANIFEST[key as keyof typeof FEATURE_FLAG_MANIFEST]?.class ?? 'operational';
}

export function resolveFeatureFlagValue(flags: object, key: string): boolean {
  if (Object.prototype.hasOwnProperty.call(flags, key)) {
    const value = (flags as Record<string, boolean | string>)[key];
    return typeof value === 'boolean' ? value : value === 'true';
  }

  const metadata = FEATURE_FLAG_MANIFEST[key as keyof typeof FEATURE_FLAG_MANIFEST];
  if (!metadata) return true;

  return metadata.safeDefault;
}
