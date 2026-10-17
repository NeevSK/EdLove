import { createTemporalProxy } from '@repo/core/api/temporalProxy';
import { useTemporalStore } from '@repo/core/store/useTemporalStore';
import { beforeEach, describe, expect, it } from 'vitest';
import { createScenarioTestContext } from '../../testing/scenarioHarness';

describe('Scenario 5: Temporal Boundary & Mutation Shielding', () => {
  const harness = createScenarioTestContext();

  beforeEach(async () => {
    await harness.resetAll();
  });

  it('blocks mutation execution when temporal state is set to a past date', async () => {
    // Shift temporal store to a past historical phase
    useTemporalStore.setState({
      phase: 'past',
      isPastView: true,
      viewDate: '2024-01-01',
    });

    const mockTarget = {
      updateRecord: async (data: any) => ({ success: true, data }),
      getRecord: async () => ({ id: 'rec_1', name: 'Past Ledger' }),
    };

    const proxy = createTemporalProxy('ledger', mockTarget);

    // Attempt mutation while in past ledger
    await expect(proxy.updateRecord({ name: 'Tampered' })).rejects.toThrow('Cannot modify history');
  });

  it('permits read queries while in past date phase', async () => {
    useTemporalStore.setState({
      phase: 'past',
      isPastView: true,
      viewDate: '2024-01-01',
    });

    const mockTarget = {
      getRecord: async () => ({ id: 'rec_1', name: 'Past Snapshot' }),
    };

    const proxy = createTemporalProxy('ledger', mockTarget);

    const record = await proxy.getRecord();
    expect(record).toEqual({ id: 'rec_1', name: 'Past Snapshot' });
  });
});
