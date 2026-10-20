'use client';

import Link from 'next/link';
import React, { useRef, useState } from 'react';
import { useAcademicDomain } from '@/lib/domain';
import styles from './submissions.module.css';

interface SubmissionsFloorProps {
  accountId: string;
  authSubjectId: string;
  displayName: string;
  capacity?: string;
}

export function SubmissionsFloor({ accountId, authSubjectId, displayName, capacity }: Readonly<SubmissionsFloorProps>) {
  const {
    assignments,
    submissions,
    selectedAssignmentId,
    setSelectedAssignmentId,
    submitAssignment,
    isSubmitting,
    isOnline,
  } = useAcademicDomain();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentId) {
      setNotice('No authorized assignment is available to submit.');
      return;
    }
    if (selectedFile) {
      setNotice('Attachments are not available yet. Your selected file remains here and was not submitted.');
      return;
    }

    try {
      const result = await submitAssignment(selectedAssignmentId, notes.trim());
      if (result) {
        setNotes('');
        setSelectedFile(null);
        setNotice('Submission committed and ready for educator review.');
      }
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : 'Submission could not be sent. Your draft remains.');
    } finally {
      setTimeout(() => setNotice(null), 4000);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.headerBar}>
        <div className={styles.titleArea}>
          <div style={{ marginBottom: '0.5rem' }}>
            <Link
              href="/workspace"
              style={{
                fontSize: '0.8rem',
                fontWeight: 650,
                color: 'var(--color-action, #a85022)',
                textDecoration: 'none',
              }}
            >
              ← Back to Attendance Workspace
            </Link>
          </div>
          <h1>Classroom Submissions & Assignments</h1>
          <p>Upload homework artifacts, track evaluation rubrics, and view educator commentary.</p>
        </div>
      </header>

      {notice && (
        <div aria-live="polite" style={{ color: '#2e5d32', fontWeight: 700, fontSize: '0.85rem' }}>
          ✓ {notice}
        </div>
      )}

      <div className={styles.gridTwo}>
        {/* Upload Form */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span>📤</span>
            <span>Submit Assignment</span>
          </h2>

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div>
              <label
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '0.25rem',
                }}
              >
                Assignment
              </label>
              <select
                value={selectedAssignmentId}
                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: 44,
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--color-line, rgba(104, 94, 85, 0.25))',
                  background: '#ffffff',
                }}
              >
                {!assignments.length && <option value="">No assignments available</option>}
                {assignments.map((asg) => (
                  <option key={asg.id} value={asg.id}>
                    {asg.title}{asg.classroom_id ? ` (${asg.classroom_id})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Drag and Drop Zone */}
            <div
              className={styles.uploadZone}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.docx,.zip"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <span className={styles.uploadIcon}>📄</span>
              <span className={styles.uploadLabel}>
                {selectedFile ? selectedFile.name : 'Click to select or drag a file to stage it'}
              </span>
              <span className={styles.uploadHint}>Attachments are unavailable; staged files are retained and never sent as filename-only placeholders.</span>
            </div>

            <div>
              <label
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '0.25rem',
                }}
              >
                Reflective Notes for Educator (Optional)
              </label>
              <textarea
                className={styles.textArea}
                placeholder="Share any questions or contexts about your submission..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button type="submit" disabled={isSubmitting || !selectedAssignmentId} className={styles.submitBtn}>
              {isSubmitting ? 'Sending Submission...' : 'Send Submission'}
            </button>
          </form>
        </section>

        {/* Submissions & Evaluation Queue */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span>📋</span>
            <span>Evaluation & Feedback Queue</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft, #453c35)', margin: 0 }}>
            Recent server-authorized submissions and educator evaluations.
          </p>

          <div className={styles.submissionList}>
            {submissions.map((sub) => {
              const assignment = assignments.find((item) => item.id === sub.assignment_id);
              return (
              <div key={sub.id} className={styles.submissionItem}>
                <div className={styles.submissionMeta}>
                  <span className={styles.submissionName}>{assignment?.title ?? 'Assignment'}</span>
                  <span className={styles.submissionSub}>
                    By {displayName} • {new Date(sub.submitted_at).toLocaleDateString()}
                  </span>
                  {sub.feedback && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#2e5d32',
                        marginTop: '0.25rem',
                        fontStyle: 'italic',
                      }}
                    >
                      &ldquo;{sub.feedback}&rdquo;
                    </span>
                  )}
                </div>
                <div>
                  {sub.grade !== null ? (
                    <span className={styles.statusGraded}>{sub.grade}</span>
                  ) : (
                    <span className={styles.statusPendingGrade}>Under Review</span>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
