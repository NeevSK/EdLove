import { describe, expect, it } from 'vitest';
import '@repo/profile/api';
import { getContractCoverage, listContractCoverage } from '@repo/core/api/contractCoverage';

describe('profile contract coverage', () => {
  it('registers strict contract coverage for profile and social APIs', () => {
    const moduleNames = listContractCoverage().map((entry: any) => entry.moduleName);

    expect(moduleNames).toEqual(expect.arrayContaining(['profile']));

    expect(getContractCoverage('profile')?.contract).toBeTruthy();
  });
});
