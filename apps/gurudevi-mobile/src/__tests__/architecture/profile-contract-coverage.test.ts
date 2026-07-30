import { describe, expect, it } from 'vitest';
import { profileContract } from '@repo/core/api/profile.contract';

describe('profile native oRPC contract coverage', () => {
  it('registers strict profile procedures in the canonical contract', () => {
    const contract = profileContract as any;
    expect(contract.getUserProfile).toBeTruthy();
    expect(contract.updateProfile).toBeTruthy();
    expect(contract.getJourneySnapshot).toBeTruthy();
    expect(contract.getSchoolPulse).toBeTruthy();
  });
});
