import { describe, expect, it, vi } from 'vitest';
import { createMachine, types } from 'xstate';
import { z } from 'zod';
import { type PersistedSnapshotStore, startPersistedActor } from './persistedActor';

const schemas = {
  context: z.object({ total: z.number() }),
  events: { ADD: types<{ by: number }>(), FINISH: types<void>() },
};
const states = {
  counting: {
    on: {
      ADD: ({ context, event }: { context: { total: number }; event: { by: number } }) => ({
        context: { total: context.total + event.by },
      }),
      FINISH: { target: 'done' },
    },
  },
  done: { type: 'final' },
} as const;

const v1 = createMachine({ id: 'counter', version: '1', schemas, initial: 'counting', context: { total: 0 }, states });
const v2 = createMachine({
  id: 'counter',
  version: '2',
  schemas,
  initial: 'counting',
  context: { total: 0 },
  states,
  // v2 counts in tens: keep people's place by converting what v1 stored.
  migrate: (snapshot: { context: { total: number } }) => ({
    ...snapshot,
    context: { total: snapshot.context.total * 10 },
  }),
});
const v3 = createMachine({ id: 'counter', version: '3', schemas, initial: 'counting', context: { total: 0 }, states });

function memory(initial: unknown = null): PersistedSnapshotStore & { value: unknown } {
  const store = {
    value: initial,
    load: () => store.value,
    save: (snapshot: unknown) => {
      store.value = JSON.parse(JSON.stringify(snapshot));
    },
    drop: () => {
      store.value = null;
    },
  };
  return store;
}

describe('startPersistedActor / G1, real XState restore', () => {
  it('saves at once and on every change, then resumes where it left off', () => {
    const store = memory();
    const first = startPersistedActor(v1, store);
    expect(store.value).toMatchObject({ machine: { id: 'counter', version: '1' } });
    first.send({ type: 'ADD', by: 3 });
    first.stop();
    const onFresh = vi.fn();
    const resumed = startPersistedActor(v1, store, onFresh);
    expect(resumed.getSnapshot().context.total).toBe(3);
    expect(onFresh).not.toHaveBeenCalled();
  });

  it('migrates a snapshot from an older version when the machine says how', () => {
    const store = memory();
    startPersistedActor(v1, store).send({ type: 'ADD', by: 3 });
    const migrated = startPersistedActor(v2, store);
    expect(migrated.getSnapshot().context.total).toBe(30);
    expect(store.value).toMatchObject({ machine: { version: '2' } });
  });

  it.each([
    ['another version, with no migrate function', () => {
      const store = memory();
      startPersistedActor(v1, store).send({ type: 'ADD', by: 3 });
      return store;
    }],
    ['a state this machine does not have', () => memory({ value: 'nowhere', context: { total: 1 }, machine: { id: 'counter', version: '3' } })],
    ['the pre-versioning envelope', () => memory({ version: 2, savedAt: '2026-11-01T00:00:00.000Z', snapshot: {} })],
  ])('starts fresh from %s', (_name, seed) => {
    const store = seed();
    const onFresh = vi.fn();
    const actor = startPersistedActor(v3, store, onFresh);
    expect(actor.getSnapshot().context.total).toBe(0);
    expect(onFresh).toHaveBeenCalledOnce();
    expect(store.value).toMatchObject({ machine: { version: '3' } });
  });

  it('drops a finished flow so it does not come back', () => {
    const store = memory();
    startPersistedActor(v1, store).send({ type: 'FINISH' });
    expect(store.value).toBeNull();
  });
});
