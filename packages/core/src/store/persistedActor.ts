import { type Actor, type AnyActor, type AnyStateMachine, createActor } from 'xstate';
import { restoreActor } from 'xstate/persist';

/** Where one actor's persisted snapshot is kept. A value that isn't JSON loads as null. */
export interface PersistedSnapshotStore {
  load(): unknown | null;
  save(snapshot: unknown): void;
  drop(): void;
}

/**
 * A machine whose snapshots are kept. Its `version` is stamped on every snapshot as
 * `machine: { id, version }`; bump it when states, context or events change. To keep people's place
 * across a bump instead of starting them fresh, give the machine a `migrate` function.
 */
export type PersistedMachine = AnyStateMachine & { readonly id: string; readonly version: string };

/**
 * Starts an actor where it left off, or fresh when nothing usable is stored, and saves it on every
 * change. XState decides what is usable: a snapshot from another version (with no `migrate`), or
 * one naming states this machine doesn't have, is dropped and the actor starts fresh. A completed
 * actor's snapshot is dropped, so a finished flow doesn't come back.
 */
export function startPersistedActor<TMachine extends PersistedMachine>(
  machine: TMachine,
  store: PersistedSnapshotStore,
  onFresh?: (actor: Actor<TMachine>) => void,
): Actor<TMachine> {
  // Inside, the actor is handled through XState's general types; callers get `Actor<TMachine>`.
  const logic: AnyStateMachine = machine;
  const saved = store.load();
  let actor: AnyActor | null = null;
  if (saved !== null) {
    try {
      actor = restoreActor(logic, saved as never);
    } catch {
      // A version mismatch with no `migrate` function throws; that snapshot is unusable.
    }
    if (actor?.getSnapshot().status === 'error') actor = null;
    if (!actor) store.drop();
  }

  const restored = actor !== null;
  const started: AnyActor = (actor ?? createActor(logic)).start();
  const persist = () => {
    if (started.getSnapshot().status === 'done') store.drop();
    else store.save(started.getPersistedSnapshot());
  };
  persist();
  started.subscribe(persist);

  const typed = started as Actor<TMachine>;
  if (!restored) onFresh?.(typed);
  return typed;
}
