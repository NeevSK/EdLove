import { selectGuardianVisibleGrades } from '../gradeVisibility';

describe('guardian grade visibility', () => {
  test('keeps only published grades when publication metadata is present', () => {
    const grades = [
      {
        id: 'grade-1',
        grade: 'A',
        published_at: '2026-03-27T08:00:00.000Z',
      },
      {
        id: 'grade-2',
        grade: 'B',
        status: 'draft',
      },
      {
        id: 'grade-3',
        grade: 'A-',
        is_published: true,
      },
      {
        id: 'grade-4',
        grade: 'C+',
        publication_status: 'released',
      },
    ];

    expect(selectGuardianVisibleGrades(grades)).toEqual([grades[0], grades[2], grades[3]]);
  });

  test('falls back to legacy recent-grade behavior when publication metadata is absent', () => {
    const grades = [
      {
        id: 'grade-1',
        grade: 'A',
        created_at: '2026-03-27T08:00:00.000Z',
      },
      {
        id: 'grade-2',
        grade: 'B+',
        created_at: '2026-03-25T08:00:00.000Z',
      },
    ];

    expect(selectGuardianVisibleGrades(grades)).toEqual(grades);
  });
});
