import type { CoCurricularActivity } from '@/lib/domain/multiSphereDomain';
import { Calendar, Users } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import React from 'react';
import styles from './cocurricular-wing.module.css';

interface CoCurricularWingProps {
  activities: readonly CoCurricularActivity[];
}

export function CoCurricularWing({ activities }: CoCurricularWingProps): React.ReactElement {
  if (!activities || activities.length === 0) {
    return <></>;
  }

  return (
    <section className={styles.container} aria-label="Co-Curricular & Athletics Responsibilities">
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h2>
            <span>🏆</span> Clubs, Sports & Student Societies
          </h2>
          <p className={styles.subtitle}>
            Student societies, athletic squads, and house assignments under your mentorship.
          </p>
        </div>
        <span className={styles.sphereTag}>School Activities</span>
      </header>

      <div className={styles.grid}>
        {activities.map((act) => (
          <article key={act.id} className={styles.card}>
            <div className={styles.cardTop}>
              <h3 className={styles.activityName}>{act.name}</h3>
              <span className={styles.categoryBadge}>{act.category}</span>
            </div>

            <div className={styles.metaRow}>
              <span>Role: <strong className={styles.roleLabel}>{act.role}</strong></span>
              <span><Users size={14} style={{ display: 'inline', marginRight: '3px' }} />{act.membershipCount} members</span>
            </div>

            <div className={styles.eventBox}>
              <span className={styles.eventTitle}>{act.nextEvent.title}</span>
              <span className={styles.eventDetails}>
                <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                {act.nextEvent.scheduledAt} • {act.nextEvent.venue}
              </span>
            </div>

            <div className={styles.actions}>
              <Link to="/workspace/events" search={{ scope: act.id }} className={styles.btnAction}>
                Open Activity Hub ➔
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

