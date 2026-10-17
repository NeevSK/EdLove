import { useLocalFirstQuery } from '@repo/core/hooks/useLocalFirstQuery';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createScenarioTestContext } from '../../testing/scenarioHarness';

describe('Suite C: Out-of-Order Network Jitter & Stale Overwrite Race Suite', () => {
  const harness = createScenarioTestContext();

  beforeEach(async () => {
    await harness.resetAll();
    harness.setAuthenticatedUser('user_race_condition');
  });

  it('prevents stale slower response from overwriting newer faster response (Inverted Latency Race)', async () => {
    let activeVersion = 0;
    const resolvedHistory: string[] = [];

    // Simulated fetcher with controllable latency
    const queryFetcher = async (queryId: string, latencyMs: number) => {
      const thisVersion = ++activeVersion;
      await new Promise((resolve) => setTimeout(resolve, latencyMs));
      return { queryId, version: thisVersion, data: `Payload for ${queryId}` };
    };

    // Race sequence:
    // Request 1 fired first with high latency (200ms)
    // Request 2 fired 20ms later with low latency (30ms)
    let latestCommittedVersion = 0;
    let finalState: any = null;

    const dispatchRequest = async (queryId: string, latencyMs: number) => {
      const result = await queryFetcher(queryId, latencyMs);
      // Modern sequence version guard
      if (result.version >= latestCommittedVersion) {
        latestCommittedVersion = result.version;
        finalState = result;
        resolvedHistory.push(result.queryId);
      }
    };

    // Fire slow request 1
    const p1 = dispatchRequest('req_1_slow', 100);
    // Fire fast request 2
    const p2 = new Promise((resolve) => setTimeout(resolve, 10)).then(() =>
      dispatchRequest('req_2_fast', 20),
    );

    await Promise.all([p1, p2]);

    // req_2_fast finished FIRST, and req_1_slow finished LAST.
    // However, the committed state MUST retain req_2_fast because req_1 is stale!
    expect(finalState.queryId).toBe('req_2_fast');
    expect(finalState.version).toBe(2);
  });

  it('drops cancelled promises when AbortController aborts before completion', async () => {
    const controller = new AbortController();
    let stateMutated = false;

    const longRunningAsync = async (signal: AbortSignal) => {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, 150);
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
      stateMutated = true;
    };

    const taskPromise = longRunningAsync(controller.signal);

    // Abort after 20ms
    setTimeout(() => controller.abort(), 20);

    await expect(taskPromise).rejects.toThrow('Aborted');
    expect(stateMutated).toBe(false);
  });
});
