import { describe, expect, it } from 'vitest';
import '@repo/core/api';
import '@repo/library/api';
import { getContractCoverage, listContractCoverage } from '@repo/core/api/contractCoverage';

describe('social and knowledge contract coverage', () => {
  it('registers strict contract coverage for community and library APIs', () => {
    const moduleNames = listContractCoverage().map(
      (entry: { moduleName: string }) => entry.moduleName,
    );

    expect(moduleNames).toEqual(expect.arrayContaining(['community', 'library']));

    expect(getContractCoverage('community')?.contract).toBeTruthy();
    expect(getContractCoverage('library')?.contract).toBeTruthy();
  });
});
