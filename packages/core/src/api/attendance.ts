import { operationsContract } from './operations.contract';
import type { AttendanceRecord } from './types';
import type { AttendanceReport, AttendanceSnapshot, SchoolAttendancePulse } from './schemas/attendance.schema';
import { educationalServices } from '../domains/educational/runtime';
import { attendanceProjectionServices } from '../domains/attendanceProjection/runtime';
import { supabase } from '../lib/supabase';

type AttendanceAuditContext = {
    actorId?: string;
    reason?: string;
    accessKind?: 'teacher_marking' | 'institutional_read' | 'institutional_export';
};

const buildAttendanceKey = (classroomId: string, studentId: string, date: string) => `${classroomId}:${studentId}:${date}`;

const logAttendanceAudit = async ({
    action,
    entityId,
    executorId,
    metadata,
}: {
    action: string;
    entityId: string;
    executorId?: string;
    metadata?: Record<string, unknown>;
}) => {
    if (!executorId) return;

    const { error } = await supabase.from('audit_logs').insert({
        action,
        entity_id: entityId,
        target_id: entityId,
        entity_type: 'attendance',
        executor_id: executorId,
        metadata: metadata ?? {},
    });

    if (error) {
        console.warn('Failed to record attendance audit event', error);
    }
};

const getExistingAttendanceMap = async (
    records: Array<{
        classroom_id: string;
        student_id: string;
        date: string;
    }) => {
    const existingEntries = await Promise.all(
        records.map(async (record) => {
            const existing = await educationalServices.attendance.getByDate(record.classroom_id, record.date);
            const matched = (existing as unknown as AttendanceRecord[]).find(
                (entry) => entry.student_id === record.student_id
            );

            return [buildAttendanceKey(record.classroom_id, record.student_id, record.date), matched] as const;
        })
    );

    return new Map(existingEntries);
};

/**
 * API methods for Managing Classroom Attendance.
 * Following Protocol-Oriented Authority.
 */
export const attendanceAPI = {
    /**
     * Get attendance records for a classroom on a specific date
     * @authority read Attendance
     * @deprecated Prefer getClassroomAttendanceSnapshot for temporal reads.
     */
    async getByDate(classroomId: string, date: string): Promise<AttendanceRecord[]> {
        const snapshot = await attendanceAPI.getClassroomAttendanceSnapshot(classroomId, date);
        return snapshot.records;
    },

    /**
     * Record attendance for a student
     * @authority create Attendance
     */
    async record(
        classroomId: string,
        studentId: string,
        status: string,
        date: string,
        audit?: AttendanceAuditContext
    ): Promise<AttendanceRecord> {
        const existing = audit?.actorId
            ? ((await educationalServices.attendance.getByDate(classroomId, date)) as unknown as AttendanceRecord[]).find(
                  (entry) => entry.student_id === studentId
              )
            : null;

        const result = (await educationalServices.attendance.record(
            classroomId,
            studentId,
            status,
            date
        )) as unknown as AttendanceRecord;

        await logAttendanceAudit({
            action:
                existing && existing.status !== status
                    ? 'attendance_overridden'
                    : 'attendance_recorded',
            entityId: result.id,
            executorId: audit?.actorId,
            metadata: {
                classroomId,
                studentId,
                date,
                previousStatus: existing?.status ?? null,
                nextStatus: status,
                reason: audit?.reason ?? null,
                accessKind: audit?.accessKind ?? 'teacher_marking',
            },
        });

        return result;
    },

    /**
     * Batch update attendance records
     * @authority create Attendance
     */
    async batchRecord(records: Array<{
        classroom_id: string;
        student_id: string;
        status: string;
        date: string;
    }>, audit?: AttendanceAuditContext): Promise<AttendanceRecord[]> {
        const existingMap = audit?.actorId ? await getExistingAttendanceMap(records) : new Map<string, AttendanceRecord | undefined>();
        const result = (await educationalServices.attendance.batchRecord(records)) as unknown as AttendanceRecord[];

        if (audit?.actorId) {
            const createdCount = result.filter((entry) => {
                const existing = existingMap.get(buildAttendanceKey(entry.classroom_id, entry.student_id, entry.date));
                return !existing;
            }).length;

            const overriddenRecords = result.filter((entry) => {
                const existing = existingMap.get(buildAttendanceKey(entry.classroom_id, entry.student_id, entry.date));
                return !!existing && existing.status !== entry.status;
            });

            await logAttendanceAudit({
                action: 'attendance_batch_recorded',
                entityId: records[0]?.classroom_id ?? 'attendance-batch',
                executorId: audit.actorId,
                metadata: {
                    classroomIds: Array.from(new Set(records.map((record) => record.classroom_id))),
                    dates: Array.from(new Set(records.map((record) => record.date))),
                    count: records.length,
                    createdCount,
                    overriddenCount: overriddenRecords.length,
                    reason: audit.reason ?? null,
                    accessKind: audit.accessKind ?? 'teacher_marking',
                },
            });

            await Promise.all(
                overriddenRecords.map((entry) =                    logAttendanceAudit({
                        action: 'attendance_overridden',
                        entityId: entry.id,
                        executorId: audit.actorId,
                        metadata: {
                            classroomId: entry.classroom_id,
                            studentId: entry.student_id,
                            date: entry.date,
                            previousStatus:
                                existingMap.get(buildAttendanceKey(entry.classroom_id, entry.student_id, entry.date))
                                    ?.status ?? null,
                            nextStatus: entry.status,
                            reason: audit.reason ?? null,
                            accessKind: audit.accessKind ?? 'teacher_marking',
                        },
                    })
                )
            );
        }

        return result;
    },

    /**
     * Get attendance history for a specific student
     * @authority read Attendance
     * @deprecated Prefer getStudentAttendanceTimeline for temporal reads.
     */
    async getForStudent(studentId: string, classroomId?: string): Promise<AttendanceRecord[]> {
        return attendanceAPI.getStudentAttendanceTimeline(studentId, { classroomId });
    },

    /**
     * Get the classroom attendance snapshot for a specific view date.
     * @authority read Attendance
     */
    async getClassroomAttendanceSnapshot(classroomId: string, viewDate: string): Promise<AttendanceSnapshot> {
        const records = await educationalServices.attendance.getByDate(classroomId, viewDate);
        return {
            classroomId,
            viewDate,
            records: records as unknown as AttendanceRecord[],
        };
    },

    /**
     * Get the attendance timeline for a student, optionally windowed by date range.
     * @authority read Attendance
     */
    async getStudentAttendanceTimeline(
        studentId: string,
        options?: {
            classroomId?: string;
            fromDate?: string;
            toDate?: string;
        }
    ): Promise<AttendanceRecord[]> {
        const records = (await educationalServices.attendance.getForStudent(
            studentId,
            options?.classroomId
        )) as unknown as AttendanceRecord[];

        return records.filter((record) => {
            if (options?.fromDate && record.date < options.fromDate) return false;
            if (options?.toDate && record.date > options.toDate) return false;
            return true;
        });
    },

    /**
     * Get the institutional attendance pulse for a school or specific classroom.
     * @authority read Attendance
     */
    async getSchoolAttendancePulse(
        schoolId: string,
        classroomId?: string,
        viewDate?: string,
        audit?: AttendanceAuditContext
    ): Promise<SchoolAttendancePulse> {
        const pulse = await attendanceProjectionServices.getSchoolAttendancePulse(schoolId, classroomId, viewDate);

        await logAttendanceAudit({
            action: 'attendance_institutional_read',
            entityId: classroomId ?? schoolId,
            executorId: audit?.actorId,
            metadata: {
                schoolId,
                classroomId: classroomId ?? null,
                viewDate: viewDate ?? null,
                route: 'school_attendance_pulse',
                reason: audit?.reason ?? null,
                accessKind: audit?.accessKind ?? 'institutional_read',
            },
        });

        return pulse;
    },

    /**
     * Get the attendance report for a school or classroom over a date range.
     * @authority read Attendance
     */
    async getAttendanceReport(
        schoolId: string,
        startDate: string,
        endDate: string,
        classroomId?: string,
        audit?: AttendanceAuditContext
    ): Promise<AttendanceReport> {
        const report = await attendanceProjectionServices.getAttendanceReport(
            schoolId,
            startDate,
            endDate,
            classroomId
        );

        await logAttendanceAudit({
            action: 'attendance_report_read',
            entityId: classroomId ?? schoolId,
            executorId: audit?.actorId,
            metadata: {
                schoolId,
                classroomId: classroomId ?? null,
                startDate,
                endDate,
                reason: audit?.reason ?? null,
                accessKind: audit?.accessKind ?? 'institutional_export',
            },
        });

        return report;
    },
};

// Satisfy linter for POA metadata linking
void operationsContract;
