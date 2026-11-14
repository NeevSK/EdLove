import { useMachineActor } from '@repo/core/hooks/useMachineActor';
import { renderHook, act, cleanup } from '@testing-library/react-native';
import { afterEach, describe, expect, it } from 'vitest';
import { createActor, createMachine } from 'xstate';

describe('useMachineActor lifecycle in React Native runtime', () => {
  afterEach(() => {
    cleanup();
  });

  const testMachine = createMachine({
    id: 'testLifecycle',
    initial: 'idle',
    context: { count: 0 },
    states: {
      idle: {
        on: {
          INCREMENT: ({ context }) => ({
            target: 'idle',
            context: { count: context.count + 1 },
          }),
        },
      },
    },
  });

  it('instantiates and starts actor on mount, providing reactive snapshot', async () => {
    const { result, unmount } = await renderHook(() =>
      useMachineActor(() => createActor(testMachine), []),
    );

    expect(result.current.actor.getSnapshot().status).toBe('active');
    expect(result.current.snapshot.value).toBe('idle');
    expect(result.current.snapshot.context.count).toBe(0);

    await act(async () => {
      result.current.actor.send({ type: 'INCREMENT' });
    });

    expect(result.current.snapshot.context.count).toBe(1);
    unmount();
  });

  it('stops the actor on unmount (zero zombie memory leaks)', async () => {
    const { result, unmount } = await renderHook(() =>
      useMachineActor(() => createActor(testMachine), []),
    );

    const actorInstance = result.current.actor;
    expect(actorInstance.getSnapshot().status).toBe('active');

    await act(async () => {
      unmount();
    });

    expect(actorInstance.getSnapshot().status).toBe('stopped');
  });

  it('stops the previous actor when dependencies change before starting a new one', async () => {
    const { result, rerender, unmount } = await renderHook(
      ({ id }: { id: string }) =>
        useMachineActor(
          () =>
            createActor(
              createMachine({
                id: `machine-${id}`,
                initial: 'idle',
                context: { tag: id },
                states: { idle: {} },
              }),
            ),
          [id],
        ),
      { initialProps: { id: 'cohort-1' } },
    );

    const firstActor = result.current.actor;
    expect(firstActor.getSnapshot().status).toBe('active');
    expect(result.current.snapshot.context.tag).toBe('cohort-1');

    // Change dependency
    await act(async () => {
      rerender({ id: 'cohort-2' });
    });

    // First actor must be stopped
    expect(firstActor.getSnapshot().status).toBe('stopped');

    // Second actor must be active with new context
    const secondActor = result.current.actor;
    expect(secondActor.getSnapshot().status).toBe('active');
    expect(result.current.snapshot.context.tag).toBe('cohort-2');
    expect(firstActor).not.toBe(secondActor);

    await act(async () => {
      unmount();
    });
    expect(secondActor.getSnapshot().status).toBe('stopped');
  });
});
