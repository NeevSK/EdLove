'use client';

import type { OperationalDuty } from '@/lib/domain/multiSphereDomain';
import { AlertCircle, CheckCircle, Clock, MapPin } from 'lucide-react';
import React from 'react';
import styles from './campus-operations-wing.module.css';

interface CampusOperationsWingProps {
  duties: readonly OperationalDuty[];
  onSetStatus?: (dutyId: string, status: 'pending' | 'in_progress' | 'completed') => void;
}

export function CampusOperationsWing({
  duties,
  onSetStatus,
}: CampusOperationsWingProps): React.ReactElement {
  if (!duties || duties.length === 0) {
    return <></>;
  }

  return (
    <section className={styles.container} aria-label="Campus Operations & Relief Substitutions">
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h2>
            <span>🏛️</span> Campus Operations & Relief Logistics
          </h2>
          <p className={styles.subtitle}>
            Relief period substitutions, midday nutritional monitoring, and campus oversight.
          </p>
        </div>
        <span className={styles.sphereTag}>Campus Operations</span>
      </header>

      <div className={styles.dutiesList}>
        {duties.map((duty) => {
          const isUrgent = duty.urgency === 'high';
          const isCompleted = duty.status === 'completed';

          return (
            <article
              key={duty.id}
              className={`${styles.dutyItem} ${isUrgent && !isCompleted ? styles.dutyItemUrgent : ''}`}
            >
              <div className={styles.dutyLeft}>
                <div className={styles.periodBadge}>
                  <span className={styles.periodNum}>P{duty.period}</span>
                  <span className={styles.periodLabel}>Period</span>
                </div>

                <div className={styles.dutyInfo}>
                  <h3 className={styles.dutyTitle}>{duty.title}</h3>
                  <div className={styles.dutyMeta}>
                    <span>
                      <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />
                      {duty.timeSlot}
                    </span>
                    <span>
                      <MapPin size={12} style={{ display: 'inline', marginRight: '3px' }} />
                      {duty.venue}
                    </span>
                    {duty.coveringFor && (
                      <span className={styles.coveringNote}>
                        Covering for: {duty.coveringFor}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.dutyRight}>
                <button
                  type="button"
                  className={`${styles.btnCheckIn} ${isCompleted ? styles.btnCheckInCompleted : ''}`}
                  onClick={() =>
                    onSetStatus?.(duty.id, isCompleted ? 'pending' : 'completed')
                  }
                  aria-pressed={isCompleted}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle size={14} /> Completed
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} /> Acknowledge & Check In
                    </>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

