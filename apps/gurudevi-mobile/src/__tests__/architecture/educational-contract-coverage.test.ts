describe("educational contract coverage", () => {
	it("registers strict contract coverage for the educational APIs", () => {
		require("@repo/core/api");
		const {
			getContractCoverage,
			listContractCoverage,
		} = require("@repo/core/api/contractCoverage");

		const moduleNames = listContractCoverage().map((entry) => entry.moduleName);

		expect(moduleNames).toEqual(
			expect.arrayContaining([
				"attendance",
				"classrooms",
				"lessons",
				"students",
				"assignments",
				"classroomStudents",
				"lessonMaterials",
				"grading",
			]),
		);

		expect(getContractCoverage("lessons")?.contract).toBeTruthy();
		expect(getContractCoverage("classrooms")?.contract).toBeTruthy();
		expect(getContractCoverage("grading")?.contract).toBeTruthy();
	});
});
