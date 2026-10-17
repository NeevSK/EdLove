import type { LocalOnlyKeyValueStorage } from '@repo/core/logic/ports/storage';
import {
  type CapabilityPlatform,
  type CapabilityPracticePolicy,
  declaredPracticeCapability,
  resolvePracticeAvailability,
} from '@repo/core/logic/registry/capabilityManifest';
import {
  type CatalogPracticeRuntime,
  createCatalogPracticeRuntime,
  type PracticeDocument,
  type PracticeDocumentCodec,
} from './catalogPracticeRuntime';

export type PracticeDefinition = Readonly<{
  featureId: string;
  documentSchemaId: string;
  codec: PracticeDocumentCodec<PracticeDocument>;
  createInitialState(): PracticeDocument;
}>;

export type PracticeSessionUnavailableReason =
  | 'not-declared'
  | 'platform-unsupported'
  | 'capacity-unsupported'
  | 'scope-required'
  | 'definition-missing'
  | 'schema-mismatch';

export type PracticeSessionResolution =
  | Readonly<{
      available: true;
      policy: CapabilityPracticePolicy;
      session: CatalogPracticeRuntime<PracticeDocument>;
    }>
  | Readonly<{ available: false; reason: PracticeSessionUnavailableReason }>;

/**
 * Composes policy, domain state definition, and platform storage from a feature
 * identity. Callers cannot inject a policy or select a production store.
 */
export function resolvePracticeSession(input: {
  accountId: string;
  featureId: string;
  platform: CapabilityPlatform;
  capacity?: string | null;
  hasSelectedScope: boolean;
  storage: LocalOnlyKeyValueStorage;
  definitions: Readonly<Record<string, PracticeDefinition>>;
}): PracticeSessionResolution;
export function resolvePracticeSession(input: {
  accountId: string;
  featureId: string;
  platform: CapabilityPlatform;
  capacity?: string | null;
  hasSelectedScope: boolean;
  storage: LocalOnlyKeyValueStorage;
  definitions: Readonly<Record<string, PracticeDefinition>>;
}): PracticeSessionResolution {
  const availability = resolvePracticeAvailability(input);
  if (!availability.available) return availability;

  const policy = declaredPracticeCapability(input.featureId, input.platform);
  if (!policy) return { available: false, reason: 'not-declared' };

  const definition = input.definitions[input.featureId];
  if (!definition || definition.featureId !== input.featureId)
    return { available: false, reason: 'definition-missing' };
  if (definition.documentSchemaId !== policy.persistence.documentSchemaId)
    return { available: false, reason: 'schema-mismatch' };

  return {
    available: true,
    policy,
    session: createCatalogPracticeRuntime({
      accountId: input.accountId,
      featureId: input.featureId,
      policy,
      storage: input.storage,
      codec: definition.codec,
      createInitialState: definition.createInitialState,
    }),
  };
}
