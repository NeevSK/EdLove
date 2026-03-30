import type { Classroom } from '../../api/schemas/classroom.schema';
import type { CommunityGroup } from '../../api/schemas/community.schema';
import type { EcosystemPulse, EcosystemStats, GlobalUser, SentinelAuditLog } from '../../api/schemas/founder.schema';
import type { SchoolZod } from '../../api/schemas/school.schema';
import type { FounderRepository } from './ports';

export interface FounderServices {
    getEcosystemStats(): Promise<EcosystemStats>;
    getAllSchools(): Promise<SchoolZod[]>;
    createSchool(data: { name: string; type: string; created_by: string }): Promise<SchoolZod>;
    createClassroom(data: { school_id: string; name: string; grade_number: number; created_by: string }): Promise<Classroom>;
    createGroup(data: { name: string; description: string; school_id: string }): Promise<CommunityGroup>;
    listAllUsers(): Promise<GlobalUser[]>;
    updateSchoolMetadata(schoolId: string, metadata: Record<string, unknown>): Promise<SchoolZod>;
    getEcosystemPulse(): Promise<EcosystemPulse>;
    getSentinelGovernance(): Promise<SentinelAuditLog[]>;
}

export const createFounderServices = (repository: FounderRepository): FounderServices => ({
    getEcosystemStats: () => repository.getEcosystemStats(),
    getAllSchools: () => repository.getAllSchools(),
    createSchool: (data) => repository.createSchool(data),
    createClassroom: (data) => repository.createClassroom(data),
    createGroup: (data) => repository.createGroup(data),
    listAllUsers: () => repository.listAllUsers(),
    updateSchoolMetadata: (schoolId, metadata) => repository.updateSchoolMetadata(schoolId, metadata),
    getEcosystemPulse: () => repository.getEcosystemPulse(),
    getSentinelGovernance: () => repository.getSentinelGovernance(),
});
