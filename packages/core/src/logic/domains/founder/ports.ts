import type { Classroom } from '@/logic/schemas/classroom.schema';
import type { CommunityGroup } from '@/logic/schemas/community.schema';
import type {
  EcosystemPulse,
  EcosystemStats,
  GlobalUser,
  SentinelAuditLog,
} from '@/logic/schemas/founder.schema';
import type { SchoolZod } from '@/logic/schemas/school.schema';

export interface FounderRepository {
  getEcosystemStats(): Promise<EcosystemStats>;
  getAllSchools(): Promise<SchoolZod[]>;
  createSchool(data: { name: string; type: string; created_by: string }): Promise<SchoolZod>;
  createClassroom(data: {
    school_id: string;
    name: string;
    grade_number: number;
    created_by: string;
  }): Promise<Classroom>;
  createGroup(data: {
    name: string;
    description: string;
    school_id: string;
  }): Promise<CommunityGroup>;
  listAllUsers(): Promise<GlobalUser[]>;
  updateSchoolMetadata(schoolId: string, metadata: Record<string, unknown>): Promise<SchoolZod>;
  getEcosystemPulse(): Promise<EcosystemPulse>;
  getSentinelGovernance(): Promise<SentinelAuditLog[]>;
}
