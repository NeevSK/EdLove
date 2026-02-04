/**
 * Attendance API
 * 
 * API methods for managing classroom attendance
 */

import { supabase } from '../supabase';
import { APIError } from './errors';
import type { AttendanceRecord } from './types';

export const attendanceAPI = {
    /**
     * Get attendance records for a classroom on a specific date
     */
    async getByDate(classroomId: string, date: string): Promise<AttendanceRecord[]> {
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('classroom_id', classroomId)
            .eq('date', date);

        if (error) {
            throw new APIError('Failed to fetch attendance', error.code, error);
        }

        return data || [];
    },

    /**
     * Record attendance for a student
     */
    async record(
        classroomId: string,
        studentId: string,
        status: AttendanceRecord['status'],
        date: string
    ): Promise<AttendanceRecord> {
        const { data, error } = await supabase
            .from('attendance')
            .upsert(
                {
                    classroom_id: classroomId,
                    student_id: studentId,
                    status,
                    date,
                },
                {
                    onConflict: 'classroom_id,student_id,date',
                }
            )
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to record attendance', error.code, error);
        }

        return data;
    },

    /**
     * Batch update attendance records
     */
    async batchRecord(records: Array<{
        classroom_id: string;
        student_id: string;
        status: AttendanceRecord['status'];
        date: string;
    }>): Promise<AttendanceRecord[]> {
        const { data, error } = await supabase
            .from('attendance')
            .upsert(records, {
                onConflict: 'classroom_id,student_id,date',
            })
            .select();

        if (error) {
            throw new APIError('Failed to batch record attendance', error.code, error);
        }

        return data || [];
    },
};
