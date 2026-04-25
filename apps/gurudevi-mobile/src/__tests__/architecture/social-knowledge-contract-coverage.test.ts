describe('social and knowledge contract coverage', () => {
  it('registers strict contract coverage for community and library APIs', () => {
    require('../../../../../packages/core/src/api');
    require('../../../../../packages/library/src/api/library');
    const {
      getContractCoverage,
      listContractCoverage,
    } = require('../../../../../packages/core/src/api/contractCoverage');

    const moduleNames = listContractCoverage().map(
      (entry: { moduleName: string }) => entry.moduleName,
    );

    expect(moduleNames).toEqual(expect.arrayContaining(['community', 'library']));

    expect(getContractCoverage('community')?.contract).toBeTruthy();
    expect(getContractCoverage('library')?.contract).toBeTruthy();
  });
});
