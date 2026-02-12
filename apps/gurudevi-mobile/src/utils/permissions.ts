/**
 * Permission Utilities
 * Role-based permission checks for Gurudevi features
 */

import { User, UserRole } from '../types/User';

/**
 * Check if user can create lessons
 * Only teachers can create lessons
 */
export function canCreateLesson(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'teacher';
}

/**
 * Check if user can post announcements
 * Principals and teachers can post announcements
 */
export function canPostAnnouncement(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'principal' || user.role === 'teacher';
}

/**
 * Check if user can view all school data
 * Only principals can view all school data
 */
export function canViewAllSchoolData(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'principal';
}

/**
 * Check if user can manage students
 * Teachers and principals can manage students
 */
export function canManageStudents(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'teacher' || user.role === 'principal';
}

/**
 * Check if user can submit assignments
 * Only students can submit assignments
 */
export function canSubmitAssignments(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'student';
}

/**
 * Check if user can upload resources to library
 * Teachers and principals can upload resources
 */
export function canUploadResources(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'teacher' || user.role === 'principal';
}

/**
 * Check if user has access to premium features
 * This will be expanded when pricing tiers are fully implemented
 */
export function hasPremiumAccess(user: User | null): boolean {
    if (!user) return false;
    // For v0.1, all users have access
    // In future, check user.subscription_tier
    return true;
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: UserRole, language: 'si' | 'ta' | 'en' = 'en'): string {
    const roleNames = {
        teacher: {
            si: 'ගුරුවරයා',
            ta: 'ஆசிரியர்',
            en: 'Teacher'
        },
        student: {
            si: 'ශිෂ්‍යයා',
            ta: 'மாணவர்',
            en: 'Student'
        },
        principal: {
            si: 'විදුහල්පතිවරයා',
            ta: 'அதிபர்',
            en: 'Principal'
        },
        section_head: {
            si: 'අංශ ප්‍රධානී',
            ta: 'பிரிவு தலைவர்',
            en: 'Section Head'
        },
        grade_head: {
            si: 'ශ්‍රේණි ප්‍රධානී',
            ta: 'வகுப்பு தலைவர்',
            en: 'Grade Head'
        },
        developer: {
            si: 'සංවර්ධක',
            ta: 'உருவாக்குபவர்',
            en: 'Developer'
        },
        admin: {
            si: 'පරිපාලක',
            ta: 'நிர்வாகி',
            en: 'Admin'
        },
        founder: {
            si: 'නිර්මාතෘ',
            ta: 'நிறுவனர்',
            en: 'Founder'
        }
    };

    return roleNames[role][language];
}
