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

import { supabase } from '../lib/supabase';
import { APIError } from '../lib/api/types';

/**
 * Ensures user is authenticated
 * @throws APIError if not authenticated
 * @returns Current user
 */
export async function requireAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
        throw new APIError('Not authenticated', 'UNAUTHENTICATED');
    }
    
    return session.user;
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
    
    // Check if user is the teacher of this classroom
    const { data: classroom, error } = await supabase
        .from('classrooms')
        .select('teacher_id, school_id, section_id')
        .eq('id', classroomId)
        .single();
    
    if (error || !classroom) {
        throw new APIError('Classroom not found', 'NOT_FOUND');
    }
    
    // If user is the teacher, grant access
    if (classroom.teacher_id === user.id) {
        return user;
    }
    
    // Principals have access to all classrooms in their school
    if (userRole === 'principal') {
        const userSchoolId = user.user_metadata?.school_id || user.app_metadata?.school_id;
        if (classroom.school_id === userSchoolId) {
            return user;
        }
    }
    
    // Section heads have access to classrooms in their section
    if (userRole === 'section_head') {
        const userSectionId = user.user_metadata?.section_id || user.app_metadata?.section_id;
        if (classroom.section_id === userSectionId) {
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
