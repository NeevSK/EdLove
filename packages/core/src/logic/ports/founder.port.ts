import type { ClassroomRow } from '@repo/core/logic/schemas/classroom.schema';
import type { CommunityGroupRow } from '@repo/core/logic/schemas/community.schema';
import type {
  EcosystemPulse,
  EcosystemStats,
  GlobalUser,
  PlatformBroadcast,
  SentinelAuditLog,
} from '@repo/core/logic/schemas/founder.schema';
import type { SchoolZod } from '@repo/core/logic/schemas/school.schema';

export interface FounderRepository {
  getEcosystemStats(): Promise<EcosystemStats>;
  getAllSchools(): Promise<SchoolZod[]>;
  createSchool(data: { name: string; type: string; created_by: string }): Promise<SchoolZod>;
  createClassroom(data: {
    school_id: string;
    name: string;
    grade_number: number;
    created_by: string;
  }): Promise<ClassroomRow>;
  createGroup(data: {
    name: string;
    description: string;
    school_id: string;
  }): Promise<CommunityGroupRow>;
  listAllUsers(): Promise<GlobalUser[]>;
  updateSchoolMetadata(schoolId: string, metadata: Record<string, unknown>): Promise<SchoolZod>;
  getEcosystemPulse(): Promise<EcosystemPulse>;
  getSentinelGovernance(): Promise<SentinelAuditLog[]>;
  broadcastAnnouncement(data: {
    sender_id: string;
    title: string;
    message: string;
    severity?: 'info' | 'advisory' | 'urgent' | 'critical';
    target_school_ids?: string[];
  }): Promise<PlatformBroadcast>;
}
