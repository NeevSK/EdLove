import { describe, expect, it } from 'vitest';
import { educationalORPCContract } from '@repo/core/api/educational.orpc.contract';

describe('educational native oRPC contract coverage', () => {
  it('registers strict native procedures for the migrated educational APIs', () => {
    const contract = educationalORPCContract as any;
    expect(contract.getById).toBeTruthy();
    expect(contract.createClassroom).toBeTruthy();
    expect(contract.getClassroomStudents).toBeTruthy();
    expect(contract.createClassroomNote).toBeTruthy();
    expect(contract.createMaterial).toBeTruthy();
    expect(contract.createAssignment).toBeTruthy();
    expect(contract.submitAssignment).toBeTruthy();
  });
});
