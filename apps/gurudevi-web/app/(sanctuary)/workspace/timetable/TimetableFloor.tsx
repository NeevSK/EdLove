'use client';

import { useState, useSyncExternalStore } from 'react';
import styles from './timetable.module.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
type Day = (typeof DAYS)[number];

// Weekends have no school day, so they fall back to the start of the week.
export function schoolDayFor(date: Date): Day {
  const weekday = date.getDay();
  if (weekday < 1 || weekday > DAYS.length) return 'Monday';
  return DAYS.at(weekday - 1) ?? 'Monday';
}

const noSubscription = () => () => {};
// The server cannot know the visitor's local weekday; it renders Monday and the
// client settles on today during hydration without a mismatch.
const readTodaySchoolDay = (): Day => schoolDayFor(new Date());
const readServerSchoolDay = (): Day => 'Monday';

type Period = {
  number: number;
  time: string;
  subject: string;
  teacher: string;
  room: string;
};

const weeklySchedule: Record<Day, Period[]> = {
  Monday: [
    {
      number: 1,
      time: '07:50 – 08:30',
      subject: 'Integrated Mathematics',
      teacher: 'Mrs. Perera',
      room: 'Hall 3A',
    },
    {
      number: 2,
      time: '08:30 – 09:10',
      subject: 'Language & Literacy (Sinhala)',
      teacher: 'Mr. Silva',
      room: 'Hall 3A',
    },
    {
      number: 3,
      time: '09:10 – 09:50',
      subject: 'Environmental Studies',
      teacher: 'Ms. Fernando',
      room: 'Science Lab',
    },
    {
      number: 4,
      time: '09:50 – 10:30',
      subject: 'English as Second Language',
      teacher: 'Mrs. Jayawardena',
      room: 'Hall 3A',
    },
    {
      number: 5,
      time: '10:50 – 11:30',
      subject: 'Buddhism / Ethics',
      teacher: 'Ven. Rahula',
      room: 'Temple Circle',
    },
    {
      number: 6,
      time: '11:30 – 12:10',
      subject: 'Aesthetic Studies (Music & Art)',
      teacher: 'Mr. Bandara',
      room: 'Art Studio',
    },
    {
      number: 7,
      time: '12:10 – 12:50',
      subject: 'Health & Physical Well-being',
      teacher: 'Coach Mendis',
      room: 'School Field',
    },
  ],
  Tuesday: [
    {
      number: 1,
      time: '07:50 – 08:30',
      subject: 'Science & Nature Discovery',
      teacher: 'Ms. Fernando',
      room: 'Science Lab',
    },
    {
      number: 2,
      time: '08:30 – 09:10',
      subject: 'Integrated Mathematics',
      teacher: 'Mrs. Perera',
      room: 'Hall 3A',
    },
    {
      number: 3,
      time: '09:10 – 09:50',
      subject: 'History & Heritage',
      teacher: 'Mr. Gunaratne',
      room: 'Hall 3A',
    },
    {
      number: 4,
      time: '09:50 – 10:30',
      subject: 'Language & Literacy',
      teacher: 'Mr. Silva',
      room: 'Hall 3A',
    },
    {
      number: 5,
      time: '10:50 – 11:30',
      subject: 'Practical Agriculture & Forest',
      teacher: 'Mr. Somapala',
      room: 'Forest Garden',
    },
    {
      number: 6,
      time: '11:30 – 12:10',
      subject: 'English as Second Language',
      teacher: 'Mrs. Jayawardena',
      room: 'Hall 3A',
    },
    {
      number: 7,
      time: '12:10 – 12:50',
      subject: 'Guided Library Reading',
      teacher: 'Librarian Jayasinghe',
      room: 'Main Library',
    },
  ],
  Wednesday: [
    {
      number: 1,
      time: '07:50 – 08:30',
      subject: 'Integrated Mathematics',
      teacher: 'Mrs. Perera',
      room: 'Hall 3A',
    },
    {
      number: 2,
      time: '08:30 – 09:10',
      subject: 'Environmental Studies',
      teacher: 'Ms. Fernando',
      room: 'Science Lab',
    },
    {
      number: 3,
      time: '09:10 – 09:50',
      subject: 'Language & Literacy',
      teacher: 'Mr. Silva',
      room: 'Hall 3A',
    },
    {
      number: 4,
      time: '09:50 – 10:30',
      subject: 'English as Second Language',
      teacher: 'Mrs. Jayawardena',
      room: 'Hall 3A',
    },
    {
      number: 5,
      time: '10:50 – 11:30',
      subject: 'Information Technology Foundations',
      teacher: 'Mr. Wickramasinghe',
      room: 'Computer Lab',
    },
    {
      number: 6,
      time: '11:30 – 12:10',
      subject: 'Drama & Expression',
      teacher: 'Ms. Ranasinghe',
      room: 'Activity Hall',
    },
    {
      number: 7,
      time: '12:10 – 12:50',
      subject: 'Community Project Circle',
      teacher: 'Class Mentor',
      room: 'Circle Room',
    },
  ],
  Thursday: [
    {
      number: 1,
      time: '07:50 – 08:30',
      subject: 'Language & Literacy',
      teacher: 'Mr. Silva',
      room: 'Hall 3A',
    },
    {
      number: 2,
      time: '08:30 – 09:10',
      subject: 'Science & Exploration',
      teacher: 'Ms. Fernando',
      room: 'Science Lab',
    },
    {
      number: 3,
      time: '09:10 – 09:50',
      subject: 'Integrated Mathematics',
      teacher: 'Mrs. Perera',
      room: 'Hall 3A',
    },
    {
      number: 4,
      time: '09:50 – 10:30',
      subject: 'History & Civics',
      teacher: 'Mr. Gunaratne',
      room: 'Hall 3A',
    },
    {
      number: 5,
      time: '10:50 – 11:30',
      subject: 'English Conversation Practice',
      teacher: 'Mrs. Jayawardena',
      room: 'Language Lab',
    },
    {
      number: 6,
      time: '11:30 – 12:10',
      subject: 'Aesthetic Studies',
      teacher: 'Mr. Bandara',
      room: 'Art Studio',
    },
    {
      number: 7,
      time: '12:10 – 12:50',
      subject: 'Physical Well-being & Sports',
      teacher: 'Coach Mendis',
      room: 'Gymnasium',
    },
  ],
  Friday: [
    {
      number: 1,
      time: '07:50 – 08:30',
      subject: 'Ethics & Mindfulness Assembly',
      teacher: 'Principal & Mentors',
      room: 'Main Quad',
    },
    {
      number: 2,
      time: '08:30 – 09:10',
      subject: 'Integrated Mathematics Review',
      teacher: 'Mrs. Perera',
      room: 'Hall 3A',
    },
    {
      number: 3,
      time: '09:10 – 09:50',
      subject: 'Science Practical Investigation',
      teacher: 'Ms. Fernando',
      room: 'Science Lab',
    },
    {
      number: 4,
      time: '09:50 – 10:30',
      subject: 'Language & Literature',
      teacher: 'Mr. Silva',
      room: 'Hall 3A',
    },
    {
      number: 5,
      time: '10:50 – 11:30',
      subject: 'English Creative Writing',
      teacher: 'Mrs. Jayawardena',
      room: 'Hall 3A',
    },
    {
      number: 6,
      time: '11:30 – 12:10',
      subject: 'Co-Curricular Clubs & Societies',
      teacher: 'Faculty Leads',
      room: 'Various',
    },
    {
      number: 7,
      time: '12:10 – 12:50',
      subject: 'Weekly Reflection & Circle Huddle',
      teacher: 'Class Mentor',
      room: 'Circle Room',
    },
  ],
};

interface TimetableFloorProps {
  displayName: string;
  capacity?: string;
}

export function TimetableFloor({ displayName }: TimetableFloorProps) {
  const todaySchoolDay = useSyncExternalStore(
    noSubscription,
    readTodaySchoolDay,
    readServerSchoolDay,
  );
  const [chosenDay, setSelectedDay] = useState<Day | null>(null);
  const selectedDay = chosenDay ?? todaySchoolDay;
  const periods = weeklySchedule[selectedDay] || [];

  return (
    <div className={styles.container}>
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1>Institutional Timetable</h1>
          <p>
            Weekly instructional schedule and period matrix for {displayName}&rsquo;s classroom
            circles.
          </p>
        </div>
      </div>

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
              <h2 className={styles.subjectTitle}>{p.subject}</h2>
              <p className={styles.teacherName}>{p.teacher}</p>
              <span className={styles.roomTag}>{p.room}</span>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}
