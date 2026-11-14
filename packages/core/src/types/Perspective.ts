import type { SchoolType } from '@repo/core/constants/SriLankanSchools';
import type { Capacity } from '@repo/core/logic/schemas/capacity.schema';
import type { CivicRoleId } from './CivicRole';

/**
 * Sovereign Sector: The legal covenant / ReBAC bond boundary.
 * - 'personal': Autonomous, self-governed studio or personal sanctuary (SECOND_CLASS).
 * - 'institutional': Formal school / classroom bond under institutional ReBAC & Cedar (FIRST_CLASS).
 * - 'commercial': Tuition institute / private tutoring batch contract.
 * - 'community': Peer or civic social circles.
 */
export type SectorKind =
  | 'personal'
  | 'commercial'
  | 'institutional'
  | 'community';

/**
 * PerspectiveKind is canonically aliased to SectorKind.
 * Note: 'guardian' is a Civic Role (human capacity caring for a ward) inside an
 * institutional or family covenant, retained as an optional backward-compatible alias.
 */
export type PerspectiveKind = SectorKind | 'guardian';

export type MediumOfInstruction = 'sinhala' | 'english' | 'tamil';

export type CommercialClassFormat = 'physical' | 'online' | 'hybrid' | 'paper_class';

export interface BasePerspective {
  id: string; // 'personal' or unique bond ID
  kind: PerspectiveKind;
  displayName: string;
  /** Explicit civic role if specified on the perspective */
  civicRole?: CivicRoleId;
}

export interface PersonalPerspective extends BasePerspective {
  kind: 'personal';
  id: 'personal';
  displayName: string;
  studioType?: 'general' | 'educator' | 'learner';
  civicRole?: CivicRoleId;
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
  civicRole?: 'teacher';
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
  capacity: Capacity; // Primary active capacity (e.g. 'teacher', 'principal', 'student', 'guardian')
  roles: Capacity[]; // Plural roles/capacities in this institution
  civicRole?: CivicRoleId;
  academicCycleId?: string | null;
}

export interface GuardianBondPerspective extends BasePerspective {
  kind: 'guardian';
  id: string; // bond ID
  wardUserId: string;
  wardName: string;
  schoolId?: string | null;
  civicRole?: 'guardian';
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

