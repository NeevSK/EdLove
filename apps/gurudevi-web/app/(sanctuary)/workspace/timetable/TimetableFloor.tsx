'use client';

import Link from 'next/link';
import { DAYS, schoolDayFor, useTimetable } from './useTimetable';
import styles from './timetable.module.css';

export { schoolDayFor };

interface TimetableFloorProps {
  displayName: string;
  capacity?: string;
}

export function TimetableFloor({ displayName }: TimetableFloorProps) {
  const {
    selectedDay,
    setSelectedDay,
    periods,
    prepItems,
    togglePrepItem,
    completedCount,
    prepProgressPercent,
  } = useTimetable();

  return (
    <div className={styles.container}>
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1>Institutional Timetable & Bell Schedule</h1>
          <p>
            Weekly instructional schedule, period matrix, and teacher daily prep for {displayName}&rsquo;s classroom circles.
          </p>
        </div>
      </div>

      {/* Daily Prep Checklist Section */}
      <section className={styles.prepSection} aria-label="Daily Teacher & Student Preparation">
        <div className={styles.prepHeader}>
          <div className={styles.prepTitleGroup}>
            <span className={styles.prepIcon}>📋</span>
            <div>
              <h2 className={styles.prepHeading}>Daily Pedagogical Prep Checklist</h2>
              <p className={styles.prepSubtext}>
                {completedCount} of {prepItems.length} items ready ({prepProgressPercent}%)
              </p>
            </div>
          </div>
          <div className={styles.progressBarWrapper}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${prepProgressPercent}%` }}
              role="progressbar"
              aria-valuenow={prepProgressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        <div className={styles.prepList}>
          {prepItems.map((item) => (
            <label key={item.id} className={styles.prepItem}>
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => togglePrepItem(item.id)}
                className={styles.prepCheckbox}
              />
              <span className={item.completed ? styles.prepTaskDone : styles.prepTask}>
                {item.task}
              </span>
              <span className={styles.prepCategoryBadge}>{item.category}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Day Selector Tabs */}
      <nav aria-label="Timetable Days" className={styles.dayTabs}>
        {DAYS.map((day) => {
          const isSelected = day === selectedDay;
          return (
            <button
              key={day}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedDay(day)}
              className={styles.dayTab}
            >
              {day}
            </button>
          );
        })}
      </nav>

      {/* Period Cards Grid */}
      <div className={styles.scheduleGrid} role="tabpanel" aria-label={`${selectedDay} Schedule`}>
        {periods.map((p, index) => (
          <div key={p.number} className="contents">
            {index === 4 && (
              <div className={styles.intervalCard}>
                ☕ Mid-Morning Interval & Nourishment (10:30 – 10:50)
              </div>
            )}
            <article className={styles.periodCard}>
              <div className={styles.periodHeader}>
                <span className={styles.periodNumber}>Period {p.number}</span>
                <time className={styles.periodTime}>{p.time}</time>
              </div>
              <h3 className={styles.subjectTitle}>{p.subject}</h3>
              <p className={styles.teacherName}>Instructor: {p.teacher}</p>
              <div className={styles.cardFooter}>
                <span className={styles.roomTag}>{p.room}</span>
                <Link
                  href="/workspace"
                  className={styles.attendanceActionLink}
                  title="Check or mark period attendance"
                >
                  Roll Call ➔
                </Link>
              </div>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}
