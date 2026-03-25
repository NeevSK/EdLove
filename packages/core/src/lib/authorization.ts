/**
 * AUTHORIZATION UTILITIES
 * 
 * Functions to verify user permissions before accessing resources.
 * Prevents unauthorized data access vulnerabilities.
 * 
 * Usage:
 * - Call requireAuth() to ensure user is logged in
 * - Call requireTeacherAccess() to verify teacher owns the resource
 * - Call requireClassroomAccess() to verify user can access classroom
 * - Call requireStudentAccess() to verify user can access student data
 */

import { supabase } from './supabase';
import { authAPI } from '../api/auth';
import { identityAPI } from '../api/identity';
import { APIError } from '../api/types';
import { isDemo } from '../api/demo';
import { can, getPlatformAccessContext, requireCapability } from './capabilities';
import type { CapabilityKey, CapabilityResource } from '../types/Policy';

interface AccessProfile {
    id: string;
    role: string | null;
    school_id: string | null;
    section_id?: string | null;
    grade_id?: string | null;
    tenant_kind?: string | null;
    platform_roles?: string[] | null;
    school_role?: string | null;
    work_roles?: string[] | null;
}

async function loadAccessProfile(userId: string): Promise<AccessProfile> {
    const { data: userData } = await supabase
        .from('users')
        .select('id, role, school_id, section_id, grade_id, tenant_kind, platform_roles, school_role, work_roles')
        .eq('id', userId)
        .single();

    if (!userData) {
        throw new APIError('User profile not found', 'NOT_FOUND');
    }

    return userData as AccessProfile;
}

function buildAccessContext(profile: AccessProfile) {
    return getPlatformAccessContext(profile as any, {
        tenantKind: (profile.tenant_kind as any) ?? null,
    });
}

/**
 * Ensures user is authenticated
 * @throws APIError if not authenticated
 * @returns Current user
 */
export async function requireAuth() {
    // Demo Mode Bypass: Return a mock user if demo mode is active
    if (isDemo()) {
        return {
            id: 'u-demo',
            email: 'demo@gurudevi.org',
            user_metadata: {
                role: 'teacher',
                full_name: 'Teacher Demo',
                school_id: 'mock-school'
            },
            app_metadata: {
                role: 'teacher'
            }
        } as any;
    }

    // getSession() here is correct: used only to verify a session exists and extract
    // session.user.email for the returned object. The actual user ID is resolved below
    // via identityAPI.getMyInternalId() (internal users.id, not session.user.id).
    const session = await authAPI.getSession();
    if (!session) {
        throw new APIError('Not authenticated', 'UNAUTHENTICATED');
    }
    // Wanderers (anonymous sessions) are allowed to browse, but must upgrade to perform
    // any authenticated/citizen action that calls requireAuth().
    if ((session.user as any)?.is_anonymous === true || !session.user.email) {
        throw new APIError('Account upgrade required', 'ACCOUNT_REQUIRED');
    }

    const internalId = await identityAPI.getMyInternalId();
    if (!internalId) {
        throw new APIError('Identity resolution failed', 'UNAUTHENTICATED');
    }

    // Return a minimal user-like object with the internal ID.
    // NOTE: `supabase_auth_uid` is the raw Supabase auth UUID — kept only for reference/logging.
    //       All application logic must use `id` (the internal users.id).
    return {
        id: internalId,
        email: session.user.email,
        supabase_auth_uid: session.user.id,
    } as any;
}

/**
 * Verifies user is the specified teacher
 * @param teacherId - Teacher ID to verify against
 * @throws APIError if not authenticated or not the teacher
 * @returns Current user
 */
export async function requireTeacherAccess(teacherId: string) {
    const user = await requireAuth();

    if (user.id !== teacherId) {
        const actor = await loadAccessProfile(user.id);
        const context = buildAccessContext(actor);
        if (!context.hasGlobalAccess) {
            throw new APIError('Unauthorized access to teacher data', 'FORBIDDEN');
        }
    }

    return user;
}

/**
 * Verifies user can access the specified classroom
 * - Teachers can access classrooms they own
 * - Students can access classrooms they're enrolled in
 * - Principals can access all classrooms in their school

/**
 * Verifies user can access the specified classroom.
 */
export async function requireClassroomAccess(
    classroomId: string,
    capability: CapabilityKey = 'classroom.read.assigned',
) {
    const user = await requireAuth();

    // Bypass check for sample classrooms (demo/onboarding)
    if (classroomId.startsWith('sample-')) {
        return user;
    }

    const { data: classroom, error } = await supabase
        .from('classrooms')
        .select('teacher_id, school_id, section_id, grade_id')
        .eq('id', classroomId)
        .single();

    if (error || !classroom) {
        throw new APIError('Classroom not found', 'NOT_FOUND');
    }

    const actor = await loadAccessProfile(user.id);
    const context = buildAccessContext(actor);
    const resource: CapabilityResource = {
        schoolId: classroom.school_id,
        sectionId: classroom.section_id,
        gradeId: classroom.grade_id,
        classroomId,
        ownerUserId: classroom.teacher_id,
        scope: {
            type: 'classroom',
            id: classroomId,
            schoolId: classroom.school_id,
        },
    };

    // Use consolidated logic
    const decision = can(capability, context, resource);
    if (!decision.allowed) {
        throw new APIError(decision.reason || 'Unauthorized access to classroom', 'FORBIDDEN');
    }

    return user;

    throw new APIError(decision.reason || 'Unauthorized access to classroom', 'FORBIDDEN');
}

/**
 * Verifies user can access the specified student's data
 * Students can only access their own data
 * Teachers can access students in their classrooms
 * 
 * @param studentId - Student ID to verify access
 * @throws APIError if not authenticated or unauthorized
 * @returns Current user
 */
/**
 * Verifies user can access the specified student's data.
 */
export async function requireStudentAccess(
    studentId: string,
    capability: CapabilityKey = 'student.record.read.self',
) {
    const user = await requireAuth();
    
    const { data: studentUser } = await supabase
        .from('users')
        .select('id, school_id')
        .eq('id', studentId)
        .single();

    if (!studentUser) {
        throw new APIError('Student not found', 'NOT_FOUND');
    }

    const actor = await loadAccessProfile(user.id);
    const context = buildAccessContext(actor);
    const resource: CapabilityResource = {
        schoolId: studentUser.school_id,
        ownerUserId: studentId,
        studentId,
        scope: {
            type: 'student',
            id: studentId,
            schoolId: studentUser.school_id,
        },
    };

    // Use consolidated logic
    const decision = can(capability, context, resource);
    if (!decision.allowed) {
        throw new APIError(decision.reason || 'Unauthorized access to student data', 'FORBIDDEN');
    }

    return user;

    throw new APIError(decision.reason || 'Unauthorized access to student data', 'FORBIDDEN');
}

/**
 * Verifies user can access the specified school's data
 * Principals can access their own school
 * 
 * @param schoolId - School ID to verify access
 * @throws APIError if not authenticated or unauthorized
 * @returns Current user
 */
export async function requireSchoolAccess(
    schoolId: string,
    capability: CapabilityKey = 'school.read',
) {
    const user = await requireAuth();
    const actor = await loadAccessProfile(user.id);
    const context = buildAccessContext(actor);
    requireCapability(capability, context, {
        schoolId,
        scope: { type: 'school', id: schoolId, schoolId },
    });
    return user;
}

