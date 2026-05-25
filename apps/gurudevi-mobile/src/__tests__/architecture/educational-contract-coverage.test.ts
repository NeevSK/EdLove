import { describe, expect, it } from 'vitest';
import '@repo/core/api';
import { getContractCoverage, listContractCoverage } from '@repo/core/api/contractCoverage';

describe('educational contract coverage', () => {
  it('registers strict contract coverage for the educational APIs', () => {
    const moduleNames = listContractCoverage().map((entry: any) => entry.moduleName);

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
      ]),
    );

    expect(getContractCoverage('lessons')?.contract).toBeTruthy();
    expect(getContractCoverage('classrooms')?.contract).toBeTruthy();
    expect(getContractCoverage('grading')?.contract).toBeTruthy();
  });
});
