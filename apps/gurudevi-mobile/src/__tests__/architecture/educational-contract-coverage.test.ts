describe('educational contract coverage', () => {
    it('registers strict contract coverage for the educational APIs', () => {
        require('../../../../../packages/core/src/api');
        const { getContractCoverage, listContractCoverage } = require('../../../../../packages/core/src/api/contractCoverage');

        const moduleNames = listContractCoverage().map((entry) => entry.moduleName);

        expect(moduleNames).toEqual(
            expect.arrayContaining([
                'attendance',
                'classrooms',
                'lessons',
                'students',
                'assignments',
                'classroomStudents',
                'lessonMaterials',
                'grading',
            ])
        );

        expect(getContractCoverage('lessons')?.contract).toBeTruthy();
        expect(getContractCoverage('classrooms')?.contract).toBeTruthy();
        expect(getContractCoverage('grading')?.contract).toBeTruthy();
    });
});
