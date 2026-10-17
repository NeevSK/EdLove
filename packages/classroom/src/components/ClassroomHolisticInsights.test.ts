import type { StudentObservation } from '@repo/core/api/client';
import type { AttendanceRecord, StudentGrade } from '@repo/core/types';
import { describe, expect, it } from 'vitest';

describe('ClassroomHolisticInsights Calculation Engine', () => {
  function computeInsightsStats(data: {
    attendance: AttendanceRecord[];
    grades: StudentGrade[];
    observations: StudentObservation[];
  }) {
    const totalGrades = data.grades.length;
    const avgGpa =
      totalGrades > 0
        ? (data.grades.reduce((acc, g) => acc + (g.gpa || 0), 0) / totalGrades).toFixed(2)
        : '—';

    const positiveObs = data.observations.filter((o) => o.observation_type === 'positive').length;
    const growthObs = data.observations.filter((o) => o.observation_type === 'growth').length;
    const concernObs = data.observations.filter((o) => o.observation_type === 'concern').length;
    const neutralObs = data.observations.filter((o) => o.observation_type === 'neutral').length;

    const attendanceRate =
      data.attendance.length > 0
        ? Math.round(
            (data.attendance.filter((a) => a.status === 'present').length /
              data.attendance.length) *
              100,
          )
        : 0;

    return { avgGpa, positiveObs, growthObs, concernObs, neutralObs, attendanceRate };
  }

  it('gracefully returns em-dash for avgGpa when gradebook is empty or absent', () => {
    const stats = computeInsightsStats({
      attendance: [],
      grades: [],
      observations: [],
    });

    expect(stats.avgGpa).toBe('—');
    expect(stats.attendanceRate).toBe(0);
    expect(stats.positiveObs).toBe(0);
    expect(stats.growthObs).toBe(0);
  });

  it('calculates average GPA accurately when grades are present', () => {
    const stats = computeInsightsStats({
      attendance: [],
      grades: [
        { id: 'g1', student_id: 's1', gpa: 3.8 } as StudentGrade,
        { id: 'g2', student_id: 's2', gpa: 3.2 } as StudentGrade,
      ],
      observations: [],
    });

    expect(stats.avgGpa).toBe('3.50');
  });

  it('correctly classifies qualitative observations across positive, growth, concern, and neutral', () => {
    const observations: StudentObservation[] = [
      {
        id: 'obs_1',
        classroom_id: 'cls_1',
        classroom_student_id: 'cs_1',
        author_id: 't_1',
        content: 'Exceptional insight in physics lab',
        observation_type: 'positive',
        visibility: 'student_visible',
        is_finalized: true,
        honesty_declaration_accepted: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'obs_2',
        classroom_id: 'cls_1',
        classroom_student_id: 'cs_2',
        author_id: 't_1',
        content: 'Showing great curiosity, developing math confidence',
        observation_type: 'growth',
        visibility: 'student_visible',
        is_finalized: true,
        honesty_declaration_accepted: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'obs_3',
        classroom_id: 'cls_1',
        classroom_student_id: 'cs_3',
        author_id: 't_1',
        content: 'Struggling with attention in third period',
        observation_type: 'concern',
        visibility: 'private',
        is_finalized: true,
        honesty_declaration_accepted: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'obs_4',
        classroom_id: 'cls_1',
        classroom_student_id: 'cs_4',
        author_id: 't_1',
        content: 'Routine seating adjustment',
        observation_type: 'neutral',
        visibility: 'handover_visible',
        is_finalized: true,
        honesty_declaration_accepted: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const stats = computeInsightsStats({
      attendance: [],
      grades: [],
      observations,
    });

    expect(stats.positiveObs).toBe(1);
    expect(stats.growthObs).toBe(1);
    expect(stats.concernObs).toBe(1);
    expect(stats.neutralObs).toBe(1);
  });

  it('calculates rounded attendance percentage accurately', () => {
    const attendance = [
      { id: 'a1', status: 'present' },
      { id: 'a2', status: 'present' },
      { id: 'a3', status: 'absent' },
    ] as AttendanceRecord[];

    const stats = computeInsightsStats({
      attendance,
      grades: [],
      observations: [],
    });

    // 2/3 = 66.666% -> 67%
    expect(stats.attendanceRate).toBe(67);
  });
});
