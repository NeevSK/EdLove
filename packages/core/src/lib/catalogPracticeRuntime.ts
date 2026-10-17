import type { LocalOnlyKeyValueStorage } from '@repo/core/logic/ports/storage';
import type { CapabilityPracticePolicy } from '@repo/core/logic/registry/capabilityManifest';
import { createFeatureRuntime, type FeatureRuntime } from './featureRuntime';
import {
  createAccountPracticeDocumentScope,
  createAccountPracticeScope,
  deriveAccountPracticeDocumentKey,
  deriveAccountPracticeIndexKey,
  deriveAccountPracticeKey,
  deriveAccountPracticeLegacyDismissalKey,
} from './practiceBoundary';
import { createPracticeController } from './practiceContract';
import {
  createPracticeDocumentLifecycle,
  type PracticeDocument,
  type PracticeDocumentCodec,
} from './practiceDocumentLifecycle';

export type CatalogPracticeRuntime<T extends PracticeDocument> = Readonly<{
  storageKey: string;
  runtime: FeatureRuntime<T>;
}>;

export type { PracticeDocument, PracticeDocumentCodec } from './practiceDocumentLifecycle';

/**
 * The catalog decides the policy; the platform supplies its local storage port.
 * Features provide only their state document and fictional initial state.
 */
export function createCatalogPracticeRuntime<T extends PracticeDocument>(input: {
  accountId: string;
  featureId: string;
  policy: CapabilityPracticePolicy;
  storage: LocalOnlyKeyValueStorage;
  codec: PracticeDocumentCodec<T>;
  createInitialState(): T;
}): CatalogPracticeRuntime<T>;
export function createCatalogPracticeRuntime<T extends PracticeDocument>(input: {
  accountId: string;
  featureId: string;
  policy: CapabilityPracticePolicy;
  storage: LocalOnlyKeyValueStorage;
  codec: PracticeDocumentCodec<T>;
  createInitialState(): T;
}): CatalogPracticeRuntime<T> {
  if (input.policy.persistence.mode !== 'local-isolated') {
    throw new Error('This Safe Try persistence mode does not have a local runtime.');
  }

  const scope = createAccountPracticeScope({
    accountId: input.accountId,
    featureId: input.featureId,
    workspaceId: input.policy.persistence.documentId,
  });
  const documentScope = createAccountPracticeDocumentScope({
    accountId: input.accountId,
    featureId: input.featureId,
    documentId: input.policy.persistence.documentId,
  });
  const storageKey = deriveAccountPracticeDocumentKey(documentScope);
  const legacyDismissalKey = deriveAccountPracticeLegacyDismissalKey(documentScope);
  const legacyStorageKeys = (input.policy.persistence.legacyLocations ?? []).map((location) =>
    deriveAccountPracticeKey(
      createAccountPracticeScope({
        accountId: input.accountId,
        featureId: input.featureId,
        workspaceId: location.documentId,
      }),
      location.recordId,
    ),
  );
  const lifecycle = createPracticeDocumentLifecycle({
    storage: input.storage,
    storageKey,
    indexKey: deriveAccountPracticeIndexKey(input.accountId),
    policy: {
      ...input.policy.persistence.lifecycle,
      documentSchemaId: input.policy.persistence.documentSchemaId,
    },
    codec: input.codec,
    createInitialState: input.createInitialState,
  });
  const adapter = {
    async load(): Promise<T> {
      const stored = await input.storage.getItem(storageKey);
      if (stored) return lifecycle.load();
      const legacyDismissed = await input.storage.getItem(legacyDismissalKey);
      if (legacyDismissed) return lifecycle.load();
      for (const legacyStorageKey of legacyStorageKeys) {
        const legacy = await input.storage.getItem(legacyStorageKey);
        if (!legacy) continue;
        const document = input.codec.parse(legacy);
        await lifecycle.save(document);
        await input.storage.setItem(legacyDismissalKey, '1');
        return document;
      }
      return lifecycle.load();
    },
    save: lifecycle.save,
    reset: lifecycle.reset,
    async discard(): Promise<void> {
      await lifecycle.discard();
      await input.storage.setItem(legacyDismissalKey, '1');
    },
  };
  const practice = createPracticeController({ scope, adapter });

  return {
    storageKey,
    runtime: createFeatureRuntime({ mode: 'practice', practice }),
  };
}
