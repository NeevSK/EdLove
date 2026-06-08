/**
 * TimetableScreen.web.tsx
 *
 * Weekly timetable view for principals and teachers.
 * Uses the TimetableScheduler agent to generate a draft from real school data.
 * Renders a CSS grid weekly view with period slots.
 *
 * Navigation: ClassroomStack \u2192 Timetable
 */

import { useNavigation, useRoute } from '@react-navigation/native';
import { TimetableScheduler } from '@repo/ai';
import { usePermissions, useStore } from '@repo/core/logic';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];

const DAY_SHORT: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
};

export default function TimetableScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const { user } = useStore();
  const { context } = usePermissions();
  const _hasBonds = context.bonds.length > 0;

  const schoolId: string = route.params?.schoolId ?? user?.school_id ?? '';

  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);

  const generate = useCallback(async () => {
    if (!schoolId) {
      setError('No school context. Please complete your profile first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await TimetableScheduler.generateDraft(schoolId, {
        maxDailyPeriods: 7,
        mandatorySubjects: [
          'Mathematics',
          'Science',
          'Sinhala',
          'English',
          'History',
          'ICT',
          'Art',
        ],
        teacherPreferences: true,
      });
      setDraft(result);
      // Default: select first classroom
      const first = Object.keys(result.schedule ?? {})[0] ?? null;
      setSelectedClassroomId(first);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate timetable.');
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    generate();
  }, [generate]);

  const classroomIds = Object.keys(draft?.schedule ?? {});
  const currentSchedule = selectedClassroomId ? (draft?.schedule?.[selectedClassroomId] ?? {}) : {};

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--background)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--surface)',
        }}
      >
        <button
          onClick={() => navigation.goBack()}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--ink-ghost)',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: '600',
            padding: '4px 8px',
            borderRadius: '8px',
          }}
        >
          \u2190 Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink)' }}>
            \uD83D\uDCC5 Weekly Timetable
          </div>
          <div style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>
            {draft?.status === 'draft'
              ? `Draft \u2014 ${draft.total_classrooms ?? 0} classroom${draft.total_classrooms !== 1 ? 's' : ''}, ${draft.total_teachers ?? 0} teacher${draft.total_teachers !== 1 ? 's' : ''}`
              : 'Generate a timetable from your school data'}
          </div>
        </div>
        <button
          className="premium-button"
          onClick={generate}
          disabled={loading || !schoolId}
          style={{ fontSize: '13px' }}
        >
          {loading ? '\u23F3 Generating\u2026' : '\uD83D\uDD04 Regenerate'}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '16px 24px',
            background: 'rgba(231,76,60,0.08)',
            borderBottom: '1px solid rgba(231,76,60,0.2)',
            color: '#c0392b',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}

      {/* Recommendations */}
      {draft?.recommendations?.length > 0 && (
        <div
          style={{
            padding: '12px 24px',
            background: 'rgba(245,158,11,0.08)',
            borderBottom: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          {draft.recommendations.map((rec: string, i: number) => (
            <div
              key={i}
              style={{
                fontSize: '12px',
                color: '#b45309',
                marginBottom: '2px',
              }}
            >
              \u26A0 {rec}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Classroom selector sidebar */}
        {classroomIds.length > 1 && (
          <div
            style={{
              width: '200px',
              flexShrink: 0,
              borderRight: '1px solid var(--border-light)',
              overflowY: 'auto',
              padding: '16px 12px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: '800',
                color: 'var(--ink-ghost)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '10px',
              }}
            >
              Classrooms
            </div>
            {classroomIds.map((id) => (
              <button
                key={id}
                onClick={() => setSelectedClassroomId(id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background:
                    selectedClassroomId === id ? 'var(--sanctuary-saffron)' : 'transparent',
                  color: selectedClassroomId === id ? 'white' : 'var(--ink)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontFamily: 'var(--font-body)',
                  marginBottom: '4px',
                  fontWeight: selectedClassroomId === id ? '700' : '400',
                }}
              >
                {draft?.classroom_names?.[id] ?? `${id.slice(0, 12)}\u2026`}
              </button>
            ))}
          </div>
        )}

        {/* Timetable grid */}
        <div
          style={{
            flex: 1,
            overflowX: 'auto',
            overflowY: 'auto',
            padding: '24px',
          }}
        >
          {loading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                color: 'var(--ink-ghost)',
                fontSize: '14px',
              }}
            >
              \u23F3 Reading classrooms and teachers\u2026
            </div>
          ) : !draft ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '40px' }}>\uD83D\uDCC5</div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '800',
                  color: 'var(--ink)',
                }}
              >
                No timetable yet
              </div>
              <button className="premium-button" onClick={generate}>
                Generate Timetable
              </button>
            </div>
          ) : classroomIds.length === 0 ? (
            <div
              style={{
                color: 'var(--ink-ghost)',
                fontSize: '14px',
                textAlign: 'center',
                paddingTop: '40px',
              }}
            >
              No classrooms found. Add classrooms in your school settings first.
            </div>
          ) : (
            <div style={{ minWidth: '700px' }}>
              {/* Grid header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px repeat(5, 1fr)',
                  gap: '4px',
                  marginBottom: '4px',
                }}
              >
                <div />
                {DAYS.map((day) => (
                  <div
                    key={day}
                    style={{
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '800',
                      color: 'var(--ink-ghost)',
                      textTransform: 'uppercase',
                      padding: '8px 4px',
                    }}
                  >
                    {DAY_SHORT[day]}
                  </div>
                ))}
              </div>

              {/* Period rows */}
              {PERIODS.map((p) => (
                <div
                  key={p}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px repeat(5, 1fr)',
                    gap: '4px',
                    marginBottom: '4px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: 'var(--ink-ghost)',
                      background: 'var(--background-alt)',
                      borderRadius: '8px',
                      padding: '4px',
                    }}
                  >
                    P{p}
                  </div>
                  {DAYS.map((day) => {
                    const slot = (currentSchedule[day] ?? []).find((s: any) => s.period === p);
                    return (
                      <div
                        key={day}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: slot ? 'var(--surface)' : 'var(--background-alt)',
                          border: '1px solid var(--border-light)',
                          minHeight: '60px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                        }}
                      >
                        {slot ? (
                          <>
                            <div
                              style={{
                                fontSize: '12px',
                                fontWeight: '700',
                                color: 'var(--ink)',
                              }}
                            >
                              {slot.subject}
                            </div>
                            <div
                              style={{
                                fontSize: '10px',
                                color: 'var(--ink-ghost)',
                              }}
                            >
                              {slot.teacher_name}
                            </div>
                          </>
                        ) : (
                          <div
                            style={{
                              fontSize: '10px',
                              color: 'var(--ink-ghost)',
                              opacity: 0.5,
                            }}
                          >
                            \u2014
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              <div
                style={{
                  marginTop: '20px',
                  fontSize: '11px',
                  color: 'var(--ink-ghost)',
                  textAlign: 'right',
                }}
              >
                Draft generated{' '}
                {draft.generated_at ? new Date(draft.generated_at).toLocaleString() : 'just now'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
