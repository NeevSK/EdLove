import { UserRole } from '@repo/core';

export interface ProfileStats {
    classes_taught?: number;
    students_count?: number;
    assignments_graded?: number;
    attendance_streak?: number;
    assignments_completed?: number;
    assignments_count?: number;
    guru_points?: number;
}

export interface UserProfile extends ProfileStats {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    avatar_url?: string;
    is_anonymous?: boolean;
    profile_completed?: boolean;
    bio?: string;
    index_number?: string;
    nic_number?: string;
    school_id?: string;
    school_name?: string;
    is_thuthimal?: boolean;
    thuthimal_gifter?: string;
    thuthimal_gifted_at?: string;
    level?: number;
    phone?: string;
    created_at?: string;
    experience_years?: number;
    subjects_taught?: string | string[];
    qualifications?: string | string[];
}
