vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

import { assertContractCoverage, defineContractCoverage } from '../contractCoverage';
import { longitudinalAPI as rawLongitudinalAPI } from '../longitudinal';
import { longitudinalContract } from '../longitudinal.contract';

describe('longitudinal POA coverage', () => {
  test('longitudinal public API methods are fully contract-covered', () => {
    const coverage = assertContractCoverage(
      rawLongitudinalAPI,
      defineContractCoverage({
        moduleName: 'longitudinal-test',
        contract: longitudinalContract,
      }),
    );

    expect(coverage.contract).toBe(longitudinalContract);
  });

  test('longitudinal routes carry authority metadata', () => {
    expect(longitudinalContract.getStudentTimeline.metadata?.authority).toEqual({
      action: 'read',
      subject: 'Student',
    });
    expect(longitudinalContract.getStudentSnapshotAsOf.metadata?.authority).toEqual({
      action: 'read',
      subject: 'Student',
    });
  });
});

