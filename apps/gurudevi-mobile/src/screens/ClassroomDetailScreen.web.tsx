import React, { useEffect, useState, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStore, supabase, assignmentsAPI, useUserRole, api } from '@repo/core';
import { useInventory, AddStudentModal, StudentAnalysisModal } from '@repo/classroom';
import {
    ArrowLeft, Users, BookOpen, Clock, ClipboardList, Plus, CheckCircle2,
    FileText, ExternalLink, NotebookPen, UserPlus, Pin, Trash2,
    TrendingUp, Calendar, Eye, AlertTriangle, Package, Layers,
    Edit2, UserX, MessageCircle, ShieldAlert, Send, Filter,
    Sparkles,
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { StackFallback } from '../components/web/WebScreenShimmer';


interface Student {
    id: string; full_name: string; email?: string;
    avatar_url?: string; index_number?: string; joined_at: string;
    classroomStudentId: string; // enrollment row id — required for StudentProfile
    recentAbsences?: number;    // derived attendance flag for at-risk badge
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
    const [activeTab, setActiveTab] = useState<'students' | 'assignments' | 'lessons' | 'resources' | 'notes' | 'insights' | 'inventory' | 'observations' | 'analysis'>('students');

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

    // Insights (HolisticInsights)
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [insightsGrades, setInsightsGrades] = useState<any[]>([]);
    const [insightsAttendance, setInsightsAttendance] = useState<any[]>([]);
    const [insightsObservations, setInsightsObservations] = useState<any[]>([]);

    // Groups (GroupManager)
    const [groups, setGroups] = useState<Array<{ id: string; name: string; color: string; studentIds: string[]; description?: string }>>([]);
    const [showGroupsPanel, setShowGroupsPanel] = useState(false);
    const [editingGroup, setEditingGroup] = useState<typeof groups[0] | null>(null);
    const [groupName, setGroupName] = useState('');
    const [groupDesc, setGroupDesc] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [savingGroup, setSavingGroup] = useState(false);

    // Inventory
    const { items: inventoryItems, isLoading: inventoryLoading } = useInventory(classroomId ?? '');
    const [showInventoryRequest, setShowInventoryRequest] = useState(false);
    const [reqItemName, setReqItemName] = useState('');
    const [reqQty, setReqQty] = useState('1');
    const [reqNote, setReqNote] = useState('');
    const [submittingReq, setSubmittingReq] = useState(false);

    // Student edit / remove
    const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

    // Per-student Observations CRUD (Observations tab)
    const [allObservations, setAllObservations] = useState<any[]>([]);
    const [obsTabLoading, setObsTabLoading] = useState(false);
    const [showObsForm, setShowObsForm] = useState(false);
    const [obsStudent, setObsStudent] = useState<Student | null>(null);
    const [obsContent, setObsContent] = useState('');
    const [obsType, setObsType] = useState<'positive' | 'growth' | 'neutral' | 'concern'>('neutral');
    const [obsVisibility, setObsVisibility] = useState<'private' | 'student_visible'>('private');
    const [savingObs, setSavingObs] = useState(false);
    const [obsFilter, setObsFilter] = useState<string>('all');

    // Analysis Modal
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [analysisStudent, setAnalysisStudent] = useState<Student | null>(null);

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

    const loadInsights = useCallback(async () => {
        if (!classroomId) return;
        setInsightsLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const [grades, attendance, observations] = await Promise.all([
                api.grading.getClassroomGrades(classroomId).catch(() => []),
                api.attendance.getByDate(classroomId, today).catch(() => []),
                api.studentObservations.getForClassroom(classroomId).catch(() => []),
            ]);
            setInsightsGrades(grades as any[]);
            setInsightsAttendance(attendance as any[]);
            setInsightsObservations(observations as any[]);
        } catch { /**/ }
        finally { setInsightsLoading(false); }
    }, [classroomId]);

    const loadGroups = useCallback(async () => {
        if (!classroomId) return;
        try {
            const { data } = await supabase.from('classroom_groups').select('*').eq('classroom_id', classroomId).order('created_at', { ascending: false });
            if (data) setGroups(data.map((g: any) => ({ id: g.id, name: g.name, color: g.color ?? 'var(--water)', description: g.description, studentIds: g.student_ids ?? [] })));
        } catch { /**/ }
    }, [classroomId]);

    // ── Student CRUD ──────────────────────────────────────────────────────────
    const handleDeleteStudent = async (s: Student) => {
        if (!classroomId) return;
        setDeletingStudentId(s.id);
        try {
            await supabase.from('classroom_students').delete().eq('id', s.classroomStudentId);
            setStudents(prev => prev.filter(x => x.id !== s.id));
        } catch { /**/ }
        finally { setDeletingStudentId(null); }
    };

    const openEditStudent = (s: Student) => {
        setStudentToEdit(s);
        setShowAddStudentModal(true);
    };

    const openObserveStudent = (s: Student) => {
        setObsStudent(s);
        setObsContent('');
        setObsType('neutral');
        setObsVisibility('private');
        setShowObsForm(true);
        setActiveTab('observations');
    };

    // ── Observations CRUD ──────────────────────────────────────────────────────
    const openPotentialAnalysis = (s: Student) => {
        setAnalysisStudent(s);
        setShowAnalysisModal(true);
    };

    const loadObservations = useCallback(async () => {
        if (!classroomId) return;
        setObsTabLoading(true);
        try {
            const data = await api.studentObservations.getForClassroom(classroomId);
            setAllObservations(data as any[]);
        } catch { /**/ }
        finally { setObsTabLoading(false); }
    }, [classroomId]);

    const handleCreateObservation = async () => {
        if (!obsContent.trim() || !userId || !classroomId) return;
        setSavingObs(true);
        try {
            await api.studentObservations.create({
                classroom_id: classroomId,
                classroom_student_id: obsStudent?.classroomStudentId ?? '',
                student_id: obsStudent?.id ?? '',
                author_id: userId,
                content: obsContent.trim(),
                observation_type: obsType,
                visibility: obsVisibility,
            } as any);
            setObsContent('');
            setObsStudent(null);
            setShowObsForm(false);
            loadObservations();
        } catch { /**/ }
        finally { setSavingObs(false); }
    };

    const handleDeleteObservation = async (id: string) => {
        try {
            await api.studentObservations.delete(id);
            setAllObservations(prev => prev.filter(o => o.id !== id));
        } catch { /**/ }
    };

    // ── Inventory request ─────────────────────────────────────────────────────
    const handleInventoryRequest = async () => {
        if (!reqItemName.trim() || !classroomId) return;
        setSubmittingReq(true);
        try {
            await api.inventory.createRequest({
                classroom_id: classroomId,
                school_id: students[0] ? undefined as any : undefined as any,
                item_name: reqItemName.trim(),
                quantity: parseInt(reqQty) || 1,
                notes: reqNote.trim() || undefined,
            } as any);
            setReqItemName(''); setReqQty('1'); setReqNote('');
            setShowInventoryRequest(false);
        } catch { /**/ }
        finally { setSubmittingReq(false); }
    };

    useEffect(() => {
        if (!classroomId) return;
        (async () => {
            setLoading(true);
            try {
                const { data: cls } = await supabase.from('classrooms').select('*').eq('id', classroomId).single();
                if (cls) setClassroom(cls);
                const { data: enr } = await supabase
                    .from('classroom_students')
                    .select('id, student_id, joined_at, user_profiles!student_id(id, full_name, email, avatar_url, index_number)')
                    .eq('classroom_id', classroomId);
                if (enr) {
                    setStudents(enr.map((e: any) => ({
                        id: e.student_id,
                        classroomStudentId: e.id,
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
        if (activeTab === 'insights') loadInsights();
        if (activeTab === 'observations') loadObservations();
        if (activeTab === 'analysis') loadObservations(); // Reuse observations for some context if needed
    }, [activeTab, loadAssignments, loadLessons, loadResources, loadNotes, loadInsights, loadObservations]);

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

    const handleTogglePin = async (r: ClassroomResource) => {
        try {
            await supabase.from('classroom_resources')
                .update({ is_pinned: !r.is_pinned })
                .eq('id', r.id);
            loadResources();
        } catch { /**/ }
    };

    const handleDeleteResource = async (id: string) => {
        try {
            await supabase.from('classroom_resources').delete().eq('id', id);
            loadResources();
        } catch { /**/ }
    };

    const toggleMonth = (title: string) => setExpandedMonths(prev => {
        const n = new Set(prev); n.has(title) ? n.delete(title) : n.add(title); return n;
    });

    // ── Group helpers ───────────────────────────────────────────────────────

    const GROUP_COLORS = ['var(--water)', 'var(--moss)', 'var(--sanctuary-saffron)', 'var(--lotus)', 'var(--amber-glow)', 'var(--ember)'];

    const openCreateGroup = () => {
        setEditingGroup(null); setGroupName(''); setGroupDesc(''); setSelectedStudentIds([]);
        setShowGroupsPanel(true);
    };

    const openEditGroup = (g: typeof groups[0]) => {
        setEditingGroup(g); setGroupName(g.name); setGroupDesc(g.description ?? '');
        setSelectedStudentIds(g.studentIds); setShowGroupsPanel(true);
    };

    const toggleGroupStudent = (id: string) =>
        setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

    const handleSaveGroup = async () => {
        if (!groupName.trim() || !classroomId) return;
        setSavingGroup(true);
        try {
            const color = GROUP_COLORS[groups.length % GROUP_COLORS.length];
            if (editingGroup) {
                await supabase.from('classroom_groups').update({ name: groupName.trim(), description: groupDesc.trim(), student_ids: selectedStudentIds }).eq('id', editingGroup.id);
            } else {
                await supabase.from('classroom_groups').insert({ classroom_id: classroomId, name: groupName.trim(), description: groupDesc.trim(), color, student_ids: selectedStudentIds });
            }
            setShowGroupsPanel(false); loadGroups();
        } catch { /**/ }
        finally { setSavingGroup(false); }
    };

    const handleDeleteGroup = async (id: string) => {
        try { await supabase.from('classroom_groups').delete().eq('id', id); loadGroups(); } catch { /**/ }
    };

    if (loading) return <StackFallback variant="list" />;

    const TABS = [
        { id: 'students' as const, label: `👥 Students${students.length > 0 ? ` (${students.length})` : ''}` },
        { id: 'assignments' as const, label: `📋 Assignments${assignments.length > 0 ? ` (${assignments.length})` : ''}` },
        { id: 'lessons' as const, label: '📆 Lessons' },
        { id: 'resources' as const, label: '📂 Resources' },
        { id: 'notes' as const, label: '📝 Notes' },
        ...(isTeacher ? [
            { id: 'observations' as const, label: `🔍 Observations${allObservations.length > 0 ? ` (${allObservations.length})` : ''}` },
            { id: 'analysis' as const, label: '✨ Analysis' },
            { id: 'insights' as const, label: '📊 Insights' },
            { id: 'inventory' as const, label: '📦 Inventory' },
        ] : []),
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {isTeacher && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                <button className="premium-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                    onClick={() => { setStudentToEdit(null); setShowAddStudentModal(true); }}>
                                    <UserPlus size={15} /> Add Student
                                </button>
                                <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                                    onClick={() => { loadGroups(); setEditingGroup(null); setGroupName(''); setGroupDesc(''); setSelectedStudentIds([]); setShowGroupsPanel(true); }}>
                                    <Layers size={14} /> Manage Groups
                                    {groups.length > 0 && <span style={{ background: 'var(--water)', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '800' }}>{groups.length}</span>}
                                </button>
                            </div>
                        )}
                        <div className="sanctuary-card" style={{ overflow: 'hidden' }}>
                            {students.length === 0 ? (
                                <div style={{ padding: '60px', textAlign: 'center' }}>
                                    <UserPlus size={40} color="var(--ink-ghost)" style={{ opacity: 0.4 }} />
                                    <p style={{ color: 'var(--ink-ghost)', marginTop: '16px', fontStyle: 'italic' }}>No students enrolled yet.</p>
                                </div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ background: 'var(--background-alt)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)' }}>
                                        <tr>
                                            <th style={{ padding: '14px 20px' }}>Student</th>
                                            <th style={{ padding: '14px 20px' }}>Index No.</th>
                                            <th style={{ padding: '14px 20px' }}>Enrolled</th>
                                            {isTeacher && <th style={{ padding: '14px 20px' }}>Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map(s => (
                                            <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                                                onClick={() => navigation.navigate('StudentProfile' as any, { studentId: s.id, classroomId: classroomId!, studentName: s.full_name, classroomStudentId: s.classroomStudentId })}
                                                onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'var(--background-alt)'}
                                                onMouseOut={e => (e.currentTarget as HTMLElement).style.background = ''}>
                                                <td style={{ padding: '14px 20px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--background-alt)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: 'var(--action)', flexShrink: 0 }}>{s.full_name.charAt(0).toUpperCase()}</div>
                                                        <div>
                                                            <div style={{ fontWeight: '700', fontSize: '14px' }}>{s.full_name}</div>
                                                            {s.email && <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>{s.email}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px 20px', color: 'var(--ink-ghost)', fontSize: '13px' }}>{s.index_number ?? '—'}</td>
                                                <td style={{ padding: '14px 20px', color: 'var(--ink-ghost)', fontSize: '13px' }}>{formatDistanceToNow(new Date(s.joined_at), { addSuffix: true })}</td>
                                                {isTeacher && (
                                                    <td style={{ padding: '14px 20px' }} onClick={e => e.stopPropagation()}>
                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            <button title="Analyze Potential" onClick={() => openPotentialAnalysis(s)} style={{ padding: '5px 8px', borderRadius: '8px', border: '1px solid var(--sanctuary-saffron)', background: 'none', cursor: 'pointer', color: 'var(--sanctuary-saffron)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700' }}>
                                                                <Sparkles size={13} /> Potential
                                                            </button>
                                                            <button title="Write observation" onClick={() => openObserveStudent(s)} style={{ padding: '5px 8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', color: 'var(--lotus)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700' }}>
                                                                <MessageCircle size={13} /> Observe
                                                            </button>
                                                            <button title="Edit student" onClick={() => openEditStudent(s)} style={{ padding: '5px 8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', color: 'var(--ink-ghost)' }}>
                                                                <Edit2 size={13} />
                                                            </button>
                                                            <button title="Remove from classroom" onClick={() => handleDeleteStudent(s)} disabled={deletingStudentId === s.id} style={{ padding: '5px 8px', borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.08)', cursor: 'pointer', color: 'var(--ember)', opacity: deletingStudentId === s.id ? 0.5 : 1 }}>
                                                                {deletingStudentId === s.id ? '⏳' : <UserX size={13} />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
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

                {/* ── Observations Tab (teacher-only) ── */}
                {activeTab === 'observations' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Create observation form */}
                        {showObsForm ? (
                            <div className="sanctuary-card" style={{ padding: '20px', border: '2px solid var(--lotus)' }}>
                                <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '800' }}>
                                    {obsStudent ? `Observation for ${obsStudent.full_name}` : 'New Observation'}
                                </h4>
                                {/* Student picker (if not pre-selected) */}
                                {!obsStudent && (
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-ghost)', display: 'block', marginBottom: '6px' }}>Student</label>
                                        <select onChange={e => { const s = students.find(x => x.id === e.target.value); setObsStudent(s ?? null); }} defaultValue="" style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', width: '100%', fontFamily: 'var(--font-body)', fontSize: '13px' }}>
                                            <option value="" disabled>Select a student…</option>
                                            {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                                        </select>
                                    </div>
                                )}
                                {/* Type */}
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-ghost)', display: 'block', marginBottom: '6px' }}>Type</label>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {(['positive','growth','neutral','concern'] as const).map(t => (
                                            <button key={t} onClick={() => setObsType(t)} style={{ padding: '5px 12px', borderRadius: '8px', border: `1px solid ${obsType === t ? (t === 'positive' ? 'var(--moss)' : t === 'concern' ? 'var(--ember)' : t === 'growth' ? 'var(--water)' : 'var(--border)') : 'var(--border)'}`, background: obsType === t ? (t === 'positive' ? 'rgba(88,147,99,0.12)' : t === 'concern' ? 'rgba(239,68,68,0.08)' : 'var(--background-alt)') : 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: obsType === t ? (t === 'positive' ? 'var(--moss)' : t === 'concern' ? 'var(--ember)' : 'var(--ink)') : 'var(--ink-ghost)', fontFamily: 'var(--font-body)' }}>
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Visibility */}
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-ghost)', display: 'block', marginBottom: '6px' }}>Visibility</label>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {(['private','student_visible'] as const).map(v => (
                                            <button key={v} onClick={() => setObsVisibility(v)} style={{ padding: '5px 12px', borderRadius: '8px', border: `1px solid ${obsVisibility === v ? 'var(--lotus)' : 'var(--border)'}`, background: obsVisibility === v ? 'rgba(199,132,174,0.1)' : 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700', color: obsVisibility === v ? 'var(--lotus)' : 'var(--ink-ghost)', fontFamily: 'var(--font-body)' }}>
                                                {v === 'private' ? '🔒 Private' : '👁️ Visible to student'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Content */}
                                <textarea value={obsContent} onChange={e => setObsContent(e.target.value)} placeholder="Describe what you observed — behaviour, academic progress, welfare concern, achievement…" rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '13px', resize: 'vertical' as const, boxSizing: 'border-box' as const, marginBottom: '12px' }} />
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button className="secondary-button" onClick={() => { setShowObsForm(false); setObsStudent(null); setObsContent(''); }}>Cancel</button>
                                    <button className="premium-button" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--lotus)' }} onClick={handleCreateObservation} disabled={!obsContent.trim() || savingObs}>
                                        <Send size={13} /> {savingObs ? 'Saving…' : 'Save Observation'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                <button className="premium-button" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--lotus)' }} onClick={() => { setObsStudent(null); setShowObsForm(true); }}>
                                    <Plus size={15} /> New Observation
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Filter size={14} color="var(--ink-ghost)" />
                                    <select value={obsFilter} onChange={e => setObsFilter(e.target.value)} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ink)' }}>
                                        <option value="all">All students</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                        {/* Observations list */}
                        {obsTabLoading ? (
                            [1,2,3].map(i => <div key={i} style={{ height: '70px', background: 'var(--background-alt)', borderRadius: '10px', animation: 'pulse 1.5s infinite' }} />)
                        ) : allObservations.filter(o => obsFilter === 'all' || o.student_id === obsFilter).length === 0 ? (
                            <div className="sanctuary-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-ghost)', fontStyle: 'italic' }}>
                                No observations yet. Use the button above to record your first one.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {allObservations
                                    .filter(o => obsFilter === 'all' || o.student_id === obsFilter)
                                    .map((o: any) => {
                                        const typeColor = o.observation_type === 'positive' ? 'var(--moss)' : o.observation_type === 'concern' ? 'var(--ember)' : o.observation_type === 'growth' ? 'var(--water)' : 'var(--ink-ghost)';
                                        const studentName = students.find(s => s.id === o.student_id)?.full_name ?? 'Unknown student';
                                        return (
                                            <div key={o.id} style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-light)', borderLeft: `4px solid ${typeColor}`, background: 'var(--background-alt)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                                        <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--ink)' }}>{studentName}</span>
                                                        <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: typeColor, padding: '2px 7px', borderRadius: '6px', border: `1px solid ${typeColor}` }}>{o.observation_type}</span>
                                                        <span style={{ fontSize: '10px', color: 'var(--ink-ghost)' }}>{o.visibility === 'private' ? '🔒' : '👁️'} {o.visibility === 'private' ? 'Private' : 'Student visible'}</span>
                                                        <span style={{ fontSize: '10px', color: 'var(--ink-ghost)', marginLeft: 'auto' }}>{formatDistanceToNow(new Date(o.created_at), { addSuffix: true })}</span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: 'var(--ink)' }}>{o.content}</p>
                                                </div>
                                                <button title="Delete observation" onClick={() => handleDeleteObservation(o.id)} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ember)', flexShrink: 0 }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Insights Tab (teacher-only) ── */}
                {activeTab === 'insights' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {insightsLoading ? (
                            [1,2,3].map(i => <div key={i} style={{ height: '80px', background: 'var(--background-alt)', borderRadius: '12px' }} />)
                        ) : (
                            <>
                                {/* Stat cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                                    {(() => {
                                        const graded = insightsGrades.filter((g: any) => g.marks != null);
                                        const avgGpa = graded.length > 0 ? (graded.reduce((s: number, g: any) => s + g.marks, 0) / graded.length).toFixed(1) : '—';
                                        const present = insightsAttendance.filter((a: any) => a.status === 'present').length;
                                        const total = insightsAttendance.length;
                                        const attPct = total > 0 ? `${Math.round(present / total * 100)}%` : '—';
                                        return [
                                            { icon: TrendingUp, label: 'Avg Marks', value: avgGpa, color: 'var(--action)' },
                                            { icon: Calendar, label: 'Today Attendance', value: attPct, color: 'var(--moss)' },
                                            { icon: Eye, label: 'Observations', value: String(insightsObservations.length), color: 'var(--sanctuary-saffron)' },
                                        ];
                                    })().map(s => (
                                        <div key={s.label} className="sanctuary-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div style={{ padding: '10px', background: 'var(--background-alt)', borderRadius: '10px', color: s.color }}><s.icon size={20} /></div>
                                            <div>
                                                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>{s.label}</div>
                                                <div style={{ fontSize: '22px', fontWeight: '800' }}>{s.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Growth Pulse */}
                                <div className="sanctuary-card" style={{ padding: '24px' }}>
                                    <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Growth Pulse</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        {[
                                            { label: 'Positive Notes', count: insightsObservations.filter((o: any) => o.type === 'positive' || o.type === 'strength').length, color: 'var(--moss)', bg: 'rgba(34,197,94,0.08)' },
                                            { label: 'Concerns', count: insightsObservations.filter((o: any) => o.type === 'concern' || o.type === 'risk').length, color: 'var(--ember)', bg: 'rgba(239,68,68,0.08)' },
                                        ].map(p => (
                                            <div key={p.label} style={{ padding: '20px', background: p.bg, borderRadius: '12px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '36px', fontWeight: '800', color: p.color }}>{p.count}</div>
                                                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-ghost)' }}>{p.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Recent Observations */}
                                <div className="sanctuary-card" style={{ padding: '24px' }}>
                                    <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Recent Activity</h3>
                                    {insightsObservations.length === 0 ? (
                                        <p style={{ color: 'var(--ink-ghost)', fontStyle: 'italic', fontSize: '13px', margin: 0 }}>No observations recorded yet.</p>
                                    ) : insightsObservations.slice(0, 4).map((o: any) => (
                                        <div key={o.id} style={{ padding: '14px 16px', marginBottom: '10px', borderRadius: '10px', border: '1px solid var(--border-light)', borderLeft: `3px solid ${o.type === 'concern' || o.type === 'risk' ? 'var(--ember)' : 'var(--amber-glow)'}` }}>
                                            <p style={{ margin: '0 0 6px', fontSize: '13px', lineHeight: '1.5' }}>{o.content}</p>
                                            <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>{formatDistanceToNow(new Date(o.created_at), { addSuffix: true })}</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── Inventory Tab (teacher-only) ── */}
                {activeTab === 'inventory' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Request new item form */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }} onClick={() => setShowInventoryRequest(r => !r)}>
                                <Plus size={14} /> Request Item
                            </button>
                        </div>
                        {showInventoryRequest && (
                            <div className="sanctuary-card" style={{ padding: '18px', border: '2px solid var(--water)' }}>
                                <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '800' }}>Request New Item / Replenishment</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', marginBottom: '10px' }}>
                                    <input value={reqItemName} onChange={e => setReqItemName(e.target.value)} placeholder="Item name (e.g. Whiteboard markers)" style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '13px' }} />
                                    <input type="number" min="1" value={reqQty} onChange={e => setReqQty(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '13px', width: '70px' }} />
                                </div>
                                <textarea value={reqNote} onChange={e => setReqNote(e.target.value)} placeholder="Additional notes (optional)" rows={2} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '13px', resize: 'vertical' as const, boxSizing: 'border-box' as const, marginBottom: '10px' }} />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                    <button className="secondary-button" onClick={() => setShowInventoryRequest(false)}>Cancel</button>
                                    <button className="premium-button" style={{ background: 'var(--water)', display: 'flex', alignItems: 'center', gap: '6px' }} disabled={!reqItemName.trim() || submittingReq} onClick={handleInventoryRequest}>
                                        <Send size={13} /> {submittingReq ? 'Sending…' : 'Submit Request'}
                                    </button>
                                </div>
                            </div>
                        )}
                        {inventoryLoading ? (
                            [1,2,3].map(i => <div key={i} style={{ height: '60px', background: 'var(--background-alt)', borderRadius: '12px' }} />)
                        ) : inventoryItems.length === 0 ? (
                            <div className="sanctuary-card" style={{ padding: '60px', textAlign: 'center' }}>
                                <Package size={40} color="var(--ink-ghost)" style={{ opacity: 0.3 }} />
                                <p style={{ color: 'var(--ink-ghost)', marginTop: '12px', fontStyle: 'italic' }}>No inventory items recorded. Use "Request Item" above to log what your classroom needs.</p>
                            </div>
                        ) : (
                            <div className="sanctuary-card" style={{ overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ background: 'var(--background-alt)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)' }}>
                                        <tr>
                                            <th style={{ padding: '12px 20px' }}>Item</th>
                                            <th style={{ padding: '12px 20px' }}>Qty</th>
                                            <th style={{ padding: '12px 20px' }}>Condition</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventoryItems.map((item: any) => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                <td style={{ padding: '14px 20px', fontWeight: '600', fontSize: '14px' }}>{item.name}</td>
                                                <td style={{ padding: '14px 20px', color: 'var(--ink-ghost)', fontSize: '13px' }}>{item.quantity ?? '—'}</td>
                                                <td style={{ padding: '14px 20px' }}>
                                                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: item.condition === 'good' ? 'rgba(34,197,94,0.1)' : item.condition === 'fair' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: item.condition === 'good' ? 'var(--moss)' : item.condition === 'fair' ? 'var(--amber-glow)' : 'var(--ember)' }}>
                                                        {item.condition ?? 'unknown'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── AddStudentModal (add + edit) ── */}
            {showAddStudentModal && classroomId && (
                <AddStudentModal
                    isOpen={showAddStudentModal}
                    onClose={() => { setShowAddStudentModal(false); setStudentToEdit(null); }}
                    onSuccess={() => {
                        setShowAddStudentModal(false);
                        setStudentToEdit(null);
                        // Re-fetch roster
                        supabase.from('classroom_students')
                            .select('id, student_id, joined_at, user_profiles!student_id(id, full_name, email, avatar_url, index_number)')
                            .eq('classroom_id', classroomId)
                            .then(({ data: enr }) => {
                                if (enr) setStudents(enr.map((e: any) => ({
                                    id: e.student_id, classroomStudentId: e.id,
                                    full_name: e.user_profiles?.full_name ?? 'Unknown',
                                    email: e.user_profiles?.email, avatar_url: e.user_profiles?.avatar_url,
                                    index_number: e.user_profiles?.index_number, joined_at: e.joined_at,
                                })));
                            });
                    }}
                    classroomId={classroomId}
                    studentToEdit={studentToEdit as any}
                />
            )}

            {/* ── GroupManager Modal ── */}
            {showGroupsPanel && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
                    onClick={e => e.target === e.currentTarget && setShowGroupsPanel(false)}>
                    <div style={{ background: 'var(--background)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '520px', maxHeight: '85vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Student Groups</h3>
                            <button onClick={() => setShowGroupsPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--ink-ghost)' }}>✕</button>
                        </div>

                        {/* Existing groups */}
                        {groups.length > 0 && !editingGroup && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                {groups.map(g => (
                                    <div key={g.id} style={{ padding: '14px 16px', borderRadius: '12px', border: `2px solid ${g.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '14px' }}>{g.name}</div>
                                            {g.description && <div style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>{g.description}</div>}
                                            <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', marginTop: '2px' }}>{g.studentIds.length} students</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => openEditGroup(g)} style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Edit</button>
                                            <button onClick={() => handleDeleteGroup(g.id)} style={{ padding: '5px 10px', borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.1)', color: 'var(--ember)', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Create / Edit form */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', letterSpacing: '1px' }}>{editingGroup ? 'Edit Group' : 'Create Group'}</h4>
                            <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Group name (e.g. Team A)" style={INPUT_STYLE} />
                            <input value={groupDesc} onChange={e => setGroupDesc(e.target.value)} placeholder="Description (optional)" style={INPUT_STYLE} />
                            <div>
                                <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--ink-ghost)' }}>Select Students</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                                    {students.map(s => (
                                        <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: selectedStudentIds.includes(s.id) ? 'rgba(59,130,246,0.08)' : 'var(--background-alt)', cursor: 'pointer', border: `1px solid ${selectedStudentIds.includes(s.id) ? 'var(--water)' : 'transparent'}` }}>
                                            <input type="checkbox" checked={selectedStudentIds.includes(s.id)} onChange={() => toggleGroupStudent(s.id)} style={{ cursor: 'pointer' }} />
                                            <span style={{ fontSize: '14px', fontWeight: '600' }}>{s.full_name}</span>
                                            {s.index_number && <span style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>#{s.index_number}</span>}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {editingGroup && <button onClick={() => { setEditingGroup(null); setGroupName(''); setGroupDesc(''); setSelectedStudentIds([]); }} className="secondary-button" style={{ flex: 1 }}>Cancel Edit</button>}
                                <button onClick={openCreateGroup} className="secondary-button" style={{ flex: 1 }}>New Group</button>
                                <button onClick={handleSaveGroup} className="premium-button" disabled={!groupName.trim() || savingGroup} style={{ flex: 2, background: 'var(--water)' }}>{savingGroup ? '⏳' : editingGroup ? '💾 Update' : '➕ Create Group'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Student Analysis Modal ── */}
            {showAnalysisModal && analysisStudent && classroomId && (
                <StudentAnalysisModal
                    visible={showAnalysisModal}
                    onClose={() => { setShowAnalysisModal(false); setAnalysisStudent(null); }}
                    studentId={analysisStudent.id}
                    studentName={analysisStudent.full_name}
                    classroomId={classroomId}
                />
            )}
        </div>
    );
}
