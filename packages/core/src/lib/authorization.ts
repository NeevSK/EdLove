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
import { identityAPI } from '../api/identity';
import { APIError } from '../api/types';
import { isDemo } from '../api/demo';

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
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
        throw new APIError('Not authenticated', 'UNAUTHENTICATED');
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
        throw new APIError('Unauthorized access to teacher data', 'FORBIDDEN');
    }

    return user;
}

/**
 * Verifies user can access the specified classroom
 * - Teachers can access classrooms they own
 * - Students can access classrooms they're enrolled in
 * - Principals can access all classrooms in their school
 * - Section heads can access classrooms in their section
 * 
 * @param classroomId - Classroom ID to verify access
 * @throws APIError if not authenticated or unauthorized
 * @returns Current user
 */
export async function requireClassroomAccess(classroomId: string) {
    const user = await requireAuth();

    // Get user role from metadata
    const userRole = user.user_metadata?.role || user.app_metadata?.role;

    // Bypass check for sample classrooms (demo/onboarding)
    if (classroomId.startsWith('sample-')) {
        return user;
    }

    // Check if user is the teacher of this classroom
    const { data: classroom, error } = await supabase
        .from('classrooms')
        .select('teacher_id, school_id, section_id, grade_id')
        .eq('id', classroomId)
        .single();

    if (error || !classroom) {
        throw new APIError('Classroom not found', 'NOT_FOUND');
    }

    // If user is the teacher, grant access
    if (classroom.teacher_id === user.id) {
        return user;
    }

    // For non-teacher roles, verify against the DB to ensure role/school_id are up to date
    const { data: userData } = await supabase
        .from('users')
        .select('role, school_id, section_id, grade_id')
        .eq('id', user.id)
        .single();

    if (!userData) {
        throw new APIError('User profile not found', 'NOT_FOUND');
    }

    const actualRole = userData.role;
    const actualSchoolId = userData.school_id;
    const actualSectionId = userData.section_id;
    const actualGradeId = userData.grade_id;

    // Administrative roles (Principals/Founders) have access to all classrooms in their school
    const ADMIN_ROLES = ['principal', 'founder', 'admin', 'developer'];
    if (ADMIN_ROLES.includes(actualRole)) {
        if (classroom.school_id === actualSchoolId) {
            return user;
        }
    }

    // Section heads have access to classrooms in their section
    if (actualRole === 'section_head') {
        if (classroom.section_id === actualSectionId) {
            return user;
        }
    }

    // Grade heads have access to classrooms in their grade
    if (actualRole === 'grade_head') {
        if (classroom.grade_id === actualGradeId) {
            return user;
        }
    }

    // Check if user is a student in this classroom
    const { data: enrollment } = await supabase
        .from('classroom_students')
        .select('id')
        .eq('classroom_id', classroomId)
        .eq('student_id', user.id)
        .single();

    if (!enrollment) {
        throw new APIError('Unauthorized access to classroom', 'FORBIDDEN');
    }

    return user;
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
export async function requireStudentAccess(studentId: string) {
    const user = await requireAuth();

    // Students can only access their own data
    if (user.id === studentId) {
        return user;
    }

    // Check if user is a teacher with access to this student using a single JOIN query
    // Authorization rule: Teachers can access students enrolled in their classrooms
    const { data: sharedClassroom } = await supabase
        .from('classroom_students')
        .select(`
            classroom_id,
            classrooms!inner(id, teacher_id)
        `)
        .eq('student_id', studentId)
        .eq('classrooms.teacher_id', user.id)
        .limit(1)
        .single();

    if (!sharedClassroom) {
        throw new APIError('Unauthorized access to student data', 'FORBIDDEN');
    }

    return user;
}

/**
 * Verifies user can access the specified school's data
 * Principals can access their own school
 * 
 * @param schoolId - School ID to verify access
 * @throws APIError if not authenticated or unauthorized
 * @returns Current user
 */
export async function requireSchoolAccess(schoolId: string) {
    const user = await requireAuth();

    // Live verification against the DB
    const { data: userData } = await supabase
        .from('users')
        .select('role, school_id')
        .eq('id', user.id)
        .single();

    if (!userData) {
        throw new APIError('User profile not found', 'NOT_FOUND');
    }

    const actualRole = userData.role;
    const actualSchoolId = userData.school_id;

    // Staff roles (Principal, Teacher, Grade Head, Section Head, etc.) can access their own school's data
    const STAFF_ROLES = ['principal', 'teacher', 'grade_head', 'section_head', 'founder', 'admin', 'developer'];

    if (STAFF_ROLES.includes(actualRole) && actualSchoolId === schoolId) {
        return user;
    }

    throw new APIError('Unauthorized access to school data', 'FORBIDDEN');
}

