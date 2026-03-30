import { Role as AuthorityTier } from '../permissions/schemas/role.schema';
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
    created_at?: string;
}

export interface Section {
    id: string;
    school_id: string;
    name: string; // e.g., "Primary", "Secondary"
    created_at: string;
}

export interface SchoolGrade {
    id: string;
    section_id: string;
    number: number; // 1-13
    created_at: string;
}

export type Grade = SchoolGrade;

export interface Announcement {
    id: string;
    school_id: string;
    author_id: string;
    content: string;
    is_pinned: boolean;
    created_at: string;
}

export interface InviteCode {
    code: string;
    school_id: string;
    authority: AuthorityTier;
    created_by: string;
    used: boolean;
    created_at: string;
    expires_at?: string;
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
    start_date: string;
    end_date: string;
    is_current: boolean;
    created_at: string;
}
