import type { LocalOnlyKeyValueStorage } from '@repo/core/logic/ports/storage';

export type PracticeDocument = Record<string, unknown>;

export type PracticeDocumentCodec<T extends PracticeDocument> = Readonly<{
  parse(value: string): T;
  stringify(value: T): string;
}>;

export type PracticeLifecyclePolicy = Readonly<{
  documentSchemaId: string;
  inactivityDays: number;
  maxDocuments: number;
  maxBytes: number;
}>;

export type PracticeLifecycleEvent = Readonly<{
  type: 'expired' | 'quota-exceeded' | 'corrupt' | 'conflict' | 'reset' | 'discard';
  documentSchemaId: string;
}>;

export class PracticeLifecycleError extends Error {
  constructor(
    readonly code: 'conflict' | 'corrupt' | 'quota-exceeded',
    message: string,
  ) {
    super(message);
    this.name = 'PracticeLifecycleError';
  }
}

type DocumentEnvelope = Readonly<{
  version: 1;
  documentSchemaId: string;
  revision: number;
  createdAt: string;
  lastTouchedAt: string;
  expiresAt: string;
  value: unknown;
}>;

type DocumentIndex = Readonly<{
  version: 1;
  documents: Readonly<Record<string, number>>;
}>;

const DAY_MS = 24 * 60 * 60 * 1000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function byteSize(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

function parseIndex(value: string | null): DocumentIndex {
  if (!value) return { version: 1, documents: {} };
  try {
    const parsed: unknown = JSON.parse(value);
    if (!isRecord(parsed) || parsed.version !== 1 || !isRecord(parsed.documents))
      return { version: 1, documents: {} };
    return {
      version: 1,
      documents: Object.fromEntries(
        Object.entries(parsed.documents).filter((entry): entry is [string, number] =>
          Number.isFinite(entry[1]),
        ),
      ),
    };
  } catch {
    return { version: 1, documents: {} };
  }
}

function parseEnvelope(value: string, policy: PracticeLifecyclePolicy): DocumentEnvelope | null {
  const parsed: unknown = JSON.parse(value);
  if (!isRecord(parsed)) return null;
  if (
    parsed.version !== 1 ||
    parsed.documentSchemaId !== policy.documentSchemaId ||
    typeof parsed.revision !== 'number' ||
    typeof parsed.createdAt !== 'string' ||
    typeof parsed.lastTouchedAt !== 'string' ||
    typeof parsed.expiresAt !== 'string'
  ) {
    return null;
  }
  return parsed as DocumentEnvelope;
}

function nextExpiry(now: Date, policy: PracticeLifecyclePolicy): string {
  return new Date(now.getTime() + policy.inactivityDays * DAY_MS).toISOString();
}

function hasExpired(envelope: DocumentEnvelope, now: Date): boolean {
  const expiry = Date.parse(envelope.expiresAt);
  return !Number.isFinite(expiry) || expiry <= now.getTime();
}

/**
 * Owns the lifecycle metadata for one catalog-defined Safe Try document.
 * It never exposes an account id, physical storage key, or document body in
 * lifecycle events, making its events safe to forward to observability later.
 */
export function createPracticeDocumentLifecycle<T extends PracticeDocument>(input: {
  storage: LocalOnlyKeyValueStorage;
  storageKey: string;
  indexKey: string;
  policy: PracticeLifecyclePolicy;
  codec: PracticeDocumentCodec<T>;
  createInitialState(): T;
  now?: () => Date;
  onEvent?: (event: PracticeLifecycleEvent) => void;
}) {
  let observedRevision: number | null = null;

  const now = () => input.now?.() ?? new Date();
  const emit = (type: PracticeLifecycleEvent['type']) =>
    input.onEvent?.({ type, documentSchemaId: input.policy.documentSchemaId });

  async function writeIndex(next: DocumentIndex): Promise<void> {
    await input.storage.setItem(input.indexKey, JSON.stringify(next));
  }

  async function removeFromIndex(): Promise<void> {
    const current = parseIndex(await input.storage.getItem(input.indexKey));
    if (!(input.storageKey in current.documents)) return;
    const { [input.storageKey]: _removed, ...documents } = current.documents;
    if (!Object.keys(documents).length) {
      await input.storage.removeItem(input.indexKey);
      return;
    }
    await writeIndex({ version: 1, documents });
  }

  async function readCurrent(): Promise<{ envelope: DocumentEnvelope | null; document: T | null }> {
    const raw = await input.storage.getItem(input.storageKey);
    if (!raw) return { envelope: null, document: null };
    try {
      const envelope = parseEnvelope(raw, input.policy);
      if (!envelope) {
        const document = input.codec.parse(raw);
        return { envelope: null, document };
      }
      if (hasExpired(envelope, now())) {
        await input.storage.removeItem(input.storageKey);
        await removeFromIndex();
        observedRevision = null;
        emit('expired');
        return { envelope: null, document: null };
      }
      const document = input.codec.parse(JSON.stringify(envelope.value));
      return { envelope, document };
    } catch (cause) {
      emit('corrupt');
      throw new PracticeLifecycleError(
        'corrupt',
        cause instanceof Error
          ? 'Safe Try data on this device could not be read. It was not removed.'
          : 'Safe Try data on this device could not be read. It was not removed.',
      );
    }
  }

  async function enforceQuota(serialized: string): Promise<void> {
    if (byteSize(serialized) > input.policy.maxBytes) {
      emit('quota-exceeded');
      throw new PracticeLifecycleError(
        'quota-exceeded',
        'This Safe Try document is too large to keep on this device.',
      );
    }
    const index = parseIndex(await input.storage.getItem(input.indexKey));
    const knownBytes = index.documents[input.storageKey];
    const documentCount = Object.keys(index.documents).length + (knownBytes === undefined ? 1 : 0);
    const totalBytes =
      Object.values(index.documents).reduce((total, size) => total + size, 0) -
      (knownBytes ?? 0) +
      byteSize(serialized);
    if (documentCount > input.policy.maxDocuments || totalBytes > input.policy.maxBytes) {
      emit('quota-exceeded');
      throw new PracticeLifecycleError(
        'quota-exceeded',
        'Safe Try storage is full on this device. Discard another Safe Try before continuing.',
      );
    }
    await writeIndex({
      version: 1,
      documents: { ...index.documents, [input.storageKey]: byteSize(serialized) },
    });
  }

  async function persist(value: T, expectedRevision: number | null): Promise<void> {
    const current = await readCurrent();
    const currentRevision = current.envelope?.revision ?? null;
    if (expectedRevision !== currentRevision) {
      emit('conflict');
      throw new PracticeLifecycleError(
        'conflict',
        'This Safe Try changed in another tab. Reload it before saving your changes.',
      );
    }
    const timestamp = now();
    const envelope: DocumentEnvelope = {
      version: 1,
      documentSchemaId: input.policy.documentSchemaId,
      revision: (currentRevision ?? 0) + 1,
      createdAt: current.envelope?.createdAt ?? timestamp.toISOString(),
      lastTouchedAt: timestamp.toISOString(),
      expiresAt: nextExpiry(timestamp, input.policy),
      value,
    };
    const serialized = JSON.stringify(envelope);
    await enforceQuota(serialized);
    await input.storage.setItem(input.storageKey, serialized);
    observedRevision = envelope.revision;
  }

  return {
    async load(): Promise<T> {
      const current = await readCurrent();
      if (!current.document) {
        observedRevision = null;
        return input.createInitialState();
      }
      if (current.envelope) {
        observedRevision = current.envelope.revision;
        const timestamp = now();
        const touched: DocumentEnvelope = {
          ...current.envelope,
          lastTouchedAt: timestamp.toISOString(),
          expiresAt: nextExpiry(timestamp, input.policy),
        };
        await input.storage.setItem(input.storageKey, JSON.stringify(touched));
      }
      return current.document;
    },
    async save(value: T): Promise<void> {
      await persist(value, observedRevision);
    },
    async reset(): Promise<void> {
      await persist(input.createInitialState(), observedRevision);
      emit('reset');
    },
    async discard(): Promise<void> {
      await input.storage.removeItem(input.storageKey);
      await removeFromIndex();
      observedRevision = null;
      emit('discard');
    },
  };
}
