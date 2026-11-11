import { Effect } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ logBreadcrumb: vi.fn(), captureException: vi.fn() }));
vi.mock('@repo/core/monitoring', () => ({
  logBreadcrumb: mocks.logBreadcrumb,
  captureException: mocks.captureException,
}));

import { appRuntime } from '../AppRuntime';
import { runForkBestEffort, runToPromise } from '../Runtime';

beforeEach(() => {
  mocks.logBreadcrumb.mockClear();
  mocks.captureException.mockClear();
});

describe('appRuntime', { tags: ['fast'] }, () => {
  it('turns warnings and errors logged in a program into telemetry breadcrumbs', async () => {
    await appRuntime.runPromise(
      Effect.gen(function* () {
        yield* Effect.logInfo('routine');
        yield* Effect.logWarning('sync slow', 'attendance');
      }),
    );
    expect(mocks.logBreadcrumb).toHaveBeenCalledTimes(1);
    expect(mocks.logBreadcrumb).toHaveBeenCalledWith('sync slow attendance', 'effect', {
      level: 'Warn',
    });
  });

  it('is the runtime behind runToPromise', async () => {
    await expect(runToPromise(Effect.logError('boom').pipe(Effect.as(7)), 'test.op')).resolves.toBe(
      7,
    );
    expect(mocks.logBreadcrumb).toHaveBeenCalledWith('boom', 'effect', { level: 'Error' });
  });

  it('still converts typed failures at the boundary and reports them', async () => {
    await expect(runToPromise(Effect.fail({ message: 'nope' }), 'test.fail')).rejects.toThrow(
      'nope',
    );
    expect(mocks.captureException).toHaveBeenCalledTimes(1);
  });

  it('runs fire-and-forget work on the same runtime without throwing', async () => {
    const fiber = runForkBestEffort(Effect.fail(new Error('background')), 'test.bg');
    await Effect.runPromise(Effect.yieldNow);
    await new Promise((r) => setTimeout(r, 0));
    expect(fiber).toBeDefined();
    expect(mocks.captureException).toHaveBeenCalledTimes(1);
  });
});
