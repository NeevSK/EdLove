'use client';

import { orpcClient } from '@repo/core/api/orpcClient';
import { parseInstitutionalQR } from '@repo/core/logic/utils/institutionalQrParser';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  type AccountAttendanceDraftScope,
  type AttendanceStatus,
  loadAccountAttendance,
  loadAccountClassrooms,
  saveAccountAttendanceDraft,
  saveExploreAttendance,
  type WorkspaceClassroom,
  type WorkspaceStudent,
} from '../../../../lib/workspace/attendance';
import styles from './kiosk.module.css';

type KioskFloorProps = Readonly<{
  mode: 'account' | 'explore';
  subjectId?: string;
  scope?: Readonly<{ bondId: string; entityId: string }>;
}>;

type TapRecord = Readonly<{
  studentId: string;
  name: string;
  rollNumber: number | null;
  timestamp: string;
  isShadow: boolean;
}>;

type FeedbackState =
  | { kind: 'idle' }
  | { kind: 'success'; name: string; rollNumber: number | null; detail: string }
  | { kind: 'warning'; name: string; detail: string }
  | { kind: 'error'; detail: string };

function playAudioChime(kind: 'success' | 'warning' | 'error') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (kind === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1174, now + 0.12); // D6
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (kind === 'warning') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523, now); // C5
      osc.frequency.setValueAtTime(440, now + 0.1); // A4
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now); // A3
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch {
    // AudioContext blocked or unsupported in current browser policy
  }
}

export function KioskFloor({ mode, subjectId, scope }: KioskFloorProps) {
  const [classrooms, setClassrooms] = useState<readonly WorkspaceClassroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<WorkspaceClassroom | null>(null);
  const [students, setStudents] = useState<readonly WorkspaceStudent[]>([]);
  const [arrivals, setArrivals] = useState<readonly TapRecord[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>({ kind: 'idle' });
  const [manualCode, setManualCode] = useState('');
  const [burstWarning, setBurstWarning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const keyBufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const tapHistoryRef = useRef<Map<string, number>>(new Map());
  const burstWindowRef = useRef<number[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const todayStr = new Date().toISOString().split('T')[0] ?? '';

  // Load classrooms on mount
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        if (mode === 'account' && typeof subjectId === 'string') {
          const activeSubjectId: string = subjectId;
          const loaded = await loadAccountClassrooms(activeSubjectId);
          if (cancelled) return;
          const firstClassroom = loaded[0];
          if (firstClassroom) {
            setSelectedClassroom(firstClassroom);
            const roster = await loadAccountAttendance(firstClassroom, todayStr, activeSubjectId);
            if (!cancelled) setStudents(roster);
          }
        } else {
          // Explore sample roster
          const sampleClassroom: WorkspaceClassroom = {
            id: 'explore-kiosk-class',
            name: 'Grade 5B (Doorway Kiosk)',
            subject: 'Homeroom',
          };
          setClassrooms([sampleClassroom]);
          setSelectedClassroom(sampleClassroom);
          const sampleStudents: WorkspaceStudent[] = [
            {
              id: 'st-01',
              studentId: 'st-01',
              name: 'Nimal Bandara',
              rollNumber: 1,
              status: 'absent',
            },
            {
              id: 'st-02',
              studentId: 'st-02',
              name: 'Kasun Perera',
              rollNumber: 2,
              status: 'absent',
            },
            {
              id: 'st-03',
              studentId: 'st-03',
              name: 'Ananya Sharma',
              rollNumber: 3,
              status: 'absent',
            },
            {
              id: 'st-04',
              studentId: 'st-04',
              name: 'Devinda Silva',
              rollNumber: 4,
              status: 'absent',
            },
            {
              id: 'st-05',
              studentId: 'st-05',
              name: 'Fatima Zahra',
              rollNumber: 5,
              status: 'absent',
            },
          ];
          setStudents(sampleStudents);
        }
      } catch {
        // Fallback gracefully
      }
    };
    void init();
    return () => {
      cancelled = true;
    };
  }, [mode, subjectId, todayStr]);

  const processBadgeToken = useCallback(
    async (token: string) => {
      const cleanToken = token.trim();
      if (!cleanToken || !selectedClassroom) return;

      const now = Date.now();
      // Burst detection: check if >5 taps occurred in last 2 seconds
      burstWindowRef.current = [...burstWindowRef.current.filter((t) => now - t < 2000), now];
      if (burstWindowRef.current.length > 5) {
        setBurstWarning(true);
      } else {
        setBurstWarning(false);
      }

      // Parse token: check canonical institutional QR or raw ID
      const parsed = parseInstitutionalQR(cleanToken);
      let studentIdentifier = cleanToken;
      if (parsed.kind === 'attendance' || parsed.kind === 'student_id') {
        studentIdentifier = parsed.studentId;
      }

      // Find student in current classroom roster
      const student = students.find(
        (s) =>
          s.studentId === studentIdentifier ||
          s.id === studentIdentifier ||
          (s.rollNumber !== null && String(s.rollNumber) === studentIdentifier),
      );

      if (!student) {
        playAudioChime('error');
        setFeedback({
          kind: 'error',
          detail: `Unrecognized badge [${cleanToken.slice(0, 14)}]. Not found in this classroom roster.`,
        });
        return;
      }

      // Velocity cooldown check (30 seconds)
      const lastTap = tapHistoryRef.current.get(student.id);
      if (lastTap && now - lastTap < 30_000) {
        playAudioChime('warning');
        setFeedback({
          kind: 'warning',
          name: student.name,
          detail: `Already checked in ${Math.round((now - lastTap) / 1000)}s ago. Verified in room.`,
        });
        return;
      }

      // Record tap
      tapHistoryRef.current.set(student.id, now);
      playAudioChime('success');
      const timeStr = new Intl.DateTimeFormat([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date());

      const record: TapRecord = {
        studentId: student.id,
        name: student.name,
        rollNumber: student.rollNumber,
        timestamp: timeStr,
        isShadow: student.studentId === student.id,
      };

      setFeedback({
        kind: 'success',
        name: student.name,
        rollNumber: student.rollNumber,
        detail: `Verified at doorway · ${timeStr}`,
      });

      setArrivals((prev) => [record, ...prev]);

      // Update student status in memory
      const updatedStudents = students.map((s) =>
        s.id === student.id ? { ...s, status: 'present' as AttendanceStatus } : s,
      );
      setStudents(updatedStudents);

      // Persist to local attendance draft so /workspace roll call reflects the tap
      if (mode === 'explore') {
        saveExploreAttendance(todayStr, updatedStudents);
      } else if (mode === 'account' && subjectId && scope && selectedClassroom) {
        const draftScope: AccountAttendanceDraftScope = {
          accountId: subjectId,
          bondId: scope.bondId,
          entityId: scope.entityId,
          classroomId: selectedClassroom.id,
          date: todayStr,
        };
        saveAccountAttendanceDraft(draftScope, updatedStudents);
      }

      // Async backend sync if in account mode
      if (mode === 'account' && student.studentId && selectedClassroom) {
        try {
          await orpcClient.attendance.batchRecord({
            body: [
              {
                gradeClassId: selectedClassroom.id,
                studentId: student.studentId,
                status: 'present',
                date: todayStr,
              },
            ],
          });
        } catch {
          // Buffered in local draft
        }
      }
    },
    [mode, scope, selectedClassroom, students, subjectId, todayStr],
  );

  // USB / HID Barcode / RFID keyboard listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't intercept if user is typing in a dedicated input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const now = Date.now();
      // Reset buffer if delay between keystrokes > 200ms (human typing vs hardware scanner)
      if (now - lastKeyTimeRef.current > 200 && keyBufferRef.current.length > 0) {
        keyBufferRef.current = '';
      }
      lastKeyTimeRef.current = now;

      if (event.key === 'Enter') {
        const token = keyBufferRef.current;
        keyBufferRef.current = '';
        if (token) {
          event.preventDefault();
          void processBadgeToken(token);
        }
      } else if (event.key.length === 1) {
        keyBufferRef.current += event.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [processBadgeToken]);

  // Camera toggle
  const toggleCamera = async () => {
    if (cameraActive) {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
      return;
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        void videoRef.current.play();
        setCameraActive(true);

        // Continuous BarcodeDetector frame polling if natively supported by browser engine
        if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
          try {
            const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
            let scanActive = true;
            const scanFrame = async () => {
              if (!scanActive || !videoRef.current) return;
              try {
                if (videoRef.current.readyState >= 2) {
                  const barcodes = await barcodeDetector.detect(videoRef.current);
                  if (barcodes.length > 0 && barcodes[0]?.rawValue) {
                    void processBadgeToken(barcodes[0].rawValue);
                  }
                }
              } catch {
                // Ignore transient frame detect error
              }
              if (scanActive) requestAnimationFrame(scanFrame);
            };
            requestAnimationFrame(scanFrame);
          } catch {
            // Fallback: standard hardware keystroke scanner / NFC reader active
          }
        }
      }
    } catch {
      setFeedback({
        kind: 'error',
        detail: 'Camera access denied or unavailable on this device.',
      });
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    void processBadgeToken(manualCode.trim());
    setManualCode('');
  };

  const presentCount = students.filter((s) => s.status === 'present').length;

  return (
    <div className={styles.kioskContainer}>
      <header className={styles.kioskHeader}>
        <div>
          <h1 className={styles.headerTitle}>Doorway Ingress Kiosk</h1>
          <p className={styles.headerSubtitle}>
            {selectedClassroom?.name ?? 'Classroom'} · High-Throughput Contactless Badge & Card
            Ingress
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {classrooms.length > 1 ? (
            <select
              value={selectedClassroom?.id ?? ''}
              onChange={(e) => {
                const next = classrooms.find((c) => c.id === e.target.value);
                if (next) setSelectedClassroom(next);
              }}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
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
          ) : null}
          <Link href="/workspace/badges" className={styles.exitLink}>
            📇 Print Badges
          </Link>
          <Link href="/workspace" className={styles.exitLink}>
            ← Roll Call
          </Link>
        </div>
      </header>

      <div className={styles.kioskGrid}>
        {/* Main Scanner Card */}
        <section
          className={`${styles.scannerCard} ${
            feedback.kind === 'success'
              ? styles.scannerCardSuccess
              : feedback.kind === 'warning'
                ? styles.scannerCardWarning
                : feedback.kind === 'error'
                  ? styles.scannerCardError
                  : styles.scannerCardIdle
          }`}
          aria-live="polite"
        >
          {feedback.kind === 'idle' ? (
            <>
              <div className={styles.tapTargetIcon}>⚡</div>
              <h2 className={styles.tapPrompt}>Tap Card or Scan Badge</h2>
              <p className={styles.tapDetail}>
                Hold student ID card against the contactless reader or position badge QR code before
                the camera.
              </p>
            </>
          ) : feedback.kind === 'success' ? (
            <div className={`${styles.badgePulseDisplay} ${styles.badgePulseSuccess}`}>
              <p className={styles.badgeStudentName}>
                {feedback.name}
                {feedback.rollNumber ? ` (#${feedback.rollNumber})` : ''}
              </p>
              <p className={styles.badgeStudentMeta}>✅ {feedback.detail}</p>
            </div>
          ) : feedback.kind === 'warning' ? (
            <div className={`${styles.badgePulseDisplay} ${styles.badgePulseWarning}`}>
              <p className={styles.badgeStudentName}>{feedback.name}</p>
              <p className={styles.badgeStudentMeta}>⚠️ {feedback.detail}</p>
            </div>
          ) : (
            <div className={`${styles.badgePulseDisplay} ${styles.badgePulseError}`}>
              <p className={styles.badgeStudentName}>Access Notice</p>
              <p className={styles.badgeStudentMeta}>❌ {feedback.detail}</p>
            </div>
          )}

          {cameraActive ? (
            <div className={styles.cameraFeedWrapper}>
              <video ref={videoRef} className={styles.cameraVideo} playsInline muted />
            </div>
          ) : null}

          <button type="button" className={styles.cameraToggleBtn} onClick={toggleCamera}>
            {cameraActive ? 'Turn Off Camera Scanner' : '📷 Open Camera Scanner'}
          </button>

          <form onSubmit={handleManualSubmit} className={styles.manualInputForm}>
            <input
              type="text"
              className={styles.manualInput}
              placeholder="Or enter roll # or badge UID..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
            />
            <button type="submit" className={styles.manualSubmitBtn}>
              Submit
            </button>
          </form>

          {burstWarning ? (
            <div className={styles.burstWarning} role="alert">
              ⚠️ <strong>Velocity Alert:</strong> Multiple rapid taps detected (&gt;5 taps in 2s).
              Please ensure individual students tap their own cards.
            </div>
          ) : null}
        </section>

        {/* Live Arrival Stream Card */}
        <section className={styles.streamCard}>
          <div className={styles.streamHeader}>
            <h2 className={styles.streamTitle}>Today's Verified Arrivals</h2>
            <span className={styles.streamCountBadge}>
              {presentCount} / {students.length} Present
            </span>
          </div>

          {arrivals.length === 0 ? (
            <p
              style={{
                color: '#71695f',
                fontSize: '0.9rem',
                textAlign: 'center',
                marginTop: '3rem',
              }}
            >
              No card taps recorded yet today. Students tapping their cards will appear here in real
              time.
            </p>
          ) : (
            <ul className={styles.streamList}>
              {arrivals.map((item, idx) => (
                <li key={`${item.studentId}-${idx}`} className={styles.streamItem}>
                  <div className={styles.streamItemInfo}>
                    <span className={styles.streamItemName}>
                      {item.name}
                      {item.isShadow ? (
                        <span
                          style={{ fontSize: '0.7rem', color: '#9d5b25', marginLeft: '0.4rem' }}
                        >
                          [Shadow]
                        </span>
                      ) : null}
                    </span>
                    <span className={styles.streamItemRoll}>
                      Roll #{item.rollNumber ?? '—'} · ID: {item.studentId.slice(0, 8)}
                    </span>
                  </div>
                  <span className={styles.streamItemTime}>{item.timestamp}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
