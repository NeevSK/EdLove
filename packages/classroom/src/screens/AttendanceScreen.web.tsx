import { api, growthSignalsAPI } from '@repo/core/api/client';
import { type StudentAttendance } from '@repo/core/logic';
import { useAuthStore } from '@repo/core/store';
import type { AttendanceRecord } from '@repo/core/types';
import { generateIdempotencyKey } from '@repo/core/utils';

import { Check, ChevronLeft, Clock, Save, X } from '@repo/ui/icons';
import { Icon } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { safeBack } from '@repo/ui/utils/navigation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type React from 'react';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';

type Status = 'present' | 'absent' | 'late';

interface AttendanceState {
  students: StudentAttendance[];
  loading: boolean;
  saving: boolean;
  saved: boolean;
  error: string;
  saveError: string;
}

type AttendanceAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: StudentAttendance[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'TOGGLE_STUDENT'; payload: string }
  | { type: 'SET_ALL'; payload: Status }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'SAVE_ERROR'; payload: string };

const initialState: AttendanceState = {
  students: [],
  loading: true,
  saving: false,
  saved: false,
  error: '',
  saveError: '',
};

function attendanceReducer(state: AttendanceState, action: AttendanceAction): AttendanceState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, students: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'TOGGLE_STUDENT':
      return {
        ...state,
        saved: false,
        students: state.students.map((s) => {
          if (s.id !== action.payload) return s;
          const cycle: Status[] = ['present', 'late', 'absent'];
          const currentIndex = cycle.indexOf(s.status as Status);
          const next = cycle[(currentIndex + 1) % cycle.length] ?? 'present';
          return { ...s, status: next };
        }),
      };
    case 'SET_ALL':
      return {
        ...state,
        saved: false,
        students: state.students.map((s) => ({ ...s, status: action.payload })),
      };
    case 'SAVE_START':
      return { ...state, saving: true, saveError: '' };
    case 'SAVE_SUCCESS':
      return { ...state, saving: false, saved: true };
    case 'SAVE_ERROR':
      return { ...state, saving: false, saveError: action.payload };
    default:
      return state;
  }
}

const STATUS_CONFIG: Record<
  Status,
  {
    label: string;
    color: string;
    bg: string;
    Icon: React.ComponentType<{ size?: number; color?: string }>;
  }
> = {
  present: {
    label: 'Present',
    color: tokens.semantic.status.success,
    bg: 'rgba(91,140,79,0.12)',
    Icon: Check,
  },
  late: {
    label: 'Late',
    color: tokens.semantic.status.warning,
    bg: 'rgba(212,160,58,0.14)',
    Icon: Clock,
  },
  absent: {
    label: 'Absent',
    color: tokens.semantic.status.error,
    bg: 'rgba(198,79,62,0.12)',
    Icon: X,
  },
};

export default function AttendanceScreenWeb() {
  const router = useRouter();
  const { t } = useTranslation();
  const { classroomId = '', classroomName = 'Classroom' } = useLocalSearchParams<{
    classroomId?: string;
    classroomName?: string;
  }>();
  const user = useAuthStore((state) => state.user);

  const [state, dispatch] = useReducer(attendanceReducer, initialState);

  const loadData = useCallback(async () => {
    if (!classroomId) {
      dispatch({ type: 'FETCH_ERROR', payload: 'No classroom selected' });
      return;
    }
    dispatch({ type: 'FETCH_START' });
    try {
      const attendanceDate = new Date().toISOString().split('T')[0] || new Date().toISOString();
      const [data, snapshot] = await Promise.all([
        api.classroomStudents.getAll(classroomId),
        api.attendance.getClassroomAttendanceSnapshot(classroomId, attendanceDate),
      ]);
      const savedStatus = new Map<string, string>(
        snapshot.records.map(
          (record: AttendanceRecord) => [record.student_id, record.status] as [string, string],
        ),
      );
      const mappedStudents = data.map(
        (student: {
          id: string;
          student_id?: string | null;
          full_name: string;
          roll_number?: string | null;
        }) => ({
          id: student.id,
          student_id: student.student_id || student.id,
          full_name: student.full_name,
          roll_number: student.roll_number,
          status: (savedStatus.get(student.student_id || student.id) ?? 'present') as Status,
        }),
      );
      dispatch({ type: 'FETCH_SUCCESS', payload: mappedStudents });
    } catch (err: any) {
      dispatch({
        type: 'FETCH_ERROR',
        payload: err?.message || 'Failed to load students',
      });
    }
  }, [classroomId]);

  useEffect(() => {
    void loadData();
    /* loadData is stable for the selected classroom. */
  }, [loadData]);


  const toggle = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_STUDENT', payload: id });
  }, []);

  const setAll = useCallback((status: Status) => {
    dispatch({ type: 'SET_ALL', payload: status });
  }, []);

  const attendanceDate = useMemo(
    () => new Date().toISOString().split('T')[0] || new Date().toISOString(),
    [],
  );

  const handleSave = async () => {
    dispatch({ type: 'SAVE_START' });
    try {
      await api.attendance.batchRecord(
        state.students.map((student) => ({
          classroom_id: classroomId,
          student_id: student.student_id,
          status: student.status,
          date: attendanceDate,
        })),
        {
          actorId: user?.id,
          reason: 'daily_roll_call',
          accessKind: 'teacher_marking',
          idempotencyKey: generateIdempotencyKey('attendance'),
        },
      );
      if (user?.id) {
        growthSignalsAPI.emitSilent({
          user_id: user.id,
          event_type: 'attendance_marked',
          event_metadata: { classroom_id: classroomId },
        });
      }
      dispatch({ type: 'SAVE_SUCCESS' });
    } catch (err: any) {
      dispatch({
        type: 'SAVE_ERROR',
        payload: err?.message || 'Failed to save attendance',
      });
    }
  };

  const counts = useMemo(
    () =>
      state.students.reduce(
        (acc, student) => {
          acc[student.status as Status] = (acc[student.status as Status] ?? 0) + 1;
          return acc;
        },
        {} as Record<Status, number>,
      ),
    [state.students],
  );

  const today = useMemo(
    () =>
      new Date(attendanceDate).toLocaleDateString('en-LK', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [attendanceDate],
  );

  const { students, loading, saving, saved, error, saveError } = state;
  const statusLabels: Record<Status, string> = {
    present: t('attendance.status.present') || STATUS_CONFIG.present.label,
    late: t('attendance.status.late') || STATUS_CONFIG.late.label,
    absent: t('attendance.status.absent') || STATUS_CONFIG.absent.label,
  };

  return (
    <div className="sanctuary-screen" style={{ background: tokens.semantic.surface.page }}>
      <div className="sanctuary-container" style={{ maxWidth: '820px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '28px',
          }}
        >
          <button
            aria-label={`Back to workspace from ${classroomName}`}
            onClick={() => safeBack('/workspace')}
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
            <Icon as={ChevronLeft} size={14} /> Back
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>
              {t('attendance.sheet.title') || 'Attendance'} · {classroomName}
            </h2>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: '12px',
                color: 'var(--ink-ghost)',
              }}
            >
              {today}
            </p>
          </div>
        </div>

        {loading && (
          <div
            role="status"
            aria-live="polite"
            style={{
              textAlign: 'center',
              padding: '60px 0',
              color: 'var(--ink-ghost)',
            }}
          >
            {t('common.loading') || 'Loading class list…'}
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            style={{
              padding: '16px',
              background: 'rgba(239,68,68,0.08)',
              borderRadius: '10px',
              color: 'var(--ember)',
              fontSize: '13px',
              marginBottom: '20px',
            }}
          >
            {error}
            <button
              type="button"
              onClick={() => void loadData()}
              style={{
                display: 'block',
                margin: '12px auto 0',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid currentColor',
                background: 'transparent',
                color: 'inherit',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '20px',
                flexWrap: 'wrap',
              }}
            >
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
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: config.color,
                      }}
                    >
                      {counts[status] ?? 0} {statusLabels[status]}
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
              {(Object.keys(STATUS_CONFIG) as Status[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  aria-label={`Mark all students ${statusLabels[status].toLowerCase()}`}
                  onClick={() => setAll(status)}
                  disabled={students.length === 0}
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
                  {statusLabels[status]}
                </button>
              ))}
            </div>

            <div
              className="sanctuary-card"
              style={{ padding: 0, overflow: 'hidden', marginBottom: '20px' }}
            >
              {students.length === 0 ? (
                <div
                  style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--ink-ghost)' }}
                >
                  No students are currently enrolled in this classroom.
                </div>
              ) : (
                students.map((student, index) => {
                  const config = STATUS_CONFIG[student.status as Status];
                  return (
                    <div
                      key={student.id}
                      onClick={() => toggle(student.id)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${student.full_name}, currently ${statusLabels[student.status as Status]}. Activate to change status.`}
                      aria-pressed={student.status === 'present'}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          toggle(student.id);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '14px 20px',
                        borderBottom:
                          index < students.length - 1 ? '1px solid var(--border-light)' : 'none',
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
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: '700',
                          color: 'var(--ink-ghost)',
                          minWidth: '32px',
                        }}
                      >
                        {student.roll_number ?? index + 1}
                      </span>
                      <span
                        style={{
                          flex: 1,
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'var(--ink)',
                        }}
                      >
                        {student.full_name}
                      </span>
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
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            color: config.color,
                          }}
                        >
                          {statusLabels[student.status as Status]}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {saveError && (
              <div
                role="alert"
                style={{
                  marginBottom: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(239,68,68,0.08)',
                  color: 'var(--ember)',
                  fontSize: '13px',
                }}
              >
                {saveError}
              </div>
            )}

            {saved ? (
              <div
                role="status"
                aria-live="polite"
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
                <Icon as={Check} size={18} /> Attendance saved for today
              </div>
            ) : (
              <button
                type="button"
                aria-busy={saving}
                aria-label={saving ? 'Saving attendance' : 'Complete attendance marking'}
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
                disabled={saving || students.length === 0}
              >
                {saving ? (
                  '... Saving...'
                ) : (
                  <>
                    <Icon as={Save} size={15} /> Complete Marking
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
