import React, { useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useGradebook } from '../hooks/useGradebook';
import type { SortOption } from '../hooks/useGradebook';
import { ClassroomGradingSettings, growthSignalsAPI, useStore } from '@repo/core';
import { ChevronLeft, Settings2, TrendingUp, Users, Award, Edit3, Check, X } from 'lucide-react-native';

function GradeModal({
  studentName,
  current,
  maxMarks,
  onSave,
  onClose,
}: {
  studentName: string;
  current?: { marks: number; feedback?: string };
  maxMarks: number;
  onSave: (marks: number, feedback: string) => Promise<void>;
  onClose: () => void;
}) {
  const [marks, setMarks] = useState(String(current?.marks ?? ''));
  const [feedback, setFeedback] = useState(current?.feedback ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const numericMarks = Number(marks);
    if (Number.isNaN(numericMarks) || numericMarks < 0 || numericMarks > maxMarks) {
      setError(`Marks must be between 0 and ${maxMarks}`);
      return;
    }

    setSaving(true);
    try {
      await onSave(numericMarks, feedback);
      onClose();
    } catch (caughtError: any) {
      setError(caughtError?.message || 'Failed to save grade');
      setSaving(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div style={{ background: 'var(--background)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '400px', margin: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: '0 0 2px', fontSize: '17px', fontWeight: '800' }}>Grade Entry</h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-ghost)' }}>{studentName}</p>
          </div>
          <button onClick={onClose} style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} color="var(--ink-ghost)" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ink-ghost)', display: 'block', marginBottom: '6px' }}>
              Marks (0-{maxMarks})
            </label>
            <input
              type="number"
              value={marks}
              onChange={(event) => {
                setMarks(event.target.value);
                setError('');
              }}
              min={0}
              max={maxMarks}
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '10px', border: `1.5px solid ${error ? 'var(--ember)' : 'var(--border)'}`, background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '18px', fontWeight: '700' }}
            />
            {error ? <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--ember)' }}>{error}</p> : null}
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ink-ghost)', display: 'block', marginBottom: '6px' }}>
              Feedback (optional)
            </label>
            <textarea
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              placeholder="e.g. Excellent work on the last question..."
              rows={3}
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '13px', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} className="secondary-button" style={{ flex: 1 }}>Cancel</button>
            <button onClick={handleSave} className="premium-button" style={{ flex: 2, background: 'var(--sanctuary-saffron)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={saving}>
              {saving ? '...' : <Check size={14} />} Save Grade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsModal({
  current,
  onSave,
  onClose,
}: {
  current: ClassroomGradingSettings;
  onSave: (settings: Omit<ClassroomGradingSettings, 'classroom_id'>) => Promise<ClassroomGradingSettings>;
  onClose: () => void;
}) {
  const [gradingMode, setGradingMode] = useState<ClassroomGradingSettings['grading_mode']>(current.grading_mode);
  const [showRanks, setShowRanks] = useState(current.show_ranks);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ grading_mode: gradingMode, show_ranks: showRanks });
      onClose();
    } catch {
      setSaving(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div style={{ background: 'var(--background)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '360px', margin: '16px' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: '800' }}>Grading Settings</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ink-ghost)', display: 'block', marginBottom: '6px' }}>
              Grading Mode
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
              {(['marks', 'gpa', 'both'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setGradingMode(mode)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: `1.5px solid ${gradingMode === mode ? 'var(--sanctuary-saffron)' : 'var(--border)'}`,
                    background: gradingMode === mode ? 'rgba(245,158,11,0.12)' : 'var(--background-alt)',
                    color: 'var(--ink)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {mode === 'marks' ? 'Marks' : mode === 'gpa' ? 'GPA' : 'Both'}
                </button>
              ))}
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>
            <input type="checkbox" checked={showRanks} onChange={(event) => setShowRanks(event.target.checked)} />
            Show student ranks
          </label>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} className="secondary-button" style={{ flex: 1 }}>Cancel</button>
          <button onClick={handleSave} className="premium-button" style={{ flex: 2, background: 'var(--sanctuary-saffron)' }} disabled={saving}>
            {saving ? '...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GradebookScreenWeb() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { classroomId, classroomName } = route.params ?? {};
  const { user } = useStore();

  const { sortedGrades, studentNames, gradingSettings, isLoading, error, sortBy, setSortBy, stats, updateSettings, submitGrade } = useGradebook(classroomId ?? '');

  const [gradingId, setGradingId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const maxMarks = 100;
  const passingMarks = 50;
  const passRate =
    stats.totalStudents > 0
      ? Math.round(
          (sortedGrades.filter((grade) => (grade.marks ?? 0) >= passingMarks).length / stats.totalStudents) * 100,
        )
      : 0;
  const sorts: { id: SortOption; label: string }[] = [
    { id: 'rank', label: 'By Rank' },
    { id: 'marks', label: 'By Marks' },
    { id: 'name', label: 'By Name' },
  ];

  const gradingStudent = gradingId ? sortedGrades.find((grade) => grade.student_id === gradingId) : null;

  const handleSave = async (marks: number, feedback: string) => {
    if (!gradingId) return;
    await submitGrade(gradingId, marks, feedback);
    if (user?.id) {
      growthSignalsAPI.emitSignal(user.id, 'assignment_graded', { classroom_id: classroomId }).catch(() => {});
    }
  };

  return (
    <div className="sanctuary-screen">
      <div className="sanctuary-container" style={{ maxWidth: '780px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigation.goBack()}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--glass-surface)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-ghost)' }}
          >
            <ChevronLeft size={14} /> Back
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Gradebook - {classroomName}</h2>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--glass-surface)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ink-ghost)', fontWeight: '700' }}
          >
            <Settings2 size={14} /> Settings
          </button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-ghost)' }}>Loading gradebook...</div>
        ) : error ? (
          <div style={{ padding: '16px', background: 'rgba(239,68,68,0.08)', borderRadius: '10px', color: 'var(--ember)', fontSize: '13px' }}>{error}</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div className="sanctuary-card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--water)' }}>
                  <Users size={14} /> <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>Students</span>
                </div>
                <div style={{ marginTop: '10px', fontSize: '24px', fontWeight: '800' }}>{stats.totalStudents}</div>
              </div>
              <div className="sanctuary-card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--lotus)' }}>
                  <TrendingUp size={14} /> <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>Average</span>
                </div>
                <div style={{ marginTop: '10px', fontSize: '24px', fontWeight: '800' }}>{stats.averageMarks}</div>
              </div>
              <div className="sanctuary-card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--moss)' }}>
                  <Award size={14} /> <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>Pass Rate</span>
                </div>
                <div style={{ marginTop: '10px', fontSize: '24px', fontWeight: '800' }}>{passRate}%</div>
              </div>
              <div className="sanctuary-card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sanctuary-saffron)' }}>
                  <Edit3 size={14} /> <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>Mode</span>
                </div>
                <div style={{ marginTop: '10px', fontSize: '16px', fontWeight: '800', textTransform: 'capitalize' }}>{gradingSettings?.grading_mode ?? 'marks'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {sorts.map((sort) => (
                <button
                  key={sort.id}
                  onClick={() => setSortBy(sort.id)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${sortBy === sort.id ? 'var(--sanctuary-saffron)' : 'var(--border)'}`,
                    background: sortBy === sort.id ? 'rgba(245,158,11,0.12)' : 'var(--glass-surface)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: sortBy === sort.id ? 'var(--sanctuary-saffron)' : 'var(--ink-ghost)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {sort.label}
                </button>
              ))}
            </div>

            <div className="sanctuary-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1.2fr 110px 110px 120px', gap: '12px', padding: '14px 20px', borderBottom: '1px solid var(--border-light)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ink-ghost)' }}>
                <span>Rank</span>
                <span>Student</span>
                <span>Marks</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {sortedGrades.map((grade) => {
                const marks = grade.marks ?? 0;
                const statusColor = marks >= passingMarks ? 'var(--moss)' : 'var(--ember)';
                return (
                  <div
                    key={grade.student_id}
                    style={{ display: 'grid', gridTemplateColumns: '60px 1.2fr 110px 110px 120px', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--border-light)', alignItems: 'center' }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--ink)' }}>#{grade.rank ?? '-'}</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700' }}>{studentNames[grade.student_id] ?? 'Student'}</div>
                      {grade.feedback ? <div style={{ fontSize: '12px', color: 'var(--ink-ghost)', marginTop: '2px' }}>{grade.feedback}</div> : null}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--ink)' }}>{marks}/{maxMarks}</span>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: statusColor }}>{marks >= passingMarks ? 'Passing' : 'Needs support'}</span>
                    <button
                      onClick={() => setGradingId(grade.student_id)}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--glass-surface)', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: 'var(--ink)' }}
                    >
                      {grade.marks === null || grade.marks === undefined ? 'Grade' : 'Edit'}
                    </button>
                  </div>
                );
              })}
            </div>

            {gradingStudent ? (
              <GradeModal
                studentName={studentNames[gradingStudent.student_id] ?? 'Student'}
                current={gradingStudent.marks === null || gradingStudent.marks === undefined ? undefined : { marks: gradingStudent.marks, feedback: gradingStudent.feedback ?? '' }}
                maxMarks={maxMarks}
                onSave={handleSave}
                onClose={() => setGradingId(null)}
              />
            ) : null}

            {showSettings && gradingSettings ? (
              <SettingsModal current={gradingSettings} onSave={updateSettings} onClose={() => setShowSettings(false)} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
