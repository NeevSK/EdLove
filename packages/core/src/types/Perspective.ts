import type { SchoolType } from '@repo/core/constants/SriLankanSchools';
import type { Capacity } from '@repo/core/logic/schemas/capacity.schema';

export type PerspectiveKind =
  | 'personal'
  | 'commercial'
  | 'institutional'
  | 'guardian'
  | 'community';

export type MediumOfInstruction = 'sinhala' | 'english' | 'tamil';

export type CommercialClassFormat = 'physical' | 'online' | 'hybrid' | 'paper_class';

export interface BasePerspective {
  id: string; // 'personal' or unique bond ID
  kind: PerspectiveKind;
  displayName: string;
}

export interface PersonalPerspective extends BasePerspective {
  kind: 'personal';
  id: 'personal';
  displayName: string;
  studioType?: 'general' | 'educator' | 'learner';
  personalClassrooms?: Array<{
    id: string;
    name: string;
    subject?: string;
    studentCount?: number;
  }>;
}

export interface CommercialPerspective extends BasePerspective {
  kind: 'commercial';
  id: string; // e.g. "commercial:apex_nugegoda:phys_2026_sun"
  instituteId: string;
  instituteName: string;
  isIndependentStudio?: boolean;
  subjectId: string;
  subjectName: string;
  grade: string; // e.g. "2026 A/L", "Grade 11"
  medium: MediumOfInstruction;
  format?: CommercialClassFormat;
  batchId: string;
  batchName: string;
  role: 'founder' | 'lead_tutor' | 'assistant_tutor' | 'paper_marker';
  customAlias?: string | null;
  displayTitle: string; // Computed alias or formatted title
  academicCycleId?: string | null;
}

export interface InstitutionalBondPerspective extends BasePerspective {
  kind: 'institutional';
  id: string; // bond ID (e.g. bond:school_123:teacher)
  schoolId: string;
  schoolName: string;
  schoolType?: SchoolType | string | null;
  capacity: Capacity; // Primary active capacity
  roles: Capacity[]; // Plural roles/capacities in this institution
  academicCycleId?: string | null;
}

export interface GuardianBondPerspective extends BasePerspective {
  kind: 'guardian';
  id: string; // bond ID
  wardUserId: string;
  wardName: string;
  schoolId?: string | null;
}

export type SanctuaryPerspective =
  | PersonalPerspective
  | CommercialPerspective
  | InstitutionalBondPerspective
  | GuardianBondPerspective;

export interface PerspectiveState {
  activePerspective: SanctuaryPerspective;
  availablePerspectives: SanctuaryPerspective[];
  isTransitioning: boolean;
}
