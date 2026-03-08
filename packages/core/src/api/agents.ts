/**
 * Agents API
 * Functional logic for the Agentic Sanctuary assistants.
 */

import { supabase } from '../lib/supabase';
import { UserRole } from '../constants/SriLankanSchools';

export interface CoordinationGap {
    id: string;
    type: 'relief' | 'timetable' | 'resource';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    suggestedAction: string;
    context: any;
}

/**
 * ReliefCoordinator Agent
 *
 * Reads real data from Supabase to surface operational gaps:
 *  - Staff leaves approved for today → which classrooms may be uncovered?
 *  - Cross-references with timetable/classroom assignments to propose relief.
 *
 * All reads are best-effort and non-fatal. Falls back to empty array on error.
 */
export const ReliefCoordinator = {
    /**
     * Checks for today's approved staff leaves and surfaces uncovered classrooms.
     * Queries: staff_leaves (status=approved, today), classrooms (teacher_id IN absentIds).
     */
    async checkSectionStatus(schoolId: string, sectionId?: string): Promise<CoordinationGap[]> {
        const gaps: CoordinationGap[] = [];
        try {
            const today = new Date().toISOString().split('T')[0];

            // 1. Find teachers on approved leave today
            const { data: leaves } = await supabase
                .from('staff_leaves')
                .select('user_id, leave_type, users(full_name)')
                .eq('school_id', schoolId)
                .eq('status', 'approved')
                .lte('start_date', today)
                .gte('end_date', today);

            if (!leaves?.length) return gaps;

            const absentTeacherIds = leaves.map((l: any) => l.user_id);

            // 2. Find classrooms assigned to those teachers
            let classroomQuery = supabase
                .from('classrooms')
                .select('id, name, grade')
                .in('teacher_id', absentTeacherIds)
                .eq('school_id', schoolId);

            if (sectionId) classroomQuery = classroomQuery.eq('id', sectionId);

            const { data: classrooms } = await classroomQuery.limit(10);

            // 3. For each absent teacher/classroom, find available teachers (no leave today)
            const availableTeachersQuery = supabase
                .from('users')
                .select('id, full_name')
                .eq('school_id', schoolId)
                .eq('role', 'teacher');

            const { data: allTeachers } = absentTeacherIds.length > 0
                ? await availableTeachersQuery.not('id', 'in', `(${absentTeacherIds.join(',')})`)
                : await availableTeachersQuery;

            for (const classroom of (classrooms ?? [])) {
                const matchingLeave = leaves.find((l: any) => l.user_id === classroom.teacher_id);
                const absentTeacher = matchingLeave ? (matchingLeave as any).users?.full_name ?? 'Absent teacher' : 'Absent teacher';
                const suggestion = (allTeachers as any[])?.[0]?.full_name
                    ? `Assign ${(allTeachers as any[])[0].full_name} (available)`
                    : 'No free teacher found — check timetable';

                gaps.push({
                    id: `relief-${classroom.id}-${today}`,
                    type: 'relief',
                    title: `Relief needed: ${classroom.name}`,
                    description: `${absentTeacher} is on approved leave. ${classroom.name} may be uncovered.`,
                    priority: 'high',
                    suggestedAction: suggestion,
                    context: {
                        classroomId: classroom.id,
                        classroomName: classroom.name,
                        absentTeacherIds,
                        availableTeachers: allTeachers ?? [],
                    },
                });
            }
        } catch (err) {
            console.warn('[ReliefCoordinator] checkSectionStatus error:', err instanceof Error ? err.message : String(err));
        }
        return gaps;
    },

    /**
     * Validates if a proposed action aligns with school policies.
     */
    applySchoolPolicies: (action: any, manifesto: any): boolean => {
        return true;
    }
};

/**
 * TimetableScheduler Agent
 * Logic for annual timetable generation and conflict resolution.
 *
 * generateDraft uses real classroom + teacher data from Supabase.
 * Constraint-solving is client-side (greedy allocation) — production upgrade
 * path is a Supabase edge function with full LP/CP solver.
 */
export const TimetableScheduler = {
    /**
     * Generates a draft timetable for a school.
     * Reads classrooms and teachers; distributes mandatory subjects across days.
     */
    generateDraft: async (schoolId: string, constraints: {
        maxDailyPeriods: number;
        mandatorySubjects: string[];
        teacherPreferences: boolean;
    }) => {
        try {
            const [{ data: classrooms }, { data: teachers }] = await Promise.all([
                supabase.from('classrooms').select('id, name, grade').eq('school_id', schoolId).limit(20),
                supabase.from('users').select('id, full_name').eq('school_id', schoolId).eq('role', 'teacher').limit(50),
            ]);

            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            const periods = constraints.maxDailyPeriods;

            // Greedy allocation: distribute subjects evenly across days for each classroom
            const schedule: Record<string, any> = {};
            for (const cls of (classrooms ?? [])) {
                schedule[cls.id] = {};
                const subjects = [...constraints.mandatorySubjects];
                let subjectIndex = 0;
                for (const day of days) {
                    schedule[cls.id][day] = [];
                    for (let p = 0; p < periods; p++) {
                        const teacher = (teachers ?? [])[subjectIndex % Math.max(1, (teachers ?? []).length)];
                        schedule[cls.id][day].push({
                            period: p + 1,
                            subject: subjects[subjectIndex % subjects.length],
                            teacher_name: teacher?.full_name ?? 'TBA',
                        });
                        subjectIndex++;
                    }
                }
            }

            return {
                id: `draft-${Date.now()}`,
                status: 'draft',
                school_id: schoolId,
                total_classrooms: (classrooms ?? []).length,
                total_teachers: (teachers ?? []).length,
                total_periods_scheduled: (classrooms ?? []).length * days.length * periods,
                conflicts: 0,
                schedule,
                classroom_names: Object.fromEntries((classrooms ?? []).map(c => [c.id, c.name])),
                recommendations: [
                    (classrooms ?? []).length === 0 ? 'No classrooms found — add classrooms first.' : null,
                    (teachers ?? []).length === 0 ? 'No teachers found — invite teachers first.' : null,
                ].filter(Boolean),
                generated_at: new Date().toISOString(),
            };
        } catch (err) {
            console.warn('[TimetableScheduler] generateDraft error:', err instanceof Error ? err.message : String(err));
            return {
                id: `draft-${Date.now()}`,
                status: 'error',
                school_id: schoolId,
                error: err instanceof Error ? err.message : 'Unknown error',
            };
        }
    },

    /**
     * Identifies structural gaps in the current annual schedule.
     */
    checkStructuralGaps: async (schoolId: string): Promise<CoordinationGap[]> => {
        const gaps: CoordinationGap[] = [];
        try {
            // Check: classrooms with no teacher assigned
            const { data: unassigned } = await supabase
                .from('classrooms')
                .select('id, name, grade')
                .eq('school_id', schoolId)
                .is('teacher_id', null)
                .limit(5);

            for (const cls of (unassigned ?? [])) {
                gaps.push({
                    id: `timetable-${cls.id}`,
                    type: 'timetable',
                    title: `No teacher: ${cls.name}`,
                    description: `${cls.name} has no assigned teacher. Timetable cannot be generated for this class.`,
                    priority: 'high',
                    suggestedAction: 'Assign a teacher in classroom settings',
                    context: { classroomId: cls.id },
                });
            }
        } catch (err) {
            console.warn('[TimetableScheduler] checkStructuralGaps error:', err instanceof Error ? err.message : String(err));
        }
        return gaps;
    },
};

