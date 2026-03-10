/**
 * GradebookScreen.web.tsx
 * Web equivalent of packages/classroom/src/screens/GradebookScreen.tsx
 * Uses useGradebook hook (pure TS) + plain HTML/CSS layout.
 */
import React, { useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useGradebook } from '@repo/classroom';
import type { SortOption } from '@repo/classroom';
import { growthSignalsAPI, useStore } from '@repo/core';
import { ChevronLeft, Settings2, TrendingUp, Users, Award, Edit3, Check, X } from 'lucide-react-native';

// ─────────────────────────────────────────────────────────────────────────────
// Grade Entry Modal
// ─────────────────────────────────────────────────────────────────────────────

function GradeModal({
    studentName, current, maxMarks,
    onSave, onClose,
}: {
    studentName: string; current?: { marks: number; feedback?: string };
    maxMarks: number; onSave: (marks: number, feedback: string) => Promise<void>; onClose: () => void;
}) {
    const [marks,    setMarks]    = useState(String(current?.marks ?? ''));
    const [feedback, setFeedback] = useState(current?.feedback ?? '');
    const [saving,   setSaving]   = useState(false);
    const [error,    setError]    = useState('');

    const handleSave = async () => {
        const m = Number(marks);
        if (isNaN(m) || m < 0 || m > maxMarks) {
            setError(`Marks must be between 0 and ${maxMarks}`);
            return;
        }
        setSaving(true);
        try { await onSave(m, feedback); onClose(); }
        catch (e: any) { setError(e?.message || 'Failed to save grade'); setSaving(false); }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
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
                            Marks (0–{maxMarks})
                        </label>
                        <input
                            type="number" value={marks} onChange={e => { setMarks(e.target.value); setError(''); }}
                            min={0} max={maxMarks}
                            style={{ width: '100%', boxSizing: 'border-box' as const, padding: '10px 14px', borderRadius: '10px', border: `1.5px solid ${error ? 'var(--ember)' : 'var(--border)'}`, background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '18px', fontWeight: '700' }}
                        />
                        {error && <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--ember)' }}>{error}</p>}
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ink-ghost)', display: 'block', marginBottom: '6px' }}>
                            Feedback (optional)
                        </label>
                        <textarea
                            value={feedback} onChange={e => setFeedback(e.target.value)}
                            placeholder="e.g. Excellent work on the last question…"
                            rows={3}
                            style={{ width: '100%', boxSizing: 'border-box' as const, padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '13px', resize: 'vertical' as const }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={onClose} className="secondary-button" style={{ flex: 1 }}>Cancel</button>
                        <button onClick={handleSave} className="premium-button"
                            style={{ flex: 2, background: 'var(--sanctuary-saffron)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            disabled={saving}>
                            {saving ? '⏳' : <Check size={14} />} Save Grade
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings Modal
// ─────────────────────────────────────────────────────────────────────────────

function SettingsModal({ current, onSave, onClose }: {
    current: any; onSave: (s: any) => Promise<void>; onClose: () => void;
}) {
    const [maxMarks, setMaxMarks] = useState(String(current?.max_marks ?? 100));
    const [passing,  setPassing]  = useState(String(current?.passing_marks ?? 50));
    const [saving, setSaving]     = useState(false);
    const [validationError, setValidationError] = useState('');

    const handleSave = async () => {
        const max = Number(maxMarks);
        const pass = Number(passing);
        if (!Number.isFinite(max) || max <= 0) {
            setValidationError('Max marks must be greater than 0.');
            return;
        }
        if (!Number.isFinite(pass) || pass < 0) {
            setValidationError('Passing marks cannot be negative.');
            return;
        }
        if (pass > max) {
            setValidationError('Passing marks cannot exceed max marks.');
            return;
        }
        setValidationError('');
        setSaving(true);
        try { await onSave({ max_marks: max, passing_marks: pass }); onClose(); }
        catch { setSaving(false); }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: 'var(--background)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '360px', margin: '16px' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '17px', fontWeight: '800' }}>Grading Settings</h3>
                {[
                    { label: 'Max Marks', value: maxMarks, set: setMaxMarks },
                    { label: 'Passing Marks', value: passing, set: setPassing },
                ].map(f => (
                    <div key={f.label} style={{ marginBottom: '14px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ink-ghost)', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                        <input type="number" value={f.value} onChange={e => { f.set(e.target.value); setValidationError(''); }}
                            style={{ width: '100%', boxSizing: 'border-box' as const, padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: '700' }} />
                    </div>
                ))}
                {validationError && (
                    <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--ember)', fontWeight: '600' }}>{validationError}</p>
                )}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button onClick={onClose} className="secondary-button" style={{ flex: 1 }}>Cancel</button>
                    <button onClick={handleSave} className="premium-button"
                        style={{ flex: 2, background: 'var(--sanctuary-saffron)' }} disabled={saving}>
                        {saving ? '⏳' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function GradebookScreenWeb() {
    const route      = useRoute<any>();
    const navigation = useNavigation<any>();
    const { classroomId, classroomName } = route.params ?? {};
    const { user } = useStore();

    const {
        sortedGrades, studentNames, gradingSettings, isLoading, error,
        sortBy, setSortBy, stats, updateSettings, submitGrade,
    } = useGradebook(classroomId ?? '');

    const [gradingId, setGradingId]   = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    const maxMarks = gradingSettings?.max_marks ?? 100;
    const SORTS: { id: SortOption; label: string }[] = [
        { id: 'rank',  label: 'By Rank'  },
        { id: 'marks', label: 'By Marks' },
        { id: 'name',  label: 'By Name'  },
    ];

    const gradingStudent = gradingId ? sortedGrades.find(g => g.student_id === gradingId) : null;

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
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
                    <button onClick={() => navigation.goBack()}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--glass-surface)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-ghost)' }}>
                        <ChevronLeft size={14} /> Back
                    </button>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Gradebook — {classroomName}</h2>
                    </div>
                    <button onClick={() => setShowSettings(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--glass-surface)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ink-ghost)', fontWeight: '700' }}>
                        <Settings2 size={14} /> Settings
                    </button>
                </div>

                {isLoading && <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-ghost)' }}>Loading gradebook…</div>}
                {error     && <div style={{ padding: '16px', background: 'rgba(239,68,68,0.08)', borderRadius: '10px', color: 'var(--ember)', fontSize: '13px' }}>{error}</div>}

                {!isLoading && !error && (
                    <>
                        {/* Stats strip */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
                            {[
                                { icon: Users,    label: 'Students',     value: String(stats.totalStudents) },
                                { icon: TrendingUp, label: 'Avg Marks',  value: stats.averageMarks > 0 ? `${stats.averageMarks}/${maxMarks}` : '—' },
                                { icon: Award,    label: 'Pass Rate',    value: stats.totalStudents > 0 ? `${Math.round(sortedGrades.filter(g => g.marks >= (gradingSettings?.passing_marks ?? 50)).length / stats.totalStudents * 100)}%` : '—' },
                            ].map(s => (
                                <div key={s.label} className="sanctuary-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ padding: '8px', background: 'var(--background-alt)', borderRadius: '8px' }}>
                                        <s.icon size={18} color="var(--action)" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '20px', fontWeight: '800' }}>{s.value}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', fontWeight: '700' }}>{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Sort tabs */}
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                            {SORTS.map(s => (
                                <button key={s.id} onClick={() => setSortBy(s.id)}
                                    className={sortBy === s.id ? 'top-tab top-tab--active' : 'top-tab'}
                                    style={{ fontSize: '12px' }}>
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        {/* Grade table */}
                        {sortedGrades.length === 0
                            ? <div className="sanctuary-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-ghost)' }}>
                                No grades recorded yet. Click ✏️ next to a student to add grades.
                              </div>
                            : (
                                <div className="sanctuary-card" style={{ padding: 0, overflow: 'hidden' }}>
                                    {/* Table head */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 80px 80px 80px 44px', gap: '0', padding: '10px 20px', background: 'var(--background-alt)', borderBottom: '1px solid var(--border)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--ink-ghost)' }}>
                                        <span>#</span><span>Student</span><span style={{ textAlign: 'center' }}>Marks</span><span style={{ textAlign: 'center' }}>Grade</span><span style={{ textAlign: 'center' }}>Rank</span><span />
                                    </div>
                                    {sortedGrades.map((g, i) => {
                                        const pct = maxMarks > 0 ? (g.marks / maxMarks) * 100 : 0;
                                        const passing = gradingSettings?.passing_marks ?? 50;
                                        const passingPct = maxMarks > 0 ? (passing / maxMarks) * 100 : 50;
                                        const color = pct >= 80 ? 'var(--moss)' : pct >= passingPct ? 'var(--amber-glow)' : 'var(--ember)';
                                        return (
                                            <div key={g.student_id} style={{
                                                display: 'grid', gridTemplateColumns: '40px 1fr 80px 80px 80px 44px',
                                                gap: 0, padding: '13px 20px', alignItems: 'center',
                                                borderBottom: i < sortedGrades.length - 1 ? '1px solid var(--border-light)' : 'none',
                                                transition: 'background 0.12s',
                                            }}
                                                onMouseOver={e => (e.currentTarget.style.background = 'var(--background-alt)')}
                                                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                                            >
                                                <span style={{ fontSize: '12px', color: 'var(--ink-ghost)', fontWeight: '700' }}>{i + 1}</span>
                                                <span style={{ fontSize: '14px', fontWeight: '600' }}>{studentNames[g.student_id] ?? 'Unknown'}</span>
                                                <span style={{ textAlign: 'center', fontSize: '15px', fontWeight: '800', color }}>{g.marks}</span>
                                                <span style={{ textAlign: 'center', fontSize: '13px', fontWeight: '700', color }}>{g.grade ?? '—'}</span>
                                                <span style={{ textAlign: 'center', fontSize: '13px', color: 'var(--ink-ghost)', fontWeight: '700' }}>{g.rank ?? '—'}</span>
                                                <button onClick={() => setGradingId(g.student_id)}
                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px' }}
                                                    title="Edit grade"
                                                    onMouseOver={e => (e.currentTarget.style.background = 'var(--border)')}
                                                    onMouseOut={e => (e.currentTarget.style.background = 'none')}>
                                                    <Edit3 size={14} color="var(--ink-ghost)" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        }
                    </>
                )}
            </div>

            {/* Grade entry modal */}
            {gradingId && gradingStudent && (
                <GradeModal
                    studentName={studentNames[gradingId] ?? 'Student'}
                    current={gradingStudent.marks != null ? { marks: gradingStudent.marks, feedback: gradingStudent.feedback } : undefined}
                    maxMarks={maxMarks}
                    onSave={handleSave}
                    onClose={() => setGradingId(null)}
                />
            )}

            {/* Settings modal */}
            {showSettings && gradingSettings && (
                <SettingsModal
                    current={gradingSettings}
                    onSave={updateSettings}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </div>
    );
}
