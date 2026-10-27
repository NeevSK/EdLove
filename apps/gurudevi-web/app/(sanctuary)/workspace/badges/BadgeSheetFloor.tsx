'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  getCanonicalSampleStudents,
  loadAccountAttendance,
  loadAccountClassrooms,
  type WorkspaceClassroom,
  type WorkspaceStudent,
} from '../../../../lib/workspace/attendance';
import { QRCodeSvg } from '../../../../lib/workspace/QRCodeSvg';
import styles from './badges.module.css';

type BadgeSheetFloorProps = Readonly<{
  mode: 'account' | 'explore';
  subjectId?: string;
  scope?: Readonly<{ bondId: string; entityId: string }>;
}>;

export function BadgeSheetFloor({ mode, subjectId }: BadgeSheetFloorProps) {
  const currentSubjectId = typeof subjectId === 'string' ? subjectId : '';
  const [classrooms, setClassrooms] = useState<readonly WorkspaceClassroom[]>([]);
  const [classroom, setClassroom] = useState<WorkspaceClassroom | null>(null);
  const [students, setStudents] = useState<readonly WorkspaceStudent[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0] ?? '';

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        setLoading(true);
        if (mode === 'account' && currentSubjectId) {
          const loaded = await loadAccountClassrooms(currentSubjectId);
          if (cancelled) return;
          setClassrooms(loaded);
          const first = loaded[0] ?? null;
          setClassroom(first);
          if (first) {
            const roster = await loadAccountAttendance(first, todayStr, currentSubjectId);
            if (!cancelled) setStudents(roster);
          }
        } else {
          // Explore sample roster
          const sampleClass: WorkspaceClassroom = {
            id: 'sample-5b',
            name: 'Grade 5B',
            subject: 'Homeroom',
          };
          setClassrooms([sampleClass]);
          setClassroom(sampleClass);
          const sampleStudents: readonly WorkspaceStudent[] = getCanonicalSampleStudents();
          setStudents(sampleStudents);
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void init();
    return () => {
      cancelled = true;
    };
  }, [mode, subjectId, todayStr]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const activeClassId = classroom?.id ?? 'class-5b';
  const activeClassName = classroom?.name ?? 'Grade Class';

  return (
    <article className={styles.badgesContainer}>

      <header className={styles.screenHeader}>
        <div>
          <h1 className={styles.title}>Student ID Badges & QR Generator</h1>
          <p className={styles.subtitle}>
            Print-ready A4 credential sheets (8 wallet-sized cards per page) for doorway kiosk taps
            and student claim.
          </p>
        </div>
        <div className={styles.actions}>
          {classrooms.length > 1 && (
            <select
              value={classroom?.id ?? ''}
              onChange={(e) => {
                const next = classrooms.find((c) => c.id === e.target.value);
                if (next) {
                  setClassroom(next);
                  if (currentSubjectId) {
                    void loadAccountAttendance(next, todayStr, currentSubjectId).then(setStudents);
                  }
                }
              }}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid #ded8cf',
                background: 'white',
                font: 'inherit',
              }}
            >
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          <button type="button" className={styles.printBtn} onClick={handlePrint}>
            🖨️ Print Badge Sheet
          </button>
          <Link href="/workspace/kiosk" className={styles.backLink}>
            Open Kiosk Scanner →
          </Link>
          <Link href="/workspace" className={styles.backLink}>
            ← Roll Call
          </Link>
        </div>
      </header>

      <div className={styles.infoBanner}>
        <span>
          💡 <strong>Printing Advice:</strong> Use 200–250gsm cardstock or standard 8-up perforated
          badge paper. Lamination extends card life for all-year daily tapping.
        </span>
        <span>{students.length} Badges Ready</span>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '3rem', color: '#71695f' }}>
          Preparing student vector credentials…
        </p>
      ) : students.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '3rem', color: '#71695f' }}>
          No enrolled students in this classroom roster.
        </p>
      ) : (
        <div className={styles.badgeSheetGrid}>
          {students.map((student, index) => {
            const roll = student.rollNumber ?? index + 1;
            const studentId = student.studentId ?? student.id;
            const qrToken = `ATTENDANCE:${activeClassId}:${studentId}`;
            const claimCode = `EDL-${student.id.slice(0, 4).toUpperCase()}`;

            return (
              <section
                key={student.id}
                className={styles.badgeCard}
                aria-label={`Badge for ${student.name}`}
              >
                <div className={styles.badgeCardHeader}>
                  <div className={styles.schoolCrestRow}>
                    <span className={styles.crestIcon}>🏛️</span>
                    <h2 className={styles.schoolName}>Gurudevi Sanctuary</h2>
                  </div>
                  <span className={styles.badgeTypePill}>Student Pass</span>
                </div>

                <div className={styles.badgeCardBody}>
                  <div className={styles.studentMeta}>
                    <h3 className={styles.studentFullName}>{student.name}</h3>
                    <p className={styles.studentClassRoll}>
                      {activeClassName} · Roll #{roll}
                    </p>
                    <span className={styles.studentIdSubtext}>ID: {studentId.slice(0, 10)}</span>
                  </div>

                  <div className={styles.qrWrapper}>
                    <QRCodeSvg value={qrToken} size={58} />
                  </div>
                </div>

                <div className={styles.badgeCardFooter}>
                  <span>Tap at doorway kiosk</span>
                  <span className={styles.claimCodeText}>Claim: {claimCode}</span>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </article>
  );
}
