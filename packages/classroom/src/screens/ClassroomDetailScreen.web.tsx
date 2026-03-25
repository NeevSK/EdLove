import React, { useEffect, useState, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStore, supabase, assignmentsAPI, usePermissions, api } from '@repo/core';
import { useInventory, AddStudentModal } from '@repo/classroom';
import { StudentAnalysisModal, ResourceRow } from '@repo/library';
import {
    ArrowLeft, Users, BookOpen, Clock, ClipboardList, Plus, CheckCircle2,
    FileText, ExternalLink, NotebookPen, UserPlus, Pin, Trash2,
    TrendingUp, Calendar, Eye, AlertTriangle, Package, Layers,
    Edit2, UserX, MessageCircle, ShieldAlert, Send, Filter,
    Sparkles,
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { ActivityIndicator } from 'react-native';
import { Box } from '@repo/ui';

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
    id: string; title: string; type: string;
    url?: string; is_pinned?: boolean; created_at: string;
    metadata?: { size?: number; duration?: number };
    format?: string;
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function ClassroomDetailScreenWeb() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { classroomId, classroomName } = route.params ?? {};
    const { user } = useStore();
    const { can, context } = usePermissions();
    const { userId } = context;

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

    const isTeacher = can('manage', 'Classroom') || can('create', 'Assignment');

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
                api.grading.getClassroomGrades(classroomId as string).catch(() => []),
                api.attendance.getByDate(classroomId as string, today).catch(() => []),
                api.studentObservations.getForClassroom(classroomId as string).catch(() => []),
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

    if (loading) return (
        <Box sx={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <ActivityIndicator size="large" />
        </Box>
    );

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

                {/* Add Student Modal */}
                {showAddStudentModal && (
                    <AddStudentModal
                        classroomId={classroomId!}
                        isOpen={showAddStudentModal}
                        onClose={() => { setShowAddStudentModal(false); setStudentToEdit(null); }}
                        onSuccess={() => {
                            // Reload students list
                            (async () => {
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
                            })();
                        }}
                        studentToEdit={studentToEdit as any}
                    />
                )}
            </div>
        </div>
    );
}
