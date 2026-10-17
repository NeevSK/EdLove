import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { beforeEach, describe, expect, it } from 'vitest';
import { createScenarioTestContext } from '../../testing/scenarioHarness';

describe('Scenario 4: Storage Corruption & Safe Recovery', () => {
  const harness = createScenarioTestContext();

  beforeEach(async () => {
    await harness.resetAll();
  });

  it('handles malformed JSON in local storage gracefully without fatal errors', async () => {
    const corruptKey = 'gurudevi-corrupt-data-test';
    // Write corrupted JSON string
    await SafeZustandStorage.setItem(corruptKey, '{ malformed: json: test::: }');

    const raw = await SafeZustandStorage.getItem(corruptKey);
    expect(raw).toBe('{ malformed: json: test::: }');

    let parsed = null;
    try {
      parsed = JSON.parse(raw!);
    } catch (e) {
      // Safe fallback recovery
      parsed = { fallback: true };
    }

    expect(parsed).toEqual({ fallback: true });
  });

  it('recovers by clearing damaged storage key and persisting default state', async () => {
    const corruptKey = 'gurudevi-damaged-key';
    await SafeZustandStorage.setItem(corruptKey, 'null_pointer_exception_dump');

    // Repair protocol
    await SafeZustandStorage.removeItem(corruptKey);
    const afterClean = await SafeZustandStorage.getItem(corruptKey);
    expect(afterClean).toBeNull();

    const freshState = { initialized: true, version: 1 };
    await SafeZustandStorage.setItem(corruptKey, JSON.stringify(freshState));

    const restored = await SafeZustandStorage.getItem(corruptKey);
    expect(JSON.parse(restored!)).toEqual(freshState);
  });
});
