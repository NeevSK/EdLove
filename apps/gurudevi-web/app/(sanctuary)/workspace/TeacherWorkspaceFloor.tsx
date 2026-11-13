'use client';

import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Layers,
  MapPin,
  QrCode,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Pebble, Button, Card } from '@repo/ui/components/web';
import styles from './teacher-workspace.module.css';

export interface AssignedClassroom {
  id: string;
  name: string;
  subject: string;
  room?: string;
  studentCount: number;
  periodSlot?: string;
}

export interface TeacherWorkspaceFloorProps {
  displayName?: string;
  isExplore?: boolean;
  classrooms?: readonly AssignedClassroom[];
  onOpenAttendance?: (classroom?: AssignedClassroom) => void;
}

const DEFAULT_DEMO_CLASSROOMS: readonly AssignedClassroom[] = [
  {
    id: 'cls_10a_math',
    name: 'Grade 10-A',
    subject: 'Pure Mathematics',
    room: 'Hall 4',
    studentCount: 32,
    periodSlot: 'Period 2 (08:45 - 09:30)',
  },
  {
    id: 'cls_11b_phys',
    name: 'Grade 11-B',
    subject: 'Physics & Kinetics',
    room: 'Lab 2',
    studentCount: 28,
    periodSlot: 'Period 4 (10:30 - 11:15)',
  },
  {
    id: 'cls_9c_sci',
    name: 'Grade 9-C',
    subject: 'General Science',
    room: 'Room 12',
    studentCount: 30,
    periodSlot: 'Period 6 (12:30 - 13:15)',
  },
];

export function TeacherWorkspaceFloor({
  displayName = 'Educator',
  isExplore = false,
  classrooms = DEFAULT_DEMO_CLASSROOMS,
  onOpenAttendance,
}: Readonly<TeacherWorkspaceFloorProps>): React.ReactElement {
  const activeClass = classrooms[0] ?? DEFAULT_DEMO_CLASSROOMS[0]!;

  return (
    <div className={styles.container}>
      {/* 1. Active Period Instrument (Pebble-Anchored Hero) */}
      <section className={styles.periodHero} aria-labelledby="active-period-title">
        <div className={styles.periodAnchorGroup}>
          <div className={styles.periodPebbleSpot}>
            <Pebble
              title={activeClass.name}
              emoji="📐"
              rhythm="Active Now"
              gear="auto"
              selected={true}
              onPress={() => onOpenAttendance?.(activeClass)}
              titleAttr={`${activeClass.name} · Tap to start roll call`}
            />
          </div>

          <div className={styles.periodWords}>
            <div className={styles.periodBadgeRow}>
              <span className={styles.periodBadge}>
                <span className={styles.pulseDot} />
                Period 2 · In Session
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--w-ink-muted)' }}>
                08:45 AM - 09:30 AM
              </span>
            </div>

            <h2 id="active-period-title" className={styles.periodTitle}>
              {activeClass.name} — {activeClass.subject}
            </h2>
            <p className={styles.periodMeta}>
              <MapPin size={15} /> {activeClass.room ?? 'Room 4'} · Regular Cohort · {activeClass.studentCount} Learners
            </p>
          </div>
        </div>

        <div className={styles.periodActions}>
          <Button
            label="Start Roll Call"
            variant="primary"
            size="md"
            icon={CheckCircle2}
            onClick={() => onOpenAttendance?.(activeClass)}
          />

          <Link
            href={`/workspace/classroom/${encodeURIComponent(activeClass.id)}`}
            style={{ textDecoration: 'none' }}
          >
            <Button label="Classroom Hub" variant="secondary" size="md" icon={BookOpen} />
          </Link>
        </div>
      </section>

      {/* 2. Pedagogical Toolbelt (Pebble Tactile Row) */}
      <section className={styles.section} aria-labelledby="pedagogical-tools-title">
        <div className={styles.sectionHeading}>
          <h3 id="pedagogical-tools-title" className={styles.sectionTitle}>
            Pedagogical Desk & Tools
          </h3>
        </div>

        <div className={`gd-strip ${styles.pebbleRow}`}>
          <div className={styles.pebbleSlot}>
            <Pebble
              title="Roll Call"
              emoji="📋"
              rhythm="Presence"
              gear="auto"
              onPress={() => onOpenAttendance?.(activeClass)}
              titleAttr="Daily Attendance Roll Call"
            />
          </div>

          <div className={styles.pebbleSlot}>
            <Link href="/qr" style={{ textDecoration: 'none' }}>
              <Pebble
                title="Scan QR"
                emoji="📷"
                rhythm="Tokens"
                gear="auto"
                titleAttr="Scan Student QR Tokens"
              />
            </Link>
          </div>

          <div className={styles.pebbleSlot}>
            <Link href="/workspace/gradebook" style={{ textDecoration: 'none' }}>
              <Pebble
                title="Gradebook"
                emoji="🎓"
                rhythm="Marks & Terms"
                gear="auto"
                titleAttr="Open Marks Register"
              />
            </Link>
          </div>

          <div className={styles.pebbleSlot}>
            <Link href="/workspace/submissions" style={{ textDecoration: 'none' }}>
              <Pebble
                title="Assignments"
                emoji="📥"
                rhythm="Coursework"
                gear="auto"
                titleAttr="Student Submissions Desk"
              />
            </Link>
          </div>

          <div className={styles.pebbleSlot}>
            <Link href="/workspace/timetable" style={{ textDecoration: 'none' }}>
              <Pebble
                title="Timetable"
                emoji="📅"
                rhythm="Weekly Periods"
                gear="auto"
                titleAttr="View Timetable Schedule"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Classrooms & Teaching Units (Using Kit Cards) */}
      <section className={styles.section} aria-labelledby="classrooms-grid-title">
        <div className={styles.sectionHeading}>
          <h3 id="classrooms-grid-title" className={styles.sectionTitle}>
            My Classrooms & Teaching Units
          </h3>
        </div>

        <div className={styles.classroomsGrid}>
          {classrooms.map((cls) => (
            <Link
              key={cls.id}
              href={`/workspace/classroom/${encodeURIComponent(cls.id)}`}
              className={styles.classroomCardItem}
            >
              <div className={styles.classHeader}>
                <div>
                  <h4 className={styles.className}>{cls.name}</h4>
                  <p className={styles.classSubject}>{cls.subject}</p>
                </div>
                <span className={styles.roomTag}>{cls.room}</span>
              </div>

              <div className={styles.classFooter}>
                <span>
                  <Users size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  {cls.studentCount} Students
                </span>
                <span className={styles.openLink}>Open Hub →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Today's Period Timetable Rhythm */}
      <section className={styles.section} aria-labelledby="today-rhythm-title">
        <div className={styles.sectionHeading}>
          <h3 id="today-rhythm-title" className={styles.sectionTitle}>
            Today's Timetable Rhythm
          </h3>
          <Link
            href="/workspace/timetable"
            style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--w-lamp-deep)', textDecoration: 'none' }}
          >
            Full Week Schedule →
          </Link>
        </div>

        <div className={styles.scheduleStrip}>
          <div className={styles.slotCard}>
            <span className={styles.slotTime}>08:00 - 08:45 · Period 1</span>
            <span className={styles.slotSubject}>Staff Assembly</span>
            <span className={styles.slotRoom}>Main Hall · Completed ✓</span>
          </div>
          <div className={`${styles.slotCard} ${styles.slotCurrent}`}>
            <span className={styles.slotTime} style={{ color: 'var(--w-lamp-deep)' }}>
              08:45 - 09:30 · Period 2 (ACTIVE)
            </span>
            <span className={styles.slotSubject}>10-A Mathematics</span>
            <span className={styles.slotRoom}>Hall 4 · In Session</span>
          </div>
          <div className={styles.slotCard}>
            <span className={styles.slotTime}>09:30 - 10:15 · Period 3</span>
            <span className={styles.slotSubject}>Office Hours / Prep</span>
            <span className={styles.slotRoom}>Faculty Room</span>
          </div>
          <div className={styles.slotCard}>
            <span className={styles.slotTime}>10:30 - 11:15 · Period 4</span>
            <span className={styles.slotSubject}>11-B Physics</span>
            <span className={styles.slotRoom}>Lab 2 · Upcoming</span>
          </div>
        </div>
      </section>
    </div>
  );
}
