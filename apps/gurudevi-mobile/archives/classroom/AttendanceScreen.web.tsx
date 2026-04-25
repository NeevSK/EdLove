/**
 * AttendanceScreen.web.tsx
 * Web equivalent of packages/classroom/src/screens/AttendanceScreen.tsx
 * Uses plain HTML+CSS (no React Native components).
 */

import { useNavigation, useRoute } from '@react-navigation/native';
import { api, growthSignalsAPI, type StudentAttendance, useStore } from '@repo/core';
import { Check, ChevronLeft, Clock, Save, X } from 'lucide-react-native';
import type React from 'react';
import { useEffect, useState } from 'react';

type Status = 'present' | 'absent' | 'late';

const STATUS_CONFIG: Record<
  Status,
  {
    label: string;
    color: string;
    bg: string;
    Icon: React.ComponentType<{ size?: number; color?: string }>;
  }
> = {
  present: { label: 'Present', color: '#16a34a', bg: 'rgba(34,197,94,0.10)', Icon: Check },
  late: { label: 'Late', color: '#d97706', bg: 'rgba(245,158,11,0.10)', Icon: Clock },
  absent: { label: 'Absent', color: '#dc2626', bg: 'rgba(239,68,68,0.10)', Icon: X },
};

export default function AttendanceScreenWeb() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { classroomId, classroomName } = route.params ?? {};
  const { user } = useStore();

  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!classroomId) return;
    (async () => {
      setLoading(true);
      try {
        const data = await api.classroomStudents.getAll(classroomId);
        setStudents(
          data.map((s) => ({
            id: s.id,
            student_id: s.student_id || s.id,
            full_name: s.full_name,
            roll_number: s.roll_number,
            status: 'present' as Status,
          })),
        );
      } catch (e: any) {
        setError(e?.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    })();
  }, [classroomId]);

  const toggle = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const cycle: Status[] = ['present', 'late', 'absent'];
        const next = cycle[(cycle.indexOf(s.status as Status) + 1) % 3];
        return { ...s, status: next };
      }),
    );
    setSaved(false);
  };

  const setAll = (status: Status) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.attendance.batchRecord(
        students.map((s) => ({
          classroom_id: classroomId,
          student_id: s.student_id,
          status: s.status,
          date: new Date().toISOString().split('T')[0],
        })),
      );
      if (user?.id) {
        growthSignalsAPI
          .emitSignal(user.id, 'attendance_marked', { classroom_id: classroomId })
          .catch(() => {});
      }
      setSaved(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const counts = students.reduce(
    (acc, s) => {
      acc[s.status as Status] = (acc[s.status as Status] ?? 0) + 1;
      return acc;
    },
    {} as Record<Status, number>,
  );

  const today = new Date().toLocaleDateString('en-LK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="sanctuary-screen">
      <div className="sanctuary-container" style={{ maxWidth: '700px' }}>
        {/* Back + heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <button
            onClick={() => navigation.goBack()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--glass-surface)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--ink-ghost)',
            }}
          >
            <ChevronLeft size={14} /> Back
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>
              Attendance — {classroomName}
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--ink-ghost)' }}>
              {today}
            </p>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-ghost)' }}>
            Loading class list…
          </div>
        )}

        {!loading && error && (
          <div
            style={{
              padding: '16px',
              background: 'rgba(239,68,68,0.08)',
              borderRadius: '10px',
              color: 'var(--ember)',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Summary bar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {(Object.keys(STATUS_CONFIG) as Status[]).map((s) => {
                const Icon = STATUS_CONFIG[s].Icon;
                return (
                  <div
                    key={s}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '100px',
                      background: STATUS_CONFIG[s].bg,
                      border: `1px solid ${STATUS_CONFIG[s].color}33`,
                    }}
                  >
                    <Icon size={13} color={STATUS_CONFIG[s].color} />
                    <span
                      style={{ fontSize: '13px', fontWeight: '700', color: STATUS_CONFIG[s].color }}
                    >
                      {counts[s] ?? 0} {STATUS_CONFIG[s].label}
                    </span>
                  </div>
                );
              })}
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '12px',
                  color: 'var(--ink-ghost)',
                  alignSelf: 'center',
                }}
              >
                {students.length} students total
              </span>
            </div>

            {/* Mark all buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: 'var(--ink-ghost)',
                  alignSelf: 'center',
                  marginRight: '4px',
                }}
              >
                Mark all:
              </span>
              {(Object.keys(STATUS_CONFIG) as Status[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setAll(s)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${STATUS_CONFIG[s].color}55`,
                    background: STATUS_CONFIG[s].bg,
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: STATUS_CONFIG[s].color,
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>

            {/* Student list */}
            <div
              className="sanctuary-card"
              style={{ padding: 0, overflow: 'hidden', marginBottom: '20px' }}
            >
              {students.map((s, i) => {
                const cfg = STATUS_CONFIG[s.status as Status];
                return (
                  <div
                    key={s.id}
                    onClick={() => toggle(s.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '14px 20px',
                      borderBottom:
                        i < students.length - 1 ? '1px solid var(--border-light)' : 'none',
                      cursor: 'pointer',
                      background: 'transparent',
                      transition: 'background 0.12s',
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = 'var(--background-alt)')
                    }
                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Roll number */}
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: 'var(--ink-ghost)',
                        minWidth: '32px',
                      }}
                    >
                      {s.roll_number ?? i + 1}
                    </span>
                    {/* Name */}
                    <span
                      style={{ flex: 1, fontSize: '14px', fontWeight: '600', color: 'var(--ink)' }}
                    >
                      {s.full_name}
                    </span>
                    {/* Status badge */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px',
                        borderRadius: '100px',
                        background: cfg.bg,
                        border: `1px solid ${cfg.color}44`,
                        minWidth: '90px',
                        justifyContent: 'center',
                      }}
                    >
                      <cfg.Icon size={13} color={cfg.color} />
                      <span style={{ fontSize: '12px', fontWeight: '700', color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save button */}
            {saved ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center',
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(34,197,94,0.10)',
                  color: 'var(--moss)',
                  fontWeight: '700',
                  fontSize: '14px',
                }}
              >
                <Check size={18} /> Attendance saved for today
              </div>
            ) : (
              <button
                className="premium-button"
                style={{
                  width: '100%',
                  background: 'var(--sanctuary-saffron)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px',
                }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  '⏳ Saving…'
                ) : (
                  <>
                    <Save size={15} /> Complete Marking
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
