import React, { useEffect, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { api, StudentAttendance, AttendanceRecord, growthSignalsAPI, useStore } from '@repo/core';
import { Check, X, Clock, ChevronLeft, Save } from 'lucide-react-native';

type Status = 'present' | 'absent' | 'late';

const STATUS_CONFIG: Record<
  Status,
  { label: string; color: string; bg: string; Icon: React.ComponentType<{ size?: number; color?: string }> }
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
    void (async () => {
      setLoading(true);
      try {
        const attendanceDate = new Date().toISOString().split('T')[0] || new Date().toISOString();
        const [data, snapshot] = await Promise.all([
          api.classroomStudents.getAll(classroomId),
          api.attendance.getClassroomAttendanceSnapshot(classroomId, attendanceDate)
            .catch(() => ({ records: [] as AttendanceRecord[] })),
        ]);
        const savedStatus = new Map<string, string>(
          snapshot.records.map((record) => [record.student_id, record.status] as [string, string]),
        );
        setStudents(
          data.map((student) => ({
            id: student.id,
            student_id: student.student_id || student.id,
            full_name: student.full_name,
            roll_number: student.roll_number,
            status: (savedStatus.get(student.student_id || student.id) ?? 'present') as Status,
          })),
        );
      } catch (caughtError: any) {
        setError(caughtError?.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    })();
  }, [classroomId]);

  const toggle = (id: string) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== id) return student;
        const cycle: Status[] = ['present', 'late', 'absent'];
        const currentIndex = cycle.indexOf(student.status as Status);
        const next = cycle[(currentIndex + 1) % cycle.length] ?? 'present';
        return { ...student, status: next };
      }),
    );
    setSaved(false);
  };

  const setAll = (status: Status) => {
    setStudents((prev) => prev.map((student) => ({ ...student, status })));
    setSaved(false);
  };

  const attendanceDate = new Date().toISOString().split('T')[0] || new Date().toISOString();

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.attendance.batchRecord(
        students.map((student) => ({
          classroom_id: classroomId,
          student_id: student.student_id,
          status: student.status,
          date: attendanceDate,
        })),
        {
          actorId: user?.id,
          reason: 'daily_roll_call',
          accessKind: 'teacher_marking',
        },
      );
      if (user?.id) {
      growthSignalsAPI.emitSilent({
        user_id: user.id,
        event_type: 'attendance_marked',
        event_metadata: { classroom_id: classroomId },
      });
      }
      setSaved(true);
    } catch (caughtError: any) {
      setError(caughtError?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const counts = students.reduce((acc, student) => {
    acc[student.status as Status] = (acc[student.status as Status] ?? 0) + 1;
    return acc;
  }, {} as Record<Status, number>);

  const today = new Date(attendanceDate).toLocaleDateString('en-LK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="sanctuary-screen">
      <div className="sanctuary-container" style={{ maxWidth: '700px' }}>
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
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Attendance - {classroomName}</h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--ink-ghost)' }}>{today}</p>
          </div>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-ghost)' }}>Loading class list...</div>}

        {!loading && error && (
          <div style={{ padding: '16px', background: 'rgba(239,68,68,0.08)', borderRadius: '10px', color: 'var(--ember)', fontSize: '13px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {(Object.keys(STATUS_CONFIG) as Status[]).map((status) => {
                const config = STATUS_CONFIG[status];
                const Icon = config.Icon;
                return (
                  <div
                    key={status}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '100px',
                      background: config.bg,
                      border: `1px solid ${config.color}33`,
                    }}
                  >
                    <Icon size={13} color={config.color} />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: config.color }}>
                      {counts[status] ?? 0} {config.label}
                    </span>
                  </div>
                );
              })}
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--ink-ghost)', alignSelf: 'center' }}>
                {students.length} students total
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-ghost)', alignSelf: 'center', marginRight: '4px' }}>
                Mark all:
              </span>
              {(Object.keys(STATUS_CONFIG) as Status[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setAll(status)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${STATUS_CONFIG[status].color}55`,
                    background: STATUS_CONFIG[status].bg,
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: STATUS_CONFIG[status].color,
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {STATUS_CONFIG[status].label}
                </button>
              ))}
            </div>

            <div className="sanctuary-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
              {students.map((student, index) => {
                const config = STATUS_CONFIG[student.status as Status];
                return (
                  <div
                    key={student.id}
                    onClick={() => toggle(student.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '14px 20px',
                      borderBottom: index < students.length - 1 ? '1px solid var(--border-light)' : 'none',
                      cursor: 'pointer',
                      background: 'transparent',
                      transition: 'background 0.12s',
                    }}
                    onMouseOver={(event) => {
                      event.currentTarget.style.background = 'var(--background-alt)';
                    }}
                    onMouseOut={(event) => {
                      event.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-ghost)', minWidth: '32px' }}>
                      {student.roll_number ?? index + 1}
                    </span>
                    <span style={{ flex: 1, fontSize: '14px', fontWeight: '600', color: 'var(--ink)' }}>{student.full_name}</span>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px',
                        borderRadius: '100px',
                        background: config.bg,
                        border: `1px solid ${config.color}44`,
                        minWidth: '90px',
                        justifyContent: 'center',
                      }}
                    >
                      <config.Icon size={13} color={config.color} />
                      <span style={{ fontSize: '12px', fontWeight: '700', color: config.color }}>{config.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>

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
                  cursor: 'pointer',
                }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? '... Saving...' : <><Save size={15} /> Complete Marking</>}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
