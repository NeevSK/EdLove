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
import { Link } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import styles from './classroom-detail.module.css';

import { useClassroomDomain } from '@/lib/domain/classroomDomain';
import { useAssetOutbox } from '@/lib/media/useAssetOutbox';
import { useTranslation } from '@/lib/i18n';
import { importDocxToMarkdown, importPptxToSlidesMarkdown } from '@repo/library/content/import';
import type { H5PEvent } from '@repo/library/h5p';
import { DocumentView, H5pView, Markdown, RichTextEditor } from '@repo/ui/components/web';

export function ClassroomDetailFloor({
  classroomId,
  displayName = 'Educator',
  isExplore = false,
}: Readonly<{
  classroomId: string;
  displayName?: string;
  isExplore?: boolean;
}>): React.ReactElement {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'students' | 'lessons' | 'assignments' | 'notes'>('students');
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftMarkdown, setDraftMarkdown] = useState('');
  const [localLessons, setLocalLessons] = useState<
    Array<{ id: string; title: string; date: string; status: string; summary: string; markdown?: string; fileUri?: string; fileMime?: string; h5pUrl?: string }>
  >([]);
  const [xapiLog, setXapiLog] = useState<H5PEvent[]>([]);
  const { enqueueAsset, pendingAssetCount } = useAssetOutbox();
  const [draftFileUri, setDraftFileUri] = useState<string | undefined>(undefined);
  const [draftFileMime, setDraftFileMime] = useState<string | undefined>(undefined);

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
        <Link to="/workspace" className={styles.breadcrumbLink}>
          {t('classroom.workspaceBreadcrumb') || 'Workspace'}
        </Link>
        <span>/</span>
        <span>{t('classroom.classroomsBreadcrumb') || 'Classrooms'}</span>
        <span>/</span>
        <span style={{ color: 'var(--color-ink)' }}>{classroomId}</span>
      </nav>

      <header className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.eyebrow}>{t('classroom.eyebrow')}</p>
          <h1 className={styles.title}>{classroomName}</h1>
          <p className={styles.subtitle}>{subject} • {t('classroom.curatedBy', { name: displayName })}</p>
        </div>

        <div className={styles.headerActions}>
          <Link to="/workspace" className={styles.btnSecondary}>
            <ArrowLeft size={16} /> {t('classroom.returnRollCall')}
          </Link>
          <Link to="/workspace/gradebook" className={styles.btnPrimary}>
            <GraduationCap size={16} /> {t('classroom.openGradebook')}
          </Link>
        </div>
      </header>

      {/* Stats Ribbon */}
      <section className={styles.statsGrid} aria-label="Classroom Metrics">
        <div className={styles.statCard}>
          <span className={styles.statLabel}>{t('classroom.enrolledStudents')}</span>
          <span className={styles.statValue}>{students.length}</span>
          <span className={styles.statHint}>{t('classroom.activeLearners')}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Average Attendance</span>
          <span className={styles.statValue}>
            {Math.round(students.reduce((acc, s) => acc + s.attendanceRate, 0) / (students.length || 1))}%
          </span>
          <span className={styles.statHint}>Term rolling average</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>{t('classroom.curriculumUnits')}</span>
          <span className={styles.statValue}>{lessons.length}</span>
          <span className={styles.statHint}>Pedagogical plans</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>{t('classroom.activeAssignments')}</span>
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
          {t('classroom.tabStudents')} ({students.length})
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'lessons' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('lessons')}
        >
          <BookOpen size={18} />
          {t('classroom.tabLessons')} ({lessons.length})
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'assignments' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          <FileText size={18} />
          {t('classroom.tabAssignments')} ({assignments.length})
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'notes' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          <MessageSquare size={18} />
          {t('classroom.tabNotes')} ({observations.length})
        </button>
      </nav>

      {/* Tab: Student Roster */}
      {activeTab === 'students' && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Learner Cohort & Presence Stability</h2>
            <Link to="/workspace" className={styles.btnSecondary}>
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
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => setComposerOpen((v) => !v)}
            >
              <Plus size={16} /> {composerOpen ? 'Close Composer' : 'New / Import Lesson'}
            </button>
          </div>

          {composerOpen && (
            <div className={styles.lessonCard} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Lesson title…"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  style={{ padding: '0.5rem 0.75rem', borderRadius: '0.4rem', border: '1px solid rgba(104,94,85,0.25)' }}
                />
                <input
                  type="file"
                  accept=".docx,.pptx,.md,.pdf,.h5p"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!draftTitle.trim()) setDraftTitle(file.name.replace(/\.[^.]+$/, ''));
                    const lower = file.name.toLowerCase();
                    const queued = await enqueueAsset(file, {
                      purpose: lower.endsWith('.h5p') ? 'h5p_package' : 'library_resource',
                      visibility: 'institution',
                      targetKind: 'classroom_material',
                      targetId: classroomId,
                      title: draftTitle || file.name,
                    });
                    if (queued.ok) {
                      setDraftFileUri(queued.localUri);
                      setDraftFileMime(file.type || undefined);
                    }
                    if (lower.endsWith('.docx')) {
                      const res = await importDocxToMarkdown(await file.arrayBuffer(), { title: file.name });
                      setDraftMarkdown(res.markdown);
                    } else if (lower.endsWith('.pptx')) {
                      const res = importPptxToSlidesMarkdown(await file.arrayBuffer(), { title: file.name });
                      setDraftMarkdown(res.markdown);
                    } else if (lower.endsWith('.md')) {
                      setDraftMarkdown(await file.text());
                    }
                  }}
                />
                {pendingAssetCount > 0 && (
                  <span style={{ fontSize: '0.8rem', opacity: 0.75 }}>
                    Outbox: {pendingAssetCount} file(s) queued for upload
                  </span>
                )}
                <RichTextEditor
                  label="Lesson Body (Gurudevi Markdown)"
                  value={draftMarkdown}
                  onChange={setDraftMarkdown}
                  placeholder="Write lesson content or import .docx / .pptx…"
                />
                <div>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={() => {
                      if (!draftTitle.trim()) return;
                      const created = {
                        id: `local-${Date.now()}`,
                        title: draftTitle.trim(),
                        date: new Date().toISOString().slice(0, 10),
                        status: 'in_progress',
                        summary: draftMarkdown.slice(0, 140) || 'Imported lesson material',
                        markdown: draftMarkdown || undefined,
                        fileUri: draftFileUri,
                        fileMime: draftFileMime,
                      };
                      setLocalLessons((prev) => [created, ...prev]);
                      setOpenLessonId(created.id);
                      setDraftTitle('');
                      setDraftMarkdown('');
                      setDraftFileUri(undefined);
                      setDraftFileMime(undefined);
                      setComposerOpen(false);
                    }}
                  >
                    Save Lesson to Classroom
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={styles.lessonList}>
            {[...localLessons, ...lessons].map((lesson) => {
              const isOpen = openLessonId === lesson.id;
              const extra = lesson as { markdown?: string; fileUri?: string; fileMime?: string; h5pUrl?: string };
              return (
                <article key={lesson.id} className={styles.lessonCard}>
                  <div className={styles.lessonHeader}>
                    <div>
                      <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                      <span className={styles.lessonDate}>Delivered on {lesson.date}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={() => setOpenLessonId(isOpen ? null : lesson.id)}
                      >
                        <BookOpen size={14} /> {isOpen ? 'Hide' : 'Open'}
                      </button>
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
                  </div>
                  <p className={styles.lessonBody}>{lesson.summary}</p>
                  {isOpen && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(104,94,85,0.15)' }}>
                      {extra.markdown ? (
                        <Markdown source={extra.markdown} />
                      ) : extra.h5pUrl ? (
                        <H5pView
                          packageUrl={extra.h5pUrl}
                          title={lesson.title}
                          onXapi={(ev) => {
                            if (ev && typeof ev === 'object' && 'verb' in ev) {
                              setXapiLog((prev) => [ev as H5PEvent, ...prev]);
                            }
                          }}
                        />
                      ) : extra.fileUri ? (
                        <DocumentView file={{ name: lesson.title, uri: extra.fileUri, mime: extra.fileMime }} />
                      ) : (
                        <Markdown source={`# ${lesson.title}\n\n${lesson.summary}`} />
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
          {xapiLog.length > 0 && (
            <div style={{ marginTop: '1rem', fontSize: '0.82rem', opacity: 0.8 }}>
              Recent H5P xAPI activity: {xapiLog[0]?.verb} ({xapiLog[0]?.activityId})
            </div>
          )}
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
