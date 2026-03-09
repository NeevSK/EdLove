import React, { useEffect, useState, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStore, supabase, assignmentsAPI, useUserRole, api } from '@repo/core';
import {
    ArrowLeft, Users, BookOpen, Clock, ClipboardList, Plus, CheckCircle2,
    FileText, ExternalLink, NotebookPen, UserPlus, Pin, Trash2,
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { StackFallback } from '../components/web/WebScreenShimmer';

interface Student {
    id: string; full_name: string; email?: string;
    avatar_url?: string; index_number?: string; joined_at: string;
}

interface LessonMaterial {
    id: string; lesson_id: string; title: string;
    type: 'pdf' | 'link' | 'note'; url?: string; created_at: string;
}

interface MonthGroup {
    lessonId?: string; monthTitle: string;
    materials: LessonMaterial[]; assignments: any[];
}

interface ClassroomResource {
    id: string; title: string; type: 'pdf' | 'link' | 'note';
    url?: string; is_pinned?: boolean; created_at: string;
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function ClassroomDetailScreenWeb() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { classroomId, classroomName } = route.params ?? {};
    const { user } = useStore();
    const { role, userId } = useUserRole();

    const [classroom, setClassroom] = useState<any>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'students' | 'assignments' | 'lessons' | 'resources' | 'notes'>('students');

    // Assignments
    const [assignments, setAssignments] = useState<any[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newDueDate, setNewDueDate] = useState('');
    const [savingAssignment, setSavingAssignment] = useState(false);

    // Lessons
    const [monthGroups, setMonthGroups] = useState<MonthGroup[]>([]);
    const [lessonsLoading, setLessonsLoading] = useState(false);
    const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

    // Resources
    const [resources, setResources] = useState<ClassroomResource[]>([]);
    const [resourcesLoading, setResourcesLoading] = useState(false);
    const [showAddResource, setShowAddResource] = useState(false);
    const [resTitle, setResTitle] = useState('');
    const [resType, setResType] = useState<'pdf' | 'link' | 'note'>('link');
    const [resUrl, setResUrl] = useState('');
    const [savingResource, setSavingResource] = useState(false);

    // Notes
    const [notes, setNotes] = useState<any[]>([]);
    const [notesLoading, setNotesLoading] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [savingNote, setSavingNote] = useState(false);

    const isTeacher = role === 'teacher' || role === 'principal' || role === 'developer' || role === 'grade_head';

    // ── Data loaders ────────────────────────────────────────────────────────

    const loadAssignments = useCallback(async () => {
        if (!classroomId) return;
        try { setAssignments(await assignmentsAPI.getAll(classroomId)); } catch { /**/ }
    }, [classroomId]);

    const loadLessons = useCallback(async () => {
        if (!classroomId) return;
        setLessonsLoading(true);
        try {
            const [lessons, materials, asgn] = await Promise.all([
                api.lessons.getAll(classroomId),
                api.lessonMaterials.getAll(classroomId),
                api.assignments.getAll(classroomId),
            ]);
            const now = new Date();
            const year = now.getFullYear();
            const scaffold: MonthGroup[] = MONTH_NAMES.map(name => ({ monthTitle: `${name} ${year}`, materials: [], assignments: [] }));
            const extra: MonthGroup[] = [];
            (lessons as any[]).forEach((l: any) => {
                const ex = scaffold.find(g => g.monthTitle === l.title);
                if (ex) { ex.lessonId = l.id; } else { extra.push({ lessonId: l.id, monthTitle: l.title, materials: [], assignments: [] }); }
            });
            const all = [...scaffold, ...extra];
            (materials as any[]).forEach((m: any) => {
                const lesson = (lessons as any[]).find((l: any) => l.id === m.lesson_id);
                if (!lesson) return;
                all.find(g => g.lessonId === lesson.id)?.materials.push(m as LessonMaterial);
            });
            (asgn as any[]).forEach((a: any) => {
                if (!a.due_date) return;
                const d = new Date(a.due_date);
                all.find(g => g.monthTitle === `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`)?.assignments.push(a);
            });
            const cur = now.getMonth();
            const active = all.filter((g, i) => g.materials.length > 0 || g.assignments.length > 0 || (scaffold.indexOf(g) >= cur - 1 && scaffold.indexOf(g) <= cur + 2) || extra.includes(g));
            setMonthGroups(active);
            setExpandedMonths(new Set([`${MONTH_NAMES[cur]} ${year}`]));
        } catch (e) { console.error('[ClassroomDetail] loadLessons', e); }
        finally { setLessonsLoading(false); }
    }, [classroomId]);

    const loadResources = useCallback(async () => {
        if (!classroomId) return;
        setResourcesLoading(true);
        try {
            const { data } = await supabase.from('classroom_resources').select('*').eq('classroom_id', classroomId)
                .order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
            setResources(data ?? []);
        } catch { /**/ }
        finally { setResourcesLoading(false); }
    }, [classroomId]);

    const loadNotes = useCallback(async () => {
        if (!classroomId) return;
        setNotesLoading(true);
        try {
            const { data } = await supabase.from('classroom_notes').select('*').eq('classroom_id', classroomId)
                .order('created_at', { ascending: false }).limit(30);
            setNotes(data ?? []);
        } catch { /**/ }
        finally { setNotesLoading(false); }
    }, [classroomId]);

    useEffect(() => {
        if (!classroomId) return;
        (async () => {
            setLoading(true);
            try {
                const { data: cls } = await supabase.from('classrooms').select('*').eq('id', classroomId).single();
                if (cls) setClassroom(cls);
                const { data: enr } = await supabase
                    .from('classroom_students')
                    .select('student_id, joined_at, user_profiles!student_id(id, full_name, email, avatar_url, index_number)')
                    .eq('classroom_id', classroomId);
                if (enr) {
                    setStudents(enr.map((e: any) => ({
                        id: e.student_id,
                        full_name: e.user_profiles?.full_name ?? 'Unknown',
                        email: e.user_profiles?.email,
                        avatar_url: e.user_profiles?.avatar_url,
                        index_number: e.user_profiles?.index_number,
                        joined_at: e.joined_at,
                    })));
                }
            } catch { /**/ }
            finally { setLoading(false); }
        })();
    }, [classroomId]);

    useEffect(() => {
        if (activeTab === 'assignments') loadAssignments();
        if (activeTab === 'lessons') loadLessons();
        if (activeTab === 'resources') loadResources();
        if (activeTab === 'notes') loadNotes();
    }, [activeTab, loadAssignments, loadLessons, loadResources, loadNotes]);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleCreateAssignment = async () => {
        if (!newTitle.trim() || !classroomId || !user?.id) return;
        setSavingAssignment(true);
        try {
            await assignmentsAPI.create({
                title: newTitle.trim(), description: newDescription.trim(),
                classroom_id: classroomId,
                due_date: newDueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                max_points: 100,
            });
            setNewTitle(''); setNewDescription(''); setNewDueDate(''); setShowCreateForm(false);
            loadAssignments();
        } catch { /**/ }
        finally { setSavingAssignment(false); }
    };

    const handleAddResource = async () => {
        if (!resTitle.trim() || !classroomId || !userId) return;
        setSavingResource(true);
        try {
            await supabase.from('classroom_resources').insert({
                classroom_id: classroomId, teacher_id: userId,
                title: resTitle.trim(), type: resType,
                url: resUrl.trim() || null, is_pinned: false,
            });
            setResTitle(''); setResUrl(''); setShowAddResource(false);
            loadResources();
        } catch { /**/ }
        finally { setSavingResource(false); }
    };

    const handleAddNote = async () => {
        if (!noteContent.trim() || !classroomId || !userId) return;
        setSavingNote(true);
        try {
            await supabase.from('classroom_notes').insert({
                classroom_id: classroomId, author_id: userId,
                content: noteContent.trim(), visibility: 'class', is_pinned: false,
            });
            setNoteContent(''); loadNotes();
        } catch { /**/ }
        finally { setSavingNote(false); }
    };

    const toggleMonth = (title: string) => setExpandedMonths(prev => {
        const n = new Set(prev); n.has(title) ? n.delete(title) : n.add(title); return n;
    });

    if (loading) return <StackFallback variant="list" />;

    const TABS = [
        { id: 'students' as const, label: `👥 Students${students.length > 0 ? ` (${students.length})` : ''}` },
        { id: 'assignments' as const, label: `📋 Assignments${assignments.length > 0 ? ` (${assignments.length})` : ''}` },
        { id: 'lessons' as const, label: '📆 Lessons' },
        { id: 'resources' as const, label: '📂 Resources' },
        { id: 'notes' as const, label: '📝 Notes' },
    ];

    const INPUT_STYLE: React.CSSProperties = {
        padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)',
        background: 'var(--background-alt)', color: 'var(--ink)',
        fontFamily: 'var(--font-body)', fontSize: '14px', width: '100%', boxSizing: 'border-box',
    };

    return (
        <div className="sanctuary-screen">
            <div className="sanctuary-container">
                {/* ── Back + Header ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <button onClick={() => navigation.goBack()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--glass-surface)', cursor: 'pointer', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: '600' }}>
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800' }}>{classroomName ?? classroom?.name ?? 'Classroom'}</h1>
                        {classroom?.subject && <span style={{ fontSize: '14px', color: 'var(--action)', fontWeight: '600' }}>{classroom.subject}</span>}
                    </div>
                </div>

                {/* ── Stats Row ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    {[
                        { label: 'Students', value: String(students.length), icon: Users, color: 'var(--water)' },
                        { label: 'Subject', value: classroom?.subject ?? '—', icon: BookOpen, color: 'var(--action)' },
                        { label: 'Created', value: classroom?.created_at ? formatDistanceToNow(new Date(classroom.created_at), { addSuffix: true }) : '—', icon: Clock, color: 'var(--moss)' },
                    ].map((s, i) => (
                        <div key={i} className="sanctuary-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ padding: '10px', background: 'var(--background-alt)', borderRadius: '10px', color: s.color }}><s.icon size={20} /></div>
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>{s.label}</div>
                                <div style={{ fontSize: '18px', fontWeight: '800' }}>{s.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Tabs ── */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)} className={`top-tab ${activeTab === t.id ? 'active' : ''}`}>{t.label}</button>
                    ))}
                </div>

                {/* ── Students Tab ── */}
                {activeTab === 'students' && (
                    <div className="sanctuary-card" style={{ overflow: 'hidden' }}>
                        {students.length === 0 ? (
                            <div style={{ padding: '60px', textAlign: 'center' }}>
                                <UserPlus size={40} color="var(--ink-ghost)" style={{ opacity: 0.4 }} />
                                <p style={{ color: 'var(--ink-ghost)', marginTop: '16px', fontStyle: 'italic' }}>No students enrolled yet.</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'var(--background-alt)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)' }}>
                                    <tr><th style={{ padding: '14px 24px' }}>Student</th><th style={{ padding: '14px 24px' }}>Index No.</th><th style={{ padding: '14px 24px' }}>Enrolled</th></tr>
                                </thead>
                                <tbody>
                                    {students.map(s => (
                                        <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--background-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: 'var(--action)', flexShrink: 0 }}>{s.full_name.charAt(0).toUpperCase()}</div>
                                                    <div><div style={{ fontWeight: '700', fontSize: '14px' }}>{s.full_name}</div>{s.email && <div style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>{s.email}</div>}</div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px', color: 'var(--ink-ghost)', fontSize: '13px' }}>{s.index_number ?? '—'}</td>
                                            <td style={{ padding: '16px 24px', color: 'var(--ink-ghost)', fontSize: '13px' }}>{formatDistanceToNow(new Date(s.joined_at), { addSuffix: true })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* ── Assignments Tab ── */}
                {activeTab === 'assignments' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {isTeacher && !showCreateForm && (
                            <button className="premium-button" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowCreateForm(true)}>
                                <Plus size={16} /> Create Assignment
                            </button>
                        )}
                        {showCreateForm && (
                            <div className="sanctuary-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>New Assignment</h3>
                                <input value={newTitle} onChange={(e: any) => setNewTitle(e.target.value)} placeholder="Assignment title *" style={INPUT_STYLE} />
                                <textarea value={newDescription} onChange={(e: any) => setNewDescription(e.target.value)} placeholder="Instructions (optional)" rows={3} style={{ ...INPUT_STYLE, resize: 'vertical' as const }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-ghost)', whiteSpace: 'nowrap' }}>Due date:</label>
                                    <input type="date" value={newDueDate} onChange={(e: any) => setNewDueDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '13px' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="premium-button" onClick={handleCreateAssignment} disabled={!newTitle.trim() || savingAssignment}>{savingAssignment ? '⏳ Saving…' : '✓ Create'}</button>
                                    <button className="secondary-button" onClick={() => { setShowCreateForm(false); setNewTitle(''); setNewDescription(''); setNewDueDate(''); }}>Cancel</button>
                                </div>
                            </div>
                        )}
                        {assignments.length === 0 && !showCreateForm ? (
                            <div className="sanctuary-card" style={{ padding: '48px', textAlign: 'center' }}>
                                <ClipboardList size={40} color="var(--ink-ghost)" style={{ opacity: 0.3 }} />
                                <p style={{ color: 'var(--ink-ghost)', marginTop: '16px' }}>No assignments yet.{isTeacher ? ' Create one above.' : " Your teacher hasn't assigned any work yet."}</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {assignments.map(a => (
                                    <div key={a.id} className="sanctuary-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '4px' }}>{a.title}</div>
                                            {a.description && <div style={{ fontSize: '12px', color: 'var(--ink-ghost)', marginBottom: '8px', lineHeight: '1.5' }}>{a.description}</div>}
                                            <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Clock size={11} />
                                                Due: {a.due_date ? new Date(a.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                            </div>
                                        </div>
                                        {isTeacher && (
                                            <button className="secondary-button" style={{ fontSize: '11px', padding: '6px 12px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigation.navigate('Gradebook', { classroomId, classroomName })}>
                                                <CheckCircle2 size={13} /> Grade
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Lessons Tab ── */}
                {activeTab === 'lessons' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {lessonsLoading ? (
                            [1,2,3].map(i => <div key={i} style={{ height: '56px', background: 'var(--background-alt)', borderRadius: '12px' }} />)
                        ) : monthGroups.length === 0 ? (
                            <div className="sanctuary-card" style={{ padding: '48px', textAlign: 'center' }}>
                                <BookOpen size={40} color="var(--ink-ghost)" style={{ opacity: 0.3 }} />
                                <p style={{ color: 'var(--ink-ghost)', marginTop: '16px' }}>No lesson content yet.</p>
                            </div>
                        ) : monthGroups.map(group => {
                            const isOpen = expandedMonths.has(group.monthTitle);
                            const count = group.materials.length + group.assignments.length;
                            return (
                                <div key={group.monthTitle} className="sanctuary-card" style={{ overflow: 'hidden' }}>
                                    <button onClick={() => toggleMonth(group.monthTitle)} style={{ width: '100%', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-body)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--ink)' }}>{group.monthTitle}</span>
                                            {count > 0 && <span style={{ padding: '2px 8px', background: 'var(--background-alt)', borderRadius: '20px', fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)' }}>{count} items</span>}
                                        </div>
                                        <span style={{ color: 'var(--ink-ghost)' }}>{isOpen ? '▲' : '▼'}</span>
                                    </button>
                                    {isOpen && (
                                        <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: '0', borderTop: '1px solid var(--border-light)' }}>
                                            {count === 0 ? (
                                                <p style={{ color: 'var(--ink-ghost)', fontSize: '13px', fontStyle: 'italic', padding: '12px 0' }}>No content for this month yet.</p>
                                            ) : (
                                                <>
                                                    {group.materials.map(m => (
                                                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                                            <div style={{ padding: '6px', background: 'var(--background-alt)', borderRadius: '6px', flexShrink: 0 }}>
                                                                <FileText size={14} color="var(--action)" />
                                                            </div>
                                                            <span style={{ flex: 1, fontSize: '14px', fontWeight: '600' }}>{m.title}</span>
                                                            <span style={{ padding: '2px 8px', background: 'var(--background-alt)', borderRadius: '6px', fontSize: '10px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>{m.type}</span>
                                                            {m.url && <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--action)', display: 'flex', alignItems: 'center' }}><ExternalLink size={14} /></a>}
                                                        </div>
                                                    ))}
                                                    {group.assignments.map(a => (
                                                        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                                            <div style={{ padding: '6px', background: 'var(--background-alt)', borderRadius: '6px', flexShrink: 0 }}>
                                                                <ClipboardList size={14} color="var(--ember)" />
                                                            </div>
                                                            <span style={{ flex: 1, fontSize: '14px', fontWeight: '600' }}>{a.title}</span>
                                                            <span style={{ padding: '2px 8px', background: 'rgba(239,68,68,0.1)', borderRadius: '6px', fontSize: '10px', fontWeight: '700', color: 'var(--ember)', textTransform: 'uppercase' }}>Assignment</span>
                                                            {a.due_date && <span style={{ fontSize: '11px', color: 'var(--ink-ghost)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11} />{new Date(a.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Resources Tab ── */}
                {activeTab === 'resources' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {isTeacher && !showAddResource && (
                            <button className="premium-button" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowAddResource(true)}>
                                <Plus size={16} /> Add Resource
                            </button>
                        )}
                        {showAddResource && (
                            <div className="sanctuary-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>New Resource</h3>
                                <input value={resTitle} onChange={(e: any) => setResTitle(e.target.value)} placeholder="Title *" style={INPUT_STYLE} />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {(['link', 'pdf', 'note'] as const).map(t => (
                                        <button key={t} onClick={() => setResType(t)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${resType === t ? 'var(--action)' : 'var(--border)'}`, background: resType === t ? 'rgba(var(--action-rgb),0.08)' : 'var(--background-alt)', color: resType === t ? 'var(--action)' : 'var(--ink-ghost)', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: '700', cursor: 'pointer', textTransform: 'uppercase' }}>{t}</button>
                                    ))}
                                </div>
                                {resType !== 'note' && <input value={resUrl} onChange={(e: any) => setResUrl(e.target.value)} placeholder="URL (optional)" style={INPUT_STYLE} />}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="premium-button" onClick={handleAddResource} disabled={!resTitle.trim() || savingResource}>{savingResource ? '⏳ Saving…' : '✓ Add'}</button>
                                    <button className="secondary-button" onClick={() => { setShowAddResource(false); setResTitle(''); setResUrl(''); }}>Cancel</button>
                                </div>
                            </div>
                        )}
                        {resourcesLoading ? (
                            [1,2,3].map(i => <div key={i} style={{ height: '64px', background: 'var(--background-alt)', borderRadius: '12px' }} />)
                        ) : resources.length === 0 && !showAddResource ? (
                            <div className="sanctuary-card" style={{ padding: '48px', textAlign: 'center' }}>
                                <FileText size={40} color="var(--ink-ghost)" style={{ opacity: 0.3 }} />
                                <p style={{ color: 'var(--ink-ghost)', marginTop: '16px' }}>No resources yet.{isTeacher ? ' Add the first one above.' : ''}</p>
                            </div>
                        ) : (
                            <div className="sanctuary-card" style={{ overflow: 'hidden' }}>
                                {resources.map(r => (
                                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderBottom: '1px solid var(--border-light)' }}>
                                        {r.is_pinned && <Pin size={14} color="var(--sanctuary-saffron)" fill="var(--sanctuary-saffron)" />}
                                        <div style={{ padding: '8px', background: 'var(--background-alt)', borderRadius: '8px', flexShrink: 0 }}>
                                            <FileText size={16} color="var(--action)" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '14px', fontWeight: '700' }}>{r.title}</div>
                                            <span style={{ padding: '2px 6px', background: 'var(--background-alt)', borderRadius: '4px', fontSize: '10px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>{r.type}</span>
                                        </div>
                                        {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--action)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}><ExternalLink size={14} /> Open</a>}
                                        {isTeacher && (
                                            <>
                                                <button onClick={() => handleTogglePin(r)} title={r.is_pinned ? 'Unpin' : 'Pin'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-ghost)', padding: '4px' }}><Pin size={14} /></button>
                                                <button onClick={() => handleDeleteResource(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ember)', padding: '4px' }}><Trash2 size={14} /></button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Notes Tab ── */}
                {activeTab === 'notes' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Quick-add note */}
                        <div className="sanctuary-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <NotebookPen size={16} color="var(--sanctuary-saffron)" />
                                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>Write a note</span>
                            </div>
                            <textarea
                                value={noteContent}
                                onChange={(e: any) => setNoteContent(e.target.value)}
                                placeholder={isTeacher ? 'Class announcement, reminder, or observation…' : 'Your personal study note…'}
                                rows={3}
                                style={{ ...INPUT_STYLE, resize: 'vertical' as const }}
                            />
                            <button className="premium-button" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--sanctuary-saffron)' }} onClick={handleAddNote} disabled={!noteContent.trim() || savingNote}>
                                {savingNote ? '⏳ Saving…' : '📝 Post Note'}
                            </button>
                        </div>

                        {notesLoading ? (
                            [1,2,3].map(i => <div key={i} style={{ height: '72px', background: 'var(--background-alt)', borderRadius: '12px' }} />)
                        ) : notes.length === 0 ? (
                            <div className="sanctuary-card" style={{ padding: '40px', textAlign: 'center' }}>
                                <NotebookPen size={36} color="var(--ink-ghost)" style={{ opacity: 0.3 }} />
                                <p style={{ color: 'var(--ink-ghost)', marginTop: '12px', fontStyle: 'italic' }}>No notes yet — be the first to write one.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {notes.map(n => (
                                    <div key={n.id} className="sanctuary-card" style={{ padding: '18px 20px', borderLeft: '3px solid var(--sanctuary-saffron)' }}>
                                        <p style={{ margin: '0 0 8px', fontSize: '14px', lineHeight: '1.6', color: 'var(--ink)' }}>{n.content}</p>
                                        <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', display: 'flex', gap: '8px' }}>
                                            <span>{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
                                            {n.visibility && <span>· {n.visibility}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
