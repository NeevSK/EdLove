'use client';

import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
  Layers,
  MessageSquare,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import styles from './classroom-detail.module.css';

import { useClassroomDomain } from '@/lib/domain/classroomDomain';

export function ClassroomDetailFloor({
  classroomId,
  displayName = 'Educator',
  isExplore = false,
}: Readonly<{
  classroomId: string;
  displayName?: string;
  isExplore?: boolean;
}>): React.ReactElement {
  const [activeTab, setActiveTab] = useState<'students' | 'lessons' | 'assignments' | 'notes'>('students');

  const {
    classroomName,
    subject,
    students,
    lessons,
    assignments,
    observations,
    isLoading,
  } = useClassroomDomain(classroomId);

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/workspace" className={styles.breadcrumbLink}>
          Workspace
        </Link>
        <span>/</span>
        <span>Classrooms</span>
        <span>/</span>
        <span style={{ color: 'var(--color-ink)' }}>{classroomId}</span>
      </nav>

      <header className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.eyebrow}>Academic Pedagogical Sanctuary</p>
          <h1 className={styles.title}>{classroomName}</h1>
          <p className={styles.subtitle}>{subject} • Curated by {displayName}</p>
        </div>

        <div className={styles.headerActions}>
          <Link href="/workspace" className={styles.btnSecondary}>
            <ArrowLeft size={16} /> Return to Roll Call
          </Link>
          <Link href={`/workspace/gradebook?classroom=${classroomId}`} className={styles.btnPrimary}>
            <GraduationCap size={16} /> Open Gradebook
          </Link>
        </div>
      </header>

      {/* Stats Ribbon */}
      <section className={styles.statsGrid} aria-label="Classroom Metrics">
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Enrolled Students</span>
          <span className={styles.statValue}>{students.length}</span>
          <span className={styles.statHint}>Active learners</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Average Attendance</span>
          <span className={styles.statValue}>
            {Math.round(students.reduce((acc, s) => acc + s.attendanceRate, 0) / (students.length || 1))}%
          </span>
          <span className={styles.statHint}>Term rolling average</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Curriculum Lessons</span>
          <span className={styles.statValue}>{lessons.length}</span>
          <span className={styles.statHint}>Pedagogical plans</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Assignments</span>
          <span className={styles.statValue}>{assignments.length}</span>
          <span className={styles.statHint}>Open student tasks</span>
        </div>
      </section>

      {/* Tabs */}
      <nav className={styles.tabBar} aria-label="Classroom View Sections">
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'students' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <Users size={18} />
          Student Roster ({students.length})
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'lessons' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('lessons')}
        >
          <BookOpen size={18} />
          Lesson Feed ({lessons.length})
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'assignments' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          <FileText size={18} />
          Assignments Desk ({assignments.length})
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'notes' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          <MessageSquare size={18} />
          Observations & Notes ({observations.length})
        </button>
      </nav>

      {/* Tab: Student Roster */}
      {activeTab === 'students' && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Learner Cohort & Presence Stability</h2>
            <Link href="/workspace" className={styles.btnSecondary}>
              <CheckCircle size={16} /> Mark Today's Roll
            </Link>
          </div>

          <div className={styles.studentGrid}>
            {students.map((student) => (
              <article key={student.id} className={styles.studentCard}>
                <div className={styles.studentCardTop}>
                  <span className={styles.studentRoll}>Roll #{student.rollNumber}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gold-deep)' }}>
                    {student.attendanceRate}% Present
                  </span>
                </div>
                <h3 className={styles.studentName}>{student.name}</h3>
                <p className={styles.studentMeta}>Cohort 2026 • Regular Track</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Tab: Lessons */}
      {activeTab === 'lessons' && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Curriculum Timeline & Pedagogical Journey</h2>
          </div>

          <div className={styles.lessonList}>
            {lessons.map((lesson) => (
              <article key={lesson.id} className={styles.lessonCard}>
                <div className={styles.lessonHeader}>
                  <div>
                    <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                    <span className={styles.lessonDate}>Delivered on {lesson.date}</span>
                  </div>
                  <span
                    style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: lesson.status === 'completed' ? '#dcfce7' : '#fef3c7',
                      color: lesson.status === 'completed' ? '#15803d' : '#b45309',
                    }}
                  >
                    {lesson.status.replace('_', ' ')}
                  </span>
                </div>
                <p className={styles.lessonBody}>{lesson.summary}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Tab: Assignments */}
      {activeTab === 'assignments' && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Evaluations & Learning Portfolio</h2>
          </div>

          <div className={styles.assignmentGrid}>
            {assignments.map((assignment) => (
              <article key={assignment.id} className={styles.assignmentCard}>
                <h3 className={styles.assignmentTitle}>{assignment.title}</h3>
                <div className={styles.assignmentMeta}>
                  <span>Due: {assignment.dueDate}</span>
                  <span>
                    Submissions: {assignment.submissionsCount} / {assignment.totalStudents}
                  </span>
                </div>
                <div
                  style={{
                    height: '6px',
                    width: '100%',
                    background: '#eee',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${(assignment.submissionsCount / (assignment.totalStudents || 1)) * 100}%`,
                      background: 'var(--color-gold-deep)',
                    }}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Tab: Observations */}
      {activeTab === 'notes' && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Somatic & Pedagogical Observations Log</h2>
          </div>

          <div className={styles.notesGrid}>
            {observations.map((obs) => (
              <article key={obs.id} className={styles.noteCard}>
                <span
                  className={`${styles.noteBadge} ${
                    obs.type === 'positive'
                      ? styles.notePositive
                      : obs.type === 'concern'
                        ? styles.noteConcern
                        : styles.noteNeutral
                  }`}
                >
                  {obs.type}
                </span>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--color-ink)' }}>
                  {obs.studentName}
                </p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-ink-muted)' }}>
                  {obs.date}
                </p>
                <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-ink-soft)', lineHeight: 1.5 }}>
                  {obs.note}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
