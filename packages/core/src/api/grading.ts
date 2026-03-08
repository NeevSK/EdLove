import { supabase } from '../lib/supabase';
import { identityAPI } from './identity';
import { APIError } from './types';
import { StudentGrade, ClassroomGradingSettings } from '../types/Grade';
import { marksToGPA } from '../lib/grading';
import {
    requireAuth,
    requireClassroomAccess,
    requireStudentAccess
} from '../lib/authorization';
import { growthSignalsAPI } from './growthSignals';
import { impactRipplesAPI } from './impactRipples';

// ============================================================================
// GRADING API
// ============================================================================

export const gradingAPI = {
    /**
     * Submit or update a grade for a student
     */
    async submitGrade(
        studentId: string,
        classroomId: string,
        marks: number,
        assignmentId?: string,
        feedback?: string
    ): Promise<StudentGrade> {
        // Verify authorization - teacher must have access to classroom
        await requireClassroomAccess(classroomId);

        const { grade, gpa } = marksToGPA(marks);

        const gradeData = {
            student_id: studentId,
            classroom_id: classroomId,
            assignment_id: assignmentId,
            marks,
            grade,
            gpa,
            feedback,
            graded_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('grades')
            .upsert(gradeData)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to submit grade', error.code, error);
        }

        // Growth signal: teacher nourished a student by reviewing their work
        // (Tier 1 Work Signal — grading IS an act of care and presence)
        const myId = await identityAPI.getMyInternalId();
        if (myId) {
            void growthSignalsAPI.emitSignal(myId, 'assignment_graded', {
                classroom_id: classroomId,
                has_feedback: !!feedback && feedback.length > 0,
            }).catch(() => { });

            // If the teacher wrote substantive written feedback, create an Impact Ripple
            // for the student — "your teacher thought carefully about your work"
            if (feedback && feedback.length > 20 && studentId) {
                void impactRipplesAPI.createRipple({
                    recipientUserId: studentId,
                    actorUserId: myId,
                    rippleType: 'feedback_given',
                    sourceEntityType: 'lesson',
                    sourceEntityId: assignmentId,
                }).catch(() => { });
            }
        }

        return data;
    },

    /**
     * Get all grades for a student
     */
    async getReportCard(studentId: string): Promise<StudentGrade[]> {
        // Verify authorization - user must have access to student data
        await requireStudentAccess(studentId);

        const { data, error } = await supabase
            .from('grades')
            .select('*')
            .eq('student_id', studentId)
            .order('graded_at', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch report card', error.code, error);
        }

        return data || [];
    },

    /**
     * Get all grades for a classroom
     */
    async getClassroomGrades(classroomId: string): Promise<StudentGrade[]> {
        // Verify authorization - user must have access to classroom
        await requireClassroomAccess(classroomId);

        const { data, error } = await supabase
            .from('grades')
            .select('*')
            .eq('classroom_id', classroomId)
            .order('marks', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch classroom grades', error.code, error);
        }

        return data || [];
    },

    /**
     * Get grading settings for a classroom
     */
    async getGradingSettings(classroomId: string): Promise<ClassroomGradingSettings> {
        // Verify authorization - user must have access to classroom
        await requireClassroomAccess(classroomId);

        const { data, error } = await supabase
            .from('classroom_grading_settings')
            .select('*')
            .eq('classroom_id', classroomId)
            .single();

        if (error) {
            // Return default settings if none exist
            if (error.code === 'PGRST116') {
                return {
                    classroom_id: classroomId,
                    grading_mode: 'both',
                    show_ranks: true,
                };
            }
            throw new APIError('Failed to fetch grading settings', error.code, error);
        }

        return data;
    },

    /**
     * Update grading settings for a classroom
     */
    async updateGradingSettings(
        classroomId: string,
        settings: Omit<ClassroomGradingSettings, 'classroom_id'>
    ): Promise<ClassroomGradingSettings> {
        // Verify authorization - teacher must have access to classroom
        await requireClassroomAccess(classroomId);

        const { data, error } = await supabase
            .from('classroom_grading_settings')
            .upsert({
                classroom_id: classroomId,
                ...settings,
            })
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to update grading settings', error.code, error);
        }

        return data;
    },

    /**
     * Delete a grade
     */
    async deleteGrade(gradeId: string): Promise<void> {
        // Verify user has permission to delete grades (is authenticated)
        const user = await requireAuth();

        // First get the grade to check classroom access
        const { data: grade, error: fetchError } = await supabase
            .from('grades')
            .select('classroom_id')
            .eq('id', gradeId)
            .single();

        // Check authorization before revealing if grade exists
        // This prevents information leakage about grade existence
        if (fetchError || !grade) {
            // Verify user has general classroom access before returning NOT_FOUND
            // If they don't have access, return FORBIDDEN instead of NOT_FOUND
            // This prevents unauthorized users from discovering which grade IDs exist
            throw new APIError('Grade not found or access denied', 'NOT_FOUND');
        }

        // Verify authorization - teacher must have access to classroom
        await requireClassroomAccess(grade.classroom_id);

        const { error } = await supabase
            .from('grades')
            .delete()
            .eq('id', gradeId);

        if (error) {
            throw new APIError('Failed to delete grade', error.code, error);
        }
    },
};
