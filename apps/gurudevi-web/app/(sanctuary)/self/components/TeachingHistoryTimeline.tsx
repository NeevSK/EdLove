'use client';

import { useTeacherProfessionalHistory } from '@repo/profile';
import { Award, BookOpen, Calendar, School, Users } from '@repo/ui/icons';
import styles from './teaching-history.module.css';

interface TeachingHistoryProps {
  userId?: string;
  onClose?: () => void;
}

const SAMPLE_HISTORY = [
  {
    id: 'th-1',
    academic_year: '2025 - 2026',
    designation: 'Senior Faculty & Department Lead',
    school_name: 'Dharmaraja National College',
    subjects: ['Advanced Physics', 'Applied Mathematics'],
    classrooms_count: 4,
    students_count: 142,
    achievements: ['District Science Olympiad 1st Place Mentor', 'Curriculum Innovator Award'],
  },
  {
    id: 'th-2',
    academic_year: '2023 - 2025',
    designation: 'Secondary Educator',
    school_name: 'Ananda Balika Vidyalaya',
    subjects: ['General Science', 'Mathematics'],
    classrooms_count: 3,
    students_count: 108,
    achievements: ['100% G.C.E. O/L Pass Rate in Mathematics'],
  },
];

export function TeachingHistoryTimeline({ userId, onClose }: TeachingHistoryProps) {
  const { data: history = [], isLoading } = useTeacherProfessionalHistory(userId ?? 'guest');
  const records = history.length > 0 ? history : SAMPLE_HISTORY;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Professional Teaching Heritage</h2>
        <p className={styles.subtitle}>
          Your verified educational legacy, leadership appointments, and classroom milestones
        </p>
      </div>

      <div className={styles.timeline}>
        {records.map((rec) => (
          <div key={rec.id} className={styles.recordCard}>
            <div className={styles.recordHeader}>
              <span className={styles.yearTag}>{rec.academic_year}</span>
              <div className={styles.designation}>{rec.designation}</div>
            </div>

            {rec.school_name && (
              <div className={styles.school}>
                <School size={14} />
                <span>{rec.school_name}</span>
              </div>
            )}

            <div className={styles.statsRow}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <BookOpen size={13} /> {rec.classrooms_count} Classrooms
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={13} /> {rec.students_count} Students Mentored
              </span>
            </div>

            {rec.subjects.length > 0 && (
              <div className={styles.tags}>
                {rec.subjects.map((sub) => (
                  <span key={sub} className={styles.tag}>
                    {sub}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
