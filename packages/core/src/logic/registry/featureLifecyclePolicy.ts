import type { FeatureFlagMetadata } from '@/logic/registry/featureLifecycleManifest';

export type FeatureLifecycleAction =
  | {
      kind: 'archive-growthbook-flag';
      key: string;
      codeReferences: number;
      catalogReferences: number;
      reason: string;
    }
  | {
      kind: 'retain-operational-control';
      key: string;
      permanentJustification: string;
    };

export function validateFeatureLifecycleAction(
  metadata: FeatureFlagMetadata,
  action: FeatureLifecycleAction,
): void {
  if (action.kind === 'archive-growthbook-flag' && !action.reason.trim()) {
    throw new Error(`Feature lifecycle: archive action for "${action.key}" requires a reason.`);
  }

  if (action.kind === 'archive-growthbook-flag') {
    if (metadata.disposition !== 'retire-after-migration') {
      throw new Error(
        `Feature lifecycle: "${action.key}" is not approved for archival; its disposition is "${metadata.disposition}".`,
      );
    }
    if (action.codeReferences !== 0 || action.catalogReferences !== 0) {
      throw new Error(
        `Feature lifecycle: "${action.key}" cannot be archived until code and catalog references are zero.`,
      );
    }
    return;
  }

  if (metadata.disposition !== 'retain-operational') {
    throw new Error(
      `Feature lifecycle: "${action.key}" is not classified as a permanent operational control.`,
    );
  }
  if (action.permanentJustification.trim() !== metadata.permanentJustification?.trim()) {
    throw new Error(
      `Feature lifecycle: operational retention justification for "${action.key}" does not match the manifest.`,
    );
  }
}
