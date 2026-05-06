import type { Capacity as AuthorityTier } from '../logic/schemas/capacity.schema';
import type { TenantKind } from './Tenancy';

export interface School {
  id: string;
  name: string;
  type: string; // Legacy field
  handle: string | null;
  status: 'active' | 'pending' | 'rejected';
  tenant_kind?: TenantKind;
  official_type?: string;
  province_id?: string;
  district_id?: string;
  city?: string;
  address?: string;
  student_type?: string;
  religious_affiliation?: string;
  student_count?: number;
  avatar_url?: string | null;
  created_at?: Date;
}

export interface Section {
  id: string;
  school_id: string;
  name: string; // e.g., "Primary", "Secondary"
  created_at: Date;
}

export interface SchoolGrade {
  id: string;
  section_id: string;
  number: number; // 1-13
  created_at: Date;
}

export type Grade = SchoolGrade;

export interface Announcement {
  id: string;
  school_id: string;
  author_id: string;
  content: string;
  is_pinned: boolean;
  created_at: Date;
}

export interface InviteCode {
  code: string;
  school_id: string;
  role: AuthorityTier; // Canonical role name
  authority: AuthorityTier; // Legacy/DB field compatibility
  created_by: string;
  used: boolean;
  created_at: Date;
  expires_at?: Date;
}

export interface SchoolStats {
  total_students: number;
  total_teachers: number;
  total_classrooms: number;
  total_sections: number;
}

export interface AcademicCycle {
  id: string;
  school_id: string;
  name: string;
  start_date: Date;
  end_date: Date;
  is_current: boolean;
  created_at: Date;
}
