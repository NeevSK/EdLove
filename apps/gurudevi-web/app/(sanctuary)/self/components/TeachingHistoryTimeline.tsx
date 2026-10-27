'use client';

import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import { Award, BookOpen, Calendar, School, Users } from 'lucide-react';
import { useTeacherProfessionalHistory } from '../../../../lib/sanctuary/useTeacherProfessionalHistory';
import styles from './teaching-history.module.css';

interface TeachingHistoryProps {
  userId?: string;
  onClose?: () => void;
}

export function TeachingHistoryTimeline({ userId, onClose }: TeachingHistoryProps) {
  const { data: history = [], isLoading } = useTeacherProfessionalHistory(userId);
  const fallback = getSandboxSamples<any[]>('history', 'getTeacherHistory', [], []);
  const records = history.length > 0 ? history : fallback;

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
                {rec.subjects.map((sub: string) => (
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
