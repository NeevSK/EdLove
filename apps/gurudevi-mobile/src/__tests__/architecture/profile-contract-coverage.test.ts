describe('profile contract coverage', () => {
  it('registers strict contract coverage for profile and social APIs', () => {
    require('@repo/profile/api/profile');
    require('@repo/profile/api/social');
    const {
      getContractCoverage,
      listContractCoverage,
    } = require('@repo/core/api/contractCoverage');

    const moduleNames = listContractCoverage().map((entry) => entry.moduleName);

    expect(moduleNames).toEqual(expect.arrayContaining(['profile', 'profileSocial']));

    expect(getContractCoverage('profile')?.contract).toBeTruthy();
    expect(getContractCoverage('profileSocial')?.contract).toBeTruthy();
  });
});
