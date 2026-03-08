/**
 * Attendance API
 * 
 * API methods for managing classroom attendance
 */

import { supabase, identityAPI } from '@repo/core';
import { APIError } from './types';
import type { AttendanceRecord } from './types';
import { requireClassroomAccess } from '../lib/authorization';
import { growthSignalsAPI } from './growthSignals';

export const attendanceAPI = {
    /**
     * Get attendance records for a classroom on a specific date
     */
    async getByDate(classroomId: string, date: string): Promise<AttendanceRecord[]> {
        // Verify authorization - user must have access to classroom
        await requireClassroomAccess(classroomId);

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
        // Verify authorization - teacher must have access to classroom
        await requireClassroomAccess(classroomId);

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

        // Growth signal: teacher was in school, actively managing their classroom
        // (Tier 1 Work Signal — the act of taking attendance IS presence)
        const myId = await identityAPI.getMyInternalId();
        if (myId) {
            void growthSignalsAPI.emitSignal(myId, 'attendance_recorded', {
                classroom_id: classroomId,
                date,
            }).catch(() => { });
        }

        return data;
    },

    /**
     * Batch update attendance records
     * IMPORTANT: All records must belong to the same classroom
     */
    async batchRecord(records: Array<{
        classroom_id: string;
        student_id: string;
        status: AttendanceRecord['status'];
        date: string;
    }>): Promise<AttendanceRecord[]> {
        if (records.length === 0) {
            return [];
        }

        // Validate first record exists and extract classroom_id
        const classroomId = records[0]?.classroom_id;
        if (!classroomId) {
            throw new APIError('No attendance records provided', 'INVALID_REQUEST');
        }

        // Validate all records belong to the same classroom
        const uniqueClassroomIds = new Set(records.map(r => r.classroom_id));
        if (uniqueClassroomIds.size > 1) {
            throw new APIError('All attendance records must belong to the same classroom', 'INVALID_REQUEST');
        }

        // Verify authorization for the classroom
        await requireClassroomAccess(classroomId);

        const { data, error } = await supabase
            .from('attendance')
            .upsert(records, {
                onConflict: 'classroom_id,student_id,date',
            })
            .select();

        if (error) {
            throw new APIError('Failed to batch record attendance', error.code, error);
        }

        // Growth signal: teacher was in school, taking attendance for their full class
        const myId = await identityAPI.getMyInternalId();
        if (myId) {
            void growthSignalsAPI.emitSignal(myId, 'attendance_recorded', {
                classroom_id: classroomId,
                record_count: records.length,
                date: records[0]?.date,
            }).catch(() => { });
        }

        return data || [];
    },

    /**
     * Get attendance history for a specific student in a classroom
     */
    async getForStudent(studentId: string, classroomId?: string): Promise<AttendanceRecord[]> {
        let query = supabase
            .from('attendance')
            .select('*')
            .eq('student_id', studentId);

        if (classroomId) {
            query = query.eq('classroom_id', classroomId);
        }

        const { data, error } = await query.order('date', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch student attendance history', error.code, error);
        }

        return data || [];
    },
};
