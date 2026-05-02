describe("profile contract coverage", () => {
	it("registers strict contract coverage for profile and social APIs", () => {
		require("../../../../../packages/profile/src/api/profile");
		require("../../../../../packages/profile/src/api/social");
		const {
			getContractCoverage,
			listContractCoverage,
		} = require("../../../../../packages/core/src/api/contractCoverage");

		const moduleNames = listContractCoverage().map((entry) => entry.moduleName);

		expect(moduleNames).toEqual(
			expect.arrayContaining(["profile", "profileSocial"]),
		);

		expect(getContractCoverage("profile")?.contract).toBeTruthy();
		expect(getContractCoverage("profileSocial")?.contract).toBeTruthy();
	});
});
