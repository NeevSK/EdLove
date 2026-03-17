import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { 
    useUserRole, 
    useStore, 
    staffManagementAPI, 
    supabase, 
    api, 
    schoolAPI, 
    StaffPresenceSummary, 
    TeacherCarouselItem, 
    StudentAttendancePulse, 
    StaffLeaveDTO, 
    useFeatureAccess,
    mappingAPI 
} from '@repo/core';
import { useSchoolStats, CreateClassroomModal, AddStudentModal } from '@repo/classroom';
import { useSchoolPulse } from '@repo/profile';
import { SkeletonCard, SandboxBanner, getInitialsFromName, PositiveInvitation, hapticLight, WebScreenHeader } from '@repo/ui';
import { UniversalPerspective } from '@repo/library';
import { KnowledgeTopology } from '@repo/graphics';
import { formatDistanceToNow } from 'date-fns';
import {
    Users,
    FileText,
    Shield,
    TrendingUp,
    Plus,
    CheckCircle2,
    GraduationCap,
    AlertTriangle,
    UserCheck,
    CalendarOff,
    BookOpen,
    Zap,
    Building,
    Activity,
    UserPlus,
    Share2,
    MessageSquare,
    Heart,
    CalendarCheck,
    NotebookPen,
    LayoutGrid,
    Milestone,
    ClipboardList,
    Copy,
    BarChart3,
    Package,
    ArrowLeft,
    PlusCircle,
} from 'lucide-react-native';
import { CreateSchoolModal } from '@repo/classroom';

const LEAVE_STATUS_COLORS: Record<string, string> = {
    pending: 'var(--amber-glow)',
    approved: 'var(--moss)',
    rejected: 'var(--ember)',
};

const PRESENCE_STATUS_COLORS: Record<string, string> = {
    present: 'var(--moss)',
    absent: 'var(--ember)',
    on_leave: 'var(--amber-glow)',
    late: 'var(--water)',
    half_day: 'var(--lotus)',
};

function presenceColor(present: number, total: number): string {
    if (total === 0) return 'var(--ink-ghost)';
    const pct = present / total;
    if (pct >= 0.9) return 'var(--moss)';
    if (pct >= 0.7) return 'var(--amber-glow)';
    return 'var(--ember)';
}

export default function PrincipalSchoolViewWeb({ schoolId, userId, forceDemo, onRefresh }: { schoolId?: string; userId?: string; forceDemo?: boolean; onRefresh?: () => void }) {
    const { t } = useTranslation();
    const { user } = useStore();
    const { isGuest } = useFeatureAccess();
    
    const effectiveSchoolId = schoolId || user?.school_id || '';
    const effectiveUserId = userId || user?.id || '';
    const isDemo = forceDemo === true || (!effectiveSchoolId && !isGuest);

    const { stats: schoolStats, school, isLoading: statsLoading } = useSchoolStats(effectiveSchoolId);
    const { pulse, loading: pulseLoading } = useSchoolPulse(effectiveSchoolId);

    const [presence, setPresence] = useState<StaffPresenceSummary | null>(null);
    const [teachers, setTeachers] = useState<TeacherCarouselItem[]>([]);
    const [studentPulse, setStudentPulse] = useState<StudentAttendancePulse | null>(null);
    const [showAtRiskPanel, setShowAtRiskPanel] = useState(false);
    const [atRiskStudents, setAtRiskStudents] = useState<Array<{ id: string; full_name: string; classroom_name: string; }>>([]);
    const [atRiskLoading, setAtRiskLoading] = useState(false);
    const navigation = useNavigation<any>();
    const [pendingLeaves, setPendingLeaves] = useState<StaffLeaveDTO[]>([]);
    const [staffLoading, setStaffLoading] = useState(true);
    const [showCreateClassroom, setShowCreateClassroom] = useState(false);
    const [showAddTeacher, setShowAddTeacher] = useState(false);
    const [processingLeave, setProcessingLeave] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [schoolTopology, setSchoolTopology] = useState<KnowledgeTopology | null>(null);
    const [topologyLoading, setTopologyLoading] = useState(true);

    // ── Topology Pulse Loader ──────────────────────────────────────────────
    useEffect(() => {
        if (!effectiveSchoolId) return;
        let mounted = true;
        const loadTopology = async () => {
            setTopologyLoading(true);
            try {
                const data = await mappingAPI.getSchoolPulse(effectiveSchoolId);
                if (mounted && data) setSchoolTopology(data);
            } catch (err) {
                console.error('[PrincipalSchoolView] Error loading topology:', err);
            } finally {
                if (mounted) setTopologyLoading(false);
            }
        };
        loadTopology();
        return () => { mounted = false; };
    }, [effectiveSchoolId]);

    // ── Sub-view navigation (ManagementStation) ───────────────────────────
    type PrincipalView = 'main' | 'hierarchy' | 'invites' | 'log' | 'cycles';
    const [activeView, setActiveView] = useState<PrincipalView>('main');

    // ── CurriculumPulse data ───────────────────────────────────────────────
    const [curriculumProgress, setCurriculumProgress] = useState<Array<{ grade: string; coverage: number; topics_done: number; topics_total: number }>>([]);
    const [curriculumLoading, setCurriculumLoading] = useState(false);

    // ── ResourceNeeds data ────────────────────────────────────────────────
    const [resourceNeeds, setResourceNeeds] = useState<any[]>([]);
    const [resourceNeedsLoading, setResourceNeedsLoading] = useState(false);

    // ── Invite codes (for Invites sub-view) ───────────────────────────────
    const [inviteCodes, setInviteCodes] = useState<any[]>([]);
    const [inviteRole, setInviteRole] = useState<'teacher' | 'principal'>('teacher');
    const [generatingCode, setGeneratingCode] = useState(false);

    // ── Academic cycles (for Cycles sub-view) ────────────────────────────
    const [academicCycles, setAcademicCycles] = useState<any[]>([]);
    const [cyclesLoading, setCyclesLoading] = useState(false);
    const [newCycleName, setNewCycleName] = useState('');
    const [newCycleStart, setNewCycleStart] = useState('');
    const [newCycleEnd, setNewCycleEnd] = useState('');
    const [savingCycle, setSavingCycle] = useState(false);

    // ── School sections (for Hierarchy sub-view) ──────────────────────────
    const [sections, setSections] = useState<any[]>([]);
    const [sectionsLoading, setSectionsLoading] = useState(false);
    const [newSectionName, setNewSectionName] = useState('');
    const [newSectionGrade, setNewSectionGrade] = useState('');
    const [savingSection, setSavingSection] = useState(false);

    // ── Echo / Feedback from teachers ─────────────────────────────────────
    const [echoItems, setEchoItems] = useState<Array<{
        id: string; source: string; category: string; content: string;
        priority: string; is_read: boolean; created_at: string;
        principal_response?: string; responded_at?: string;
    }>>([]);
    const [echoLoading, setEchoLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [savingReply, setSavingReply] = useState(false);

    useEffect(() => {
        let mounted = true;
        const loadEcho = async () => {
            if (!effectiveSchoolId) {
                setEchoItems([
                    { id: 'e1', source: 'teacher', category: 'support', content: 'Need guidance on the 2026 Mathematics syllabus transition for Grade 6.', priority: 'high', is_read: false, created_at: new Date().toISOString() },
                    { id: 'e2', source: 'student', category: 'morale', content: 'The new common area is great! Everyone is enjoying the study space.', priority: 'low', is_read: true, created_at: new Date(Date.now() - 3600000).toISOString() },
                    { id: 'e3', source: 'teacher', category: 'facility', content: 'Multimedia projector in Room 4 is flickering intermittently.', priority: 'medium', is_read: false, created_at: new Date(Date.now() - 86400000).toISOString() },
                ]);
                setEchoLoading(false);
                return;
            }
            setEchoLoading(true);
            try {
                const { data, error } = await supabase
                    .from('school_echo_feedback')
                    .select('*')
                    .eq('school_id', effectiveSchoolId)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (!mounted) return;
                if (error || !data?.length) {
                    // Sandbox fallback — same mock used by the native DashboardEcho
                    setEchoItems([
                        { id: 'e1', source: 'teacher', category: 'support', content: 'Need guidance on the 2026 Mathematics syllabus transition for Grade 6.', priority: 'high', is_read: false, created_at: new Date().toISOString() },
                        { id: 'e2', source: 'student', category: 'morale', content: 'The new common area is great! Everyone is enjoying the study space.', priority: 'low', is_read: true, created_at: new Date(Date.now() - 3600000).toISOString() },
                        { id: 'e3', source: 'teacher', category: 'facility', content: 'Multimedia projector in Room 4 is flickering intermittently.', priority: 'medium', is_read: false, created_at: new Date(Date.now() - 86400000).toISOString() },
                    ]);
                } else {
                    setEchoItems(data);
                }
            } catch {
                setEchoItems([]);
            } finally {
                if (mounted) setEchoLoading(false);
            }
        };
        loadEcho();
        return () => { mounted = false; };
    }, [effectiveSchoolId]);

    // ── Calendar events ────────────────────────────────────────────────────
    const [calendarEvents, setCalendarEvents] = useState<Array<{
        id: string; title: string; type: string; start_date: string; end_date?: string;
    }>>([]);
    const [calendarLoading, setCalendarLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!effectiveSchoolId) {
                const y = new Date().getFullYear();
                setCalendarEvents([
                    { id: 'c1', title: 'Second Term Begins', type: 'term_start', start_date: `${y}-04-07` },
                    { id: 'c2', title: 'Mid-Year Examinations', type: 'exam', start_date: `${y}-06-10`, end_date: `${y}-06-21` },
                    { id: 'c3', title: 'Sports Day', type: 'event', start_date: `${y}-05-15` },
                    { id: 'c4', title: 'Vesak Holiday', type: 'holiday', start_date: `${y}-05-12` },
                ]);
                setCalendarLoading(false);
                return;
            }
            setCalendarLoading(true);
            try {
                const today = new Date().toISOString().split('T')[0];
                const { data, error } = await supabase
                    .from('school_calendar_events')
                    .select('*')
                    .eq('school_id', effectiveSchoolId)
                    .gte('start_date', today)
                    .order('start_date', { ascending: true })
                    .limit(5);
                if (!mounted) return;
                if (error || !data?.length) {
                    const y = new Date().getFullYear();
                    setCalendarEvents([
                        { id: 'c1', title: 'Second Term Begins', type: 'term_start', start_date: `${y}-04-07` },
                        { id: 'c2', title: 'Mid-Year Examinations', type: 'exam', start_date: `${y}-06-10`, end_date: `${y}-06-21` },
                        { id: 'c3', title: 'Sports Day', type: 'event', start_date: `${y}-05-15` },
                        { id: 'c4', title: 'Vesak Holiday', type: 'holiday', start_date: `${y}-05-12` },
                    ]);
                } else {
                    setCalendarEvents(data);
                }
            } catch {
                setCalendarEvents([]);
            } finally {
                if (mounted) setCalendarLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [effectiveSchoolId]);

    // ── Observations ───────────────────────────────────────────────────────
    const [observations, setObservations] = useState<Array<{
        id: string; type: string; content: string; created_at: string;
    }>>([]);
    const [obsLoading, setObsLoading] = useState(true);
    const [obsContent, setObsContent] = useState('');
    const [obsType, setObsType] = useState('note');
    const [savingObs, setSavingObs] = useState(false);

    useEffect(() => {
        if (!effectiveUserId) return;
        let mounted = true;
        (async () => {
            setObsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('principal_observations')
                    .select('*')
                    .eq('principal_id', effectiveUserId)
                    .order('created_at', { ascending: false })
                    .limit(5);
                if (!mounted) return;
                if (error || !data?.length) {
                    setObservations([
                        { id: 'o1', type: 'walkthrough', content: 'Grade 8A math class — excellent collaborative problem-solving observed. Recommend for school showcase.', created_at: new Date(Date.now() - 7200000).toISOString() },
                        { id: 'o2', type: 'concern', content: 'Library attendance dropped 30% this month. Follow up with librarian to investigate causes.', created_at: new Date(Date.now() - 86400000).toISOString() },
                    ]);
                } else {
                    setObservations(data);
                }
            } catch {
                setObservations([]);
            } finally {
                if (mounted) setObsLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [effectiveUserId]);

    const handleSaveObservation = async () => {
        if (!obsContent.trim() || !effectiveUserId || !effectiveSchoolId) return;
        setSavingObs(true);
        try {
            await supabase.from('principal_observations').insert({
                principal_id: effectiveUserId,
                school_id: effectiveSchoolId,
                type: obsType,
                content: obsContent.trim(),
            });
            setObsContent('');
            // Reload
            const { data } = await supabase.from('principal_observations').select('*').eq('principal_id', effectiveUserId).order('created_at', { ascending: false }).limit(5);
            setObservations(data ?? observations);
        } catch { /**/ }
        finally { setSavingObs(false); }
    };

    useEffect(() => {
        let mounted = true;
        const loadStaffData = async () => {
            if (!effectiveSchoolId) {
                // Demo fallback for staff/student pulse
                setPresence({ present: 18, total: 20, on_leave: 1, late: 1 } as any);
                setTeachers([
                    { id: 't1', full_name: 'Dr. Aruni Silva', role: 'Head of Mathematics', classroomCount: 4, todayStatus: 'present' },
                    { id: 't2', full_name: 'Mr. Rohan Perera', role: 'Science Lead', classroomCount: 3, todayStatus: 'present' },
                    { id: 't3', full_name: 'Ms. Nilanthi Gooneratne', role: 'Language Specialist', classroomCount: 5, todayStatus: 'on_leave' },
                ] as any);
                setStudentPulse({ todayRate: 94, yesterdayRate: 91, atRiskCount: 2 } as any);
                setPendingLeaves([]);
                setStaffLoading(false);
                return;
            }
            setStaffLoading(true);
            try {
                const [pres, teacherList, pulse, leaves] = await Promise.all([
                    staffManagementAPI.getStaffPresenceSummary(effectiveSchoolId),
                    staffManagementAPI.getTeacherCarousel(effectiveSchoolId),
                    staffManagementAPI.getStudentAttendancePulse(effectiveSchoolId),
                    staffManagementAPI.getPendingLeaves(effectiveSchoolId),
                ]);
                if (!mounted) return;
                setPresence(pres);
                setTeachers(teacherList);
                setStudentPulse(pulse);
                setPendingLeaves(leaves.slice(0, 5));
            } catch (e) {
                console.error('[PrincipalSchoolView] Error loading staff data:', e);
            } finally {
                if (mounted) setStaffLoading(false);
            }
        };
        loadStaffData();
        return () => { mounted = false; };
    }, [effectiveSchoolId]);

    useEffect(() => {
        const fetchProgress = async () => {
            if (!effectiveSchoolId) {
                setCurriculumProgress([
                    { grade: 'Grade 6', coverage: 72, topics_done: 18, topics_total: 25 },
                    { grade: 'Grade 7', coverage: 55, topics_done: 11, topics_total: 20 },
                    { grade: 'Grade 8', coverage: 88, topics_done: 22, topics_total: 25 },
                    { grade: 'Grade 9', coverage: 40, topics_done: 8, topics_total: 20 },
                ]);
                setCurriculumLoading(false);
                return;
            }
            setCurriculumLoading(true);
            try {
                const { data } = await supabase.from('curriculum_progress').select('*').eq('school_id', effectiveSchoolId).order('grade', { ascending: true });
                if (data && data.length > 0) {
                    setCurriculumProgress(data);
                } else {
                    // Demo fallback
                    setCurriculumProgress([
                        { grade: 'Grade 6', coverage: 72, topics_done: 18, topics_total: 25 },
                        { grade: 'Grade 7', coverage: 55, topics_done: 11, topics_total: 20 },
                        { grade: 'Grade 8', coverage: 88, topics_done: 22, topics_total: 25 },
                        { grade: 'Grade 9', coverage: 40, topics_done: 8, topics_total: 20 },
                    ]);
                }
            } catch { /**/ }
            finally { setCurriculumLoading(false); }
        };
        fetchProgress();
    }, [effectiveSchoolId]);

    // ── Load resource needs ───────────────────────────────────────────────
    useEffect(() => {
        if (!effectiveSchoolId) return;
        const fetchResources = async () => {
            setResourceNeedsLoading(true);
            try {
                const data = await api.inventory.getSchoolResourceNeeds(effectiveSchoolId);
                setResourceNeeds(data ?? []);
            } catch { /**/ }
            finally { setResourceNeedsLoading(false); }
        };
        fetchResources();
    }, [effectiveSchoolId]);

    // ── Sub-view loaders ─────────────────────────────────────────────────
    const loadInviteCodes = async () => {
        if (!effectiveSchoolId) return;
        try { setInviteCodes(await schoolAPI.getInviteCodes(effectiveSchoolId)); } catch { /**/ }
    };
    const loadAcademicCycles = async () => {
        if (!effectiveSchoolId) return;
        setCyclesLoading(true);
        try { setAcademicCycles(await api.academicCycles.getAll(effectiveSchoolId)); } catch { /**/ }
        finally { setCyclesLoading(false); }
    };
    const loadSections = async () => {
        if (!effectiveSchoolId) return;
        setSectionsLoading(true);
        try {
            const { data } = await supabase.from('school_sections').select('*').eq('school_id', effectiveSchoolId).order('grade', { ascending: true });
            setSections(data ?? []);
        } catch { /**/ }
        finally { setSectionsLoading(false); }
    };

    const handleNavigateTo = (view: PrincipalView) => {
        setActiveView(view);
        if (view === 'invites') loadInviteCodes();
        if (view === 'cycles') loadAcademicCycles();
        if (view === 'hierarchy') loadSections();
    };

    const handleMarkEchoRead = async (id: string) => {
        try {
            await supabase.from('school_echo_feedback').update({ is_read: true }).eq('id', id);
            setEchoItems(prev => prev.map(e => e.id === id ? { ...e, is_read: true } : e));
        } catch { /**/ }
    };

    const handleSendEchoReply = async (id: string) => {
        if (!replyText.trim() || !effectiveUserId) return;
        setSavingReply(true);
        try {
            const now = new Date().toISOString();
            await supabase.from('school_echo_feedback').update({
                principal_response: replyText.trim(),
                responded_by: effectiveUserId,
                responded_at: now,
                is_read: true,
            }).eq('id', id);
            setEchoItems(prev => prev.map(e =>
                e.id === id ? { ...e, principal_response: replyText.trim(), responded_at: now, is_read: true } : e
            ));
            setReplyingTo(null);
            setReplyText('');
        } catch { /**/ }
        finally { setSavingReply(false); }
    };

    const loadAtRiskStudents = async () => {
        if (!effectiveSchoolId) return;
        setAtRiskLoading(true);
        try {
            // At-risk = absent on both today and yesterday across any classroom in this school
            const today = new Date().toISOString().slice(0, 10);
            const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
            const { data } = await supabase
                .from('attendance')
                .select('student_id, classroom_id, date, classrooms!classroom_id(name, school_id), user_profiles!student_id(full_name)')
                .in('date', [today, yesterday])
                .eq('status', 'absent')
                .eq('classrooms.school_id', effectiveSchoolId);
            if (!data) { setAtRiskStudents([]); return; }
            // Count absences per student
            const counts: Record<string, { count: number; full_name: string; classroom_name: string }> = {};
            data.forEach((r: any) => {
                if (!r.student_id) return;
                if (!counts[r.student_id]) counts[r.student_id] = { count: 0, full_name: r.user_profiles?.full_name ?? 'Unknown', classroom_name: (r.classrooms as any)?.name ?? '—' };
                counts[r.student_id].count++;
            });
            setAtRiskStudents(Object.entries(counts)
                .filter(([, v]) => v.count >= 2)
                .map(([id, v]) => ({ id, full_name: v.full_name, classroom_name: v.classroom_name })));
        } catch { setAtRiskStudents([]); }
        finally { setAtRiskLoading(false); }
    };
    const handleGenerateCode = async () => {
        if (!effectiveSchoolId || !effectiveUserId) return;
        setGeneratingCode(true);
        try {
            const code = await schoolAPI.generateInviteCode(effectiveSchoolId, inviteRole, effectiveUserId);
            setInviteCodes(prev => [code, ...prev]);
        } catch { /**/ }
        finally { setGeneratingCode(false); }
    };


    const handleCreateCycle = async () => {
        if (!newCycleName.trim() || !newCycleStart || !effectiveSchoolId) return;
        setSavingCycle(true);
        try {
            const cycle = await api.academicCycles.create({ name: newCycleName.trim(), school_id: effectiveSchoolId, start_date: newCycleStart, end_date: newCycleEnd || undefined, status: 'upcoming' } as any);
            setAcademicCycles(prev => [cycle, ...prev]);
            setNewCycleName(''); setNewCycleStart(''); setNewCycleEnd('');
        } catch { /**/ }
        finally { setSavingCycle(false); }
    };

    const handleCreateSection = async () => {
        if (!newSectionName.trim() || !effectiveSchoolId) return;
        setSavingSection(true);
        try {
            const { data } = await supabase.from('school_sections').insert({ school_id: effectiveSchoolId, name: newSectionName.trim(), grade: newSectionGrade.trim() || null }).select().single();
            if (data) setSections(prev => [...prev, data]);
            setNewSectionName(''); setNewSectionGrade('');
        } catch { /**/ }
        finally { setSavingSection(false); }
    };

    const attendancePct = studentPulse?.todayRate ?? 0;
    const resonanceScore = pulse?.resonance_score ?? 0;

    return (
        <>
            {isDemo && <SandboxBanner />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                {/* ── Sub-view: Hierarchy Builder ─────────────────── */}
                {activeView === 'hierarchy' && (
                    <div>
                        <button onClick={() => setActiveView('main')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--glass-surface)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '600', marginBottom: '24px' }}>
                            <ArrowLeft size={14} /> Back to Dashboard
                        </button>
                        <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '800' }}>🏛️ System Hierarchy</h2>
                        <p style={{ margin: '0 0 24px', color: 'var(--ink-ghost)', fontSize: '14px' }}>Grades, sections and class structure for your school.</p>
                        {/* Add section form */}
                        <div className="sanctuary-card" style={{ padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)' }}>Add Section</h4>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <input value={newSectionGrade} onChange={e => setNewSectionGrade(e.target.value)} placeholder="Grade (e.g. Grade 8)" style={{ flex: 1, minWidth: '140px', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '14px' }} />
                                <input value={newSectionName} onChange={e => setNewSectionName(e.target.value)} placeholder="Section name (e.g. 8A)" style={{ flex: 1, minWidth: '140px', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '14px' }} />
                                <button onClick={handleCreateSection} disabled={!newSectionName.trim() || savingSection} className="premium-button" style={{ background: 'var(--lotus)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {savingSection ? '⏳' : <><Plus size={14} /> Add</>}
                                </button>
                            </div>
                        </div>
                        {sectionsLoading ? <SkeletonCard /> : sections.length === 0 ? (
                            <p style={{ color: 'var(--ink-ghost)', fontStyle: 'italic' }}>No sections yet — add one above.</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                {sections.map(s => (
                                    <div key={s.id} className="sanctuary-card" style={{ padding: '18px 20px', borderLeft: '3px solid var(--lotus)' }}>
                                        <div style={{ fontWeight: '800', fontSize: '16px' }}>{s.name}</div>
                                        {s.grade && <div style={{ fontSize: '12px', color: 'var(--ink-ghost)', marginTop: '4px' }}>{s.grade}</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Sub-view: Governance Invites ─────────────────── */}
                {activeView === 'invites' && (
                    <div>
                        <button onClick={() => setActiveView('main')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--glass-surface)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '600', marginBottom: '24px' }}>
                            <ArrowLeft size={14} /> Back to Dashboard
                        </button>
                        <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '800' }}>📬 Governance Invites</h2>
                        <p style={{ margin: '0 0 24px', color: 'var(--ink-ghost)', fontSize: '14px' }}>Generate invite codes to onboard principals and teachers.</p>
                        <div className="sanctuary-card" style={{ padding: '24px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <select value={inviteRole} onChange={e => setInviteRole(e.target.value as any)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
                                    <option value="teacher">Teacher</option>
                                    <option value="principal">Principal</option>
                                </select>
                                <button onClick={handleGenerateCode} disabled={generatingCode} className="premium-button" style={{ background: 'var(--lotus)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {generatingCode ? '⏳' : <><Plus size={14} /> Generate Code</>}
                                </button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {inviteCodes.length === 0 ? (
                                <p style={{ color: 'var(--ink-ghost)', fontStyle: 'italic' }}>No active codes. Generate one above.</p>
                            ) : inviteCodes.map(c => (
                                <div key={c.id} className="sanctuary-card" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <code style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '3px', color: 'var(--lotus)' }}>{c.code}</code>
                                        <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', marginTop: '4px' }}>
                                            {c.role} · {c.used ? 'Used' : 'Active'} · {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                                        </div>
                                    </div>
                                    <button onClick={() => navigator.clipboard?.writeText(c.code)} title="Copy code" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-ghost)' }}><Copy size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Sub-view: Institutional Log ───────────────────── */}
                {activeView === 'log' && (
                    <div>
                        <button onClick={() => setActiveView('main')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--glass-surface)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '600', marginBottom: '24px' }}>
                            <ArrowLeft size={14} /> Back to Dashboard
                        </button>
                        <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '800' }}>📓 Institutional Log</h2>
                        <p style={{ margin: '0 0 24px', color: 'var(--ink-ghost)', fontSize: '14px' }}>Your daily operational notes and walkthroughs.</p>
                        <div className="sanctuary-card" style={{ padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <select value={obsType} onChange={e => setObsType(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
                                {['walkthrough', 'note', 'concern', 'commendation'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                            </select>
                            <textarea value={obsContent} onChange={e => setObsContent(e.target.value)} placeholder="Write your observation or note…" rows={3} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '14px', resize: 'vertical' as const }} />
                            <button onClick={handleSaveObservation} disabled={!obsContent.trim() || savingObs} className="premium-button" style={{ alignSelf: 'flex-start', background: 'var(--sanctuary-saffron)' }}>
                                {savingObs ? '⏳' : '+ Log Entry'}
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {observations.map(o => (
                                <div key={o.id} className="sanctuary-card" style={{ padding: '18px 20px', borderLeft: `3px solid ${o.type === 'concern' ? 'var(--ember)' : o.type === 'commendation' ? 'var(--moss)' : 'var(--sanctuary-saffron)'}` }}>
                                    <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', marginBottom: '6px' }}>{o.type}</div>
                                    <p style={{ margin: '0 0 6px', fontSize: '14px', lineHeight: '1.6' }}>{o.content}</p>
                                    <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>{formatDistanceToNow(new Date(o.created_at), { addSuffix: true })}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Sub-view: Academic Cycles ─────────────────────── */}
                {activeView === 'cycles' && (
                    <div>
                        <button onClick={() => setActiveView('main')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--glass-surface)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '600', marginBottom: '24px' }}>
                            <ArrowLeft size={14} /> Back to Dashboard
                        </button>
                        <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '800' }}>📅 Academic Cycles</h2>
                        <p style={{ margin: '0 0 24px', color: 'var(--ink-ghost)', fontSize: '14px' }}>Define terms, semesters and academic periods.</p>
                        <div className="sanctuary-card" style={{ padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)' }}>New Cycle</h4>
                            <input value={newCycleName} onChange={e => setNewCycleName(e.target.value)} placeholder="e.g. First Term 2026" style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '14px' }} />
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>Start Date</label>
                                    <input type="date" value={newCycleStart} onChange={e => setNewCycleStart(e.target.value)} style={{ width: '100%', marginTop: '6px', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '14px', boxSizing: 'border-box' as const }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>End Date</label>
                                    <input type="date" value={newCycleEnd} onChange={e => setNewCycleEnd(e.target.value)} style={{ width: '100%', marginTop: '6px', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '14px', boxSizing: 'border-box' as const }} />
                                </div>
                            </div>
                            <button onClick={handleCreateCycle} disabled={!newCycleName.trim() || !newCycleStart || savingCycle} className="premium-button" style={{ alignSelf: 'flex-start', background: 'var(--lotus)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {savingCycle ? '⏳' : <><Plus size={14} /> Create</>}
                            </button>
                        </div>
                        {cyclesLoading ? <SkeletonCard /> : academicCycles.length === 0 ? (
                            <p style={{ color: 'var(--ink-ghost)', fontStyle: 'italic' }}>No academic cycles yet. Create the first one above.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {academicCycles.map(c => (
                                    <div key={c.id} className="sanctuary-card" style={{ padding: '18px 24px', borderLeft: `3px solid ${c.status === 'active' ? 'var(--moss)' : c.status === 'upcoming' ? 'var(--water)' : 'var(--border)'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '16px' }}>{c.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--ink-ghost)', marginTop: '4px' }}>{c.start_date} → {c.end_date ?? 'ongoing'}</div>
                                            </div>
                                            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: c.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)', color: c.status === 'active' ? 'var(--moss)' : 'var(--water)' }}>{c.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── MAIN VIEW ──────────────────────────────────────── */}
                {activeView === 'main' && <>

                    {/* ─── VISIONARY SANDBOX BANNER (ghost data) ─────── */}
                    {(schoolStats as any)?.is_sample && (
                        <div style={{
                            background: 'rgba(245,158,11,0.1)',
                            border: '1px solid var(--amber-glow)',
                            borderRadius: '12px',
                            padding: '20px 24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            alignItems: 'center',
                            textAlign: 'center',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--amber-glow)', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                <Zap size={16} fill="var(--amber-glow)" />
                                {t('demoMode.sandboxPerspective')}
                            </div>
                            <p style={{ margin: 0, color: 'var(--ink-ghost)', fontSize: '14px' }}>
                                {t('principal.sandboxDescription')}
                            </p>
                        </div>
                    )}

                    {/* ─── 1. COMMAND HEADER ─────────────────────────── */}
                    {/* ─── 1. COMMAND HEADER ─────────────────────────── */}
                    <WebScreenHeader
                        title={<>School <span style={{ color: 'var(--lotus)' }}>Ecosystem</span>.</>}
                        note={`Welcome back, ${user?.full_name?.split(' ')[0] || 'Principal'}. Here is your situational brief.`}
                        timeText={school?.name || 'School Ecosystem'}
                        actions={(
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <button className="premium-button" style={{ background: 'var(--lotus)', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowCreateClassroom(true)}>
                                    <Plus size={18} /> Establish Hierarchy
                                </button>
                                <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowAddTeacher(true)}>
                                    <Users size={18} /> Invite Staff
                                </button>
                                <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigation.navigate('SchoolProfile', { schoolId: effectiveSchoolId })}>
                                    <Building size={18} /> School Profile
                                </button>
                                <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--water)', borderColor: 'var(--water)' }} onClick={() => navigation.navigate('Main', { screen: 'Community' })}>
                                    <Share2 size={18} /> Open Commons
                                </button>
                            </div>
                        )}
                    />

                    {/* ─── NEW: Command Center (Topological Parity) ───── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', letterSpacing: '1px' }}>
                            Command Center 🏛️
                        </h3>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            {[
                                { icon: Users, label: t('principal.actions.hierarchy') || 'Hierarchy', color: 'var(--lotus)', onPress: () => setActiveView('hierarchy') },
                                { icon: FileText, label: t('principal.actions.invites') || 'Invites', color: 'var(--moss)', onPress: () => setActiveView('invites') },
                                { icon: CalendarCheck, label: t('principal.actions.timetable') || 'Timetable', color: 'var(--water)', isAgentic: true, onPress: () => { } },
                                { icon: NotebookPen, label: t('principal.actions.notes') || 'Logbook', color: 'var(--sanctuary-saffron)', onPress: () => setActiveView('log') },
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    onClick={action.onPress}
                                    style={{
                                        flex: 1,
                                        minWidth: '200px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '16px 20px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        border: '1px solid var(--border-light)',
                                        background: 'var(--glass-surface)',
                                        borderRadius: '16px',
                                        transition: 'all 0.2s ease',
                                        position: 'relative',
                                        fontFamily: 'inherit'
                                    }}
                                    className="hover-lift"
                                >
                                    <div style={{
                                        padding: '10px',
                                        borderRadius: '12px',
                                        background: 'var(--background-alt)',
                                        color: action.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <action.icon size={20} />
                                        {action.isAgentic && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '12px',
                                                left: '32px',
                                                padding: '2px',
                                                borderRadius: '10px',
                                                background: 'var(--water)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Zap size={8} color="white" fill="white" />
                                            </div>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--ink)' }}>{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ─── 2. MORNING BRIEF BANNER ───────────────────── */}
                    <div className="sanctuary-card" style={{ padding: '32px', background: 'var(--lotus-soft)', border: '1px solid var(--lotus-soft)' }}>
                        {statsLoading || staffLoading ? (
                            <SkeletonCard />
                        ) : (
                            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <h3 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--lotus)', marginBottom: '12px' }}>Morning Briefing</h3>
                                    <p style={{ fontSize: '15px', fontWeight: '600', lineHeight: '1.6', margin: 0 }}>
                                        {presence && presence.total > 0
                                            ? `${presence.present} of ${presence.total} staff present today. `
                                            : 'Staff presence data loading. '}
                                        {pendingLeaves.length > 0
                                            ? `${pendingLeaves.length} leave request${pendingLeaves.length > 1 ? 's' : ''} await your approval.`
                                            : 'No pending leave requests.'}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '32px', flexShrink: 0, flexWrap: 'wrap' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '28px', fontWeight: '800', color: presenceColor(attendancePct, 100) }}>
                                            {attendancePct > 0 ? `${Math.round(attendancePct)}%` : '—'}
                                        </div>
                                        <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--ink-ghost)' }}>STUDENT ATTENDANCE</div>
                                    </div>
                                    {!pulseLoading && pulse && (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '28px', fontWeight: '800', color: resonanceScore >= 70 ? 'var(--moss)' : resonanceScore >= 40 ? 'var(--amber-glow)' : 'var(--ember)' }}>
                                                {Math.round(resonanceScore)}%
                                            </div>
                                            <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--ink-ghost)' }}>RESONANCE</div>
                                        </div>
                                    )}
                                    {schoolStats && (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '28px', fontWeight: '800' }}>
                                                {schoolStats.total_classrooms ?? '—'}
                                            </div>
                                            <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--ink-ghost)' }}>CLASSROOMS</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ─── 3. MAIN GRID ──────────────────────────────── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '32px' }}>

                        {/* LEFT: Faculty & Student Pulse */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                            {/* Faculty Carousel */}
                            <div className="sanctuary-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                                        Faculty Overview
                                        {presence && (
                                            <span style={{ marginLeft: '10px', fontSize: '12px', color: presenceColor(presence.present, presence.total), fontWeight: '700' }}>
                                                {presence.present}/{presence.total} present
                                            </span>
                                        )}
                                    </h3>
                                    <button style={{ color: 'var(--lotus)', background: 'transparent', border: 'none', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }} onClick={() => setShowCreateClassroom(true)}>+ New Classroom</button>
                                </div>
                                {staffLoading ? (
                                    <SkeletonCard />
                                ) : teachers.length === 0 ? (
                                    <p style={{ color: 'var(--ink-ghost)', fontSize: '14px' }}>No teachers enrolled yet.</p>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                                        {teachers.slice(0, 6).map(teacher => (
                                            <div key={teacher.userId} style={{ padding: '16px', background: 'var(--background-alt)', borderRadius: '16px' }}>
                                                <div style={{
                                                    width: '36px', height: '36px', borderRadius: '18px',
                                                    background: 'var(--water)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    marginBottom: '12px', color: 'white', fontWeight: '800', fontSize: '13px'
                                                }}>
                                                    {getInitialsFromName(teacher.fullName)}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: '700' }}>{teacher.fullName.split(' ')[0]}</div>
                                                    <div style={{
                                                        width: '8px', height: '8px', borderRadius: '4px',
                                                        background: PRESENCE_STATUS_COLORS[teacher.todayStatus ?? ''] ?? 'var(--border)',
                                                        flexShrink: 0
                                                    }} title={teacher.todayStatus ?? 'Unknown'} />
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', marginBottom: '8px', textTransform: 'capitalize' }}>
                                                    {teacher.role.replace(/_/g, ' ')}
                                                </div>
                                                <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--water)', textTransform: 'uppercase' }}>
                                                    {teacher.classroomCount} class{teacher.classroomCount !== 1 ? 'es' : ''}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* [NEW] School Topology Pulse */}
                            <div className="sanctuary-card" style={{ padding: '24px', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                                        School Topology Pulse 🌐
                                    </h3>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <div style={{ padding: '4px 8px', background: 'var(--lotus-soft)', borderRadius: '6px', fontSize: '10px', fontWeight: '800', color: 'var(--lotus)' }}>STRATEGIC VIEW</div>
                                    </div>
                                </div>
                                <div style={{ height: '400px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-light)', background: 'var(--background-alt)' }}>
                                    {topologyLoading ? (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <SkeletonCard />
                                        </div>
                                    ) : schoolTopology ? (
                                        <UniversalPerspective 
                                            topology={schoolTopology}
                                            onNodePress={(node) => {
                                                console.log('Principal tapped node:', node);
                                                // Future: Navigate to department or classroom specific view
                                            }}
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-ghost)', fontSize: '14px' }}>
                                            Initializing topology pulse...
                                        </div>
                                    )}
                                </div>
                                <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--ink-ghost)', fontStyle: 'italic' }}>
                                    Visualizing organizational structure and resonance hotspots across all departments.
                                </p>
                            </div>

                            {/* Student Pulse */}
                            <div className="sanctuary-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Student Pulse</h3>
                                </div>
                                {staffLoading ? (
                                    <SkeletonCard />
                                ) : studentPulse ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                        {[
                                            {
                                                label: 'Today\'s Attendance',
                                                value: studentPulse.todayRate > 0 ? `${Math.round(studentPulse.todayRate)}%` : '—',
                                                icon: CheckCircle2,
                                                color: attendancePct >= 90 ? 'var(--moss)' : attendancePct >= 75 ? 'var(--amber-glow)' : 'var(--ember)',
                                                sub: studentPulse.yesterdayRate > 0
                                                    ? `Yesterday: ${Math.round(studentPulse.yesterdayRate)}%`
                                                    : 'No data for yesterday'
                                            },
                                            {
                                                label: 'At-Risk Students',
                                                value: String(studentPulse.atRiskCount),
                                                icon: AlertTriangle,
                                                color: studentPulse.atRiskCount > 0 ? 'var(--ember)' : 'var(--moss)',
                                                sub: studentPulse.atRiskCount > 0 ? 'Tap to view names ↗' : 'All on track',
                                                onClick: studentPulse.atRiskCount > 0 ? () => { setShowAtRiskPanel(true); loadAtRiskStudents(); } : undefined,
                                            },
                                            {
                                                label: 'Total Students',
                                                value: schoolStats?.total_students != null ? String(schoolStats.total_students) : '—',
                                                icon: GraduationCap,
                                                color: 'var(--water)',
                                                sub: schoolStats?.total_classrooms != null ? `Across ${schoolStats.total_classrooms} classes` : ''
                                            },
                                        ].map((item: any, i) => (
                                            <div key={i} onClick={item.onClick} style={{ padding: '20px', background: 'var(--background-alt)', borderRadius: '16px', cursor: item.onClick ? 'pointer' : 'default', border: item.onClick ? '2px solid transparent' : '1px solid transparent', transition: 'border-color 0.15s' }}
                                                onMouseOver={e => { if (item.onClick) (e.currentTarget as HTMLElement).style.borderColor = 'var(--ember)'; }}
                                                onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}>
                                                <div style={{ color: item.color, marginBottom: '12px' }}>
                                                    <item.icon size={20} />
                                                </div>
                                                <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>{item.value}</div>
                                                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</div>
                                                {item.sub && <div style={{ fontSize: '11px', color: item.onClick ? item.color : 'var(--ink-ghost)' }}>{item.sub}</div>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--ink-ghost)', fontSize: '14px' }}>No student data available yet.</p>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Approvals & Ecosystem Pulse */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                            {/* Pending Leave Approvals */}
                            <div className="sanctuary-card" style={{ padding: '24px' }}>
                                <h3 style={{ margin: '0 0 20px', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)' }}>
                                    Pending Approvals
                                    {pendingLeaves.length > 0 && (
                                        <span style={{ marginLeft: '8px', padding: '3px 8px', background: 'var(--amber-glow)', color: 'white', borderRadius: '6px', fontSize: '11px' }}>
                                            {pendingLeaves.length}
                                        </span>
                                    )}
                                </h3>
                                {staffLoading ? (
                                    <SkeletonCard />
                                ) : pendingLeaves.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                        <CheckCircle2 size={24} color="var(--moss)" style={{ marginBottom: 8 }} />
                                        <p style={{ color: 'var(--ink-ghost)', fontSize: '13px', margin: 0 }}>No pending leave requests.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {pendingLeaves.map(leave => (
                                            <div key={leave.id} style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <CalendarOff size={14} />
                                                        {leave.leave_type.charAt(0).toUpperCase() + leave.leave_type.slice(1)} Leave
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>
                                                        {new Date(leave.start_date).toLocaleDateString()} — {new Date(leave.end_date).toLocaleDateString()}
                                                    </div>
                                                    {leave.created_at && (
                                                        <div style={{ fontSize: '10px', color: 'var(--ink-ghost)', marginTop: '2px' }}>
                                                            {formatDistanceToNow(new Date(leave.created_at), { addSuffix: true })}
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        disabled={processingLeave === leave.id}
                                                        onClick={async () => {
                                                            setProcessingLeave(leave.id);
                                                            const ok = await staffManagementAPI.approveLeave(leave.id, effectiveUserId, true);
                                                            if (ok) setPendingLeaves(prev => prev.filter(l => l.id !== leave.id));
                                                            setProcessingLeave(null);
                                                        }}
                                                        style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--moss-soft)', color: 'var(--moss)', border: 'none', fontWeight: '700', fontSize: '11px', cursor: 'pointer', opacity: processingLeave === leave.id ? 0.5 : 1 }}
                                                    >
                                                        {processingLeave === leave.id ? '…' : 'Approve'}
                                                    </button>
                                                    <button
                                                        disabled={processingLeave === leave.id}
                                                        onClick={async () => {
                                                            setProcessingLeave(leave.id);
                                                            const ok = await staffManagementAPI.approveLeave(leave.id, effectiveUserId, false);
                                                            if (ok) setPendingLeaves(prev => prev.filter(l => l.id !== leave.id));
                                                            setProcessingLeave(null);
                                                        }}
                                                        style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--background-alt)', color: 'var(--ink-ghost)', border: 'none', fontWeight: '700', fontSize: '11px', cursor: 'pointer', opacity: processingLeave === leave.id ? 0.5 : 1 }}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Ecosystem Pulse */}
                            {!pulseLoading && pulse && (
                                <div className="sanctuary-card" style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>Ecosystem Pulse</h3>
                                        <Activity size={16} color={pulse.trend === 'rising' ? 'var(--moss)' : pulse.trend === 'failing' ? 'var(--ember)' : 'var(--water)'} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                                                <span>Resonance Score</span>
                                                <span style={{ color: resonanceScore >= 70 ? 'var(--moss)' : resonanceScore >= 40 ? 'var(--amber-glow)' : 'var(--ember)' }}>
                                                    {Math.round(resonanceScore)}%
                                                </span>
                                            </div>
                                            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${resonanceScore}%`, height: '100%', background: 'var(--lotus)', borderRadius: '3px', transition: 'width 0.6s ease' }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                                                <span>Participation Rate</span>
                                                <span style={{ color: 'var(--water)' }}>{Math.round(pulse.participation_rate)}%</span>
                                            </div>
                                            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${pulse.participation_rate}%`, height: '100%', background: 'var(--water)', borderRadius: '3px', transition: 'width 0.6s ease' }} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <TrendingUp size={14} color={pulse.trend === 'rising' ? 'var(--moss)' : 'var(--ink-ghost)'} />
                                            <span style={{ fontSize: '12px', color: 'var(--ink-ghost)', textTransform: 'capitalize' }}>
                                                Trend: {pulse.trend}
                                            </span>
                                        </div>
                                        {pulse.top_subjects.length > 0 && (
                                            <div>
                                                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase', marginBottom: '8px' }}>Top Subjects</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    {pulse.top_subjects.slice(0, 4).map(s => (
                                                        <span key={s} style={{ padding: '3px 10px', background: 'var(--background-alt)', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* School Stats quick view */}
                            {schoolStats && (
                                <div className="sanctuary-card" style={{ padding: '24px' }}>
                                    <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '800' }}>School Overview</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {[
                                            { label: 'Teachers', value: String(schoolStats.total_teachers ?? 0), icon: UserCheck },
                                            { label: 'Classrooms', value: String(schoolStats.total_classrooms ?? 0), icon: BookOpen },
                                            { label: 'Students', value: String(schoolStats.total_students ?? 0), icon: GraduationCap },
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--background-alt)', borderRadius: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '600' }}>
                                                    <item.icon size={16} color="var(--ink-ghost)" />
                                                    {item.label}
                                                </div>
                                                <span style={{ fontSize: '16px', fontWeight: '800' }}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ─── Dashboard Echo (teacher/student feedback) ── */}
                            <div className="sanctuary-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {t('principal.echo.title') || 'Echo Chamber'}
                                            {echoItems.filter(e => !e.is_read).length > 0 && (
                                                <span style={{ background: 'var(--ember)', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '10px', fontWeight: '800' }}>
                                                    {echoItems.filter(e => !e.is_read).length} new
                                                </span>
                                            )}
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--ink-ghost)' }}>{t('principal.echo.subtitle') || 'Feedback from your staff & students'}</p>
                                    </div>
                                </div>
                                {echoLoading ? (
                                    <SkeletonCard />
                                ) : echoItems.length === 0 ? (
                                    <p style={{ color: 'var(--ink-ghost)', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>
                                        {t('principal.echo.empty') || 'No feedback yet.'}
                                    </p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {echoItems.map(item => {
                                            const CategoryIcon = item.category === 'morale' ? Heart
                                                : item.category === 'facility' ? AlertTriangle
                                                    : item.category === 'recognition' ? CheckCircle2
                                                        : MessageSquare;
                                            const borderColor = item.priority === 'high' ? 'var(--ember)' : 'var(--lotus)';
                                            const isExpanded = replyingTo === item.id;
                                            return (
                                                <div key={item.id} style={{
                                                    padding: '14px',
                                                    background: item.is_read ? 'var(--background-alt)' : 'var(--background)',
                                                    border: '1px solid var(--border-light)',
                                                    borderLeft: `4px solid ${borderColor}`,
                                                    borderRadius: '10px',
                                                }}>
                                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                        <div style={{ padding: '8px', background: 'var(--background-alt)', borderRadius: '8px', flexShrink: 0 }}>
                                                            <CategoryIcon size={16} color="var(--lotus)" />
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                                <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>
                                                                    {item.source} · {item.category}
                                                                    {!item.is_read && <span style={{ marginLeft: '6px', color: 'var(--ember)' }}>● unread</span>}
                                                                </span>
                                                                <span style={{ fontSize: '10px', color: 'var(--ink-ghost)' }}>
                                                                    {new Date(item.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p style={{ margin: '0 0 8px', fontSize: '13px', lineHeight: '1.5' }}>
                                                                {item.content}
                                                            </p>
                                                            {/* Principal response (if already sent) */}
                                                            {item.principal_response && (
                                                                <div style={{ marginTop: '8px', padding: '10px 12px', background: 'rgba(212,132,58,0.08)', borderRadius: '8px', borderLeft: '3px solid var(--sanctuary-saffron)' }}>
                                                                    <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--sanctuary-saffron)', textTransform: 'uppercase', marginBottom: '4px' }}>Your Reply</div>
                                                                    <p style={{ margin: 0, fontSize: '12px', lineHeight: '1.5' }}>{item.principal_response}</p>
                                                                    {item.responded_at && <div style={{ fontSize: '10px', color: 'var(--ink-ghost)', marginTop: '4px' }}>{formatDistanceToNow(new Date(item.responded_at), { addSuffix: true })}</div>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Action row */}
                                                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', justifyContent: 'flex-end' }}>
                                                        {!item.is_read && (
                                                            <button onClick={() => handleMarkEchoRead(item.id)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', fontFamily: 'var(--font-body)' }}>
                                                                ✓ Mark read
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                if (isExpanded) { setReplyingTo(null); setReplyText(''); }
                                                                else { setReplyingTo(item.id); setReplyText(item.principal_response ?? ''); }
                                                            }}
                                                            style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--lotus)', background: isExpanded ? 'var(--lotus-soft)' : 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700', color: 'var(--lotus)', fontFamily: 'var(--font-body)' }}
                                                        >
                                                            {item.principal_response ? '✏️ Edit reply' : '↩ Reply'}
                                                        </button>
                                                    </div>
                                                    {/* Inline reply input */}
                                                    {isExpanded && (
                                                        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            <textarea
                                                                value={replyText}
                                                                onChange={e => setReplyText(e.target.value)}
                                                                placeholder="Write your response to this feedback…"
                                                                rows={2}
                                                                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--lotus)', background: 'var(--background)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '13px', resize: 'vertical' as const, width: '100%', boxSizing: 'border-box' as const }}
                                                            />
                                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                                <button onClick={() => { setReplyingTo(null); setReplyText(''); }} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-body)' }}>Cancel</button>
                                                                <button onClick={() => handleSendEchoReply(item.id)} disabled={!replyText.trim() || savingReply} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'var(--lotus)', color: '#fff', cursor: replyText.trim() && !savingReply ? 'pointer' : 'not-allowed', opacity: replyText.trim() && !savingReply ? 1 : 0.6, fontSize: '12px', fontWeight: '700', fontFamily: 'var(--font-body)' }}>
                                                                    {savingReply ? '⏳' : '↩ Send Reply'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* ─── Institutional Calendar ─────────────────── */}
                            <div className="sanctuary-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <CalendarCheck size={16} color="var(--water)" /> Upcoming Events
                                    </h3>
                                </div>
                                {calendarLoading ? (
                                    <SkeletonCard />
                                ) : calendarEvents.length === 0 ? (
                                    <p style={{ color: 'var(--ink-ghost)', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', padding: '12px 0' }}>No upcoming events.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {calendarEvents.slice(0, 4).map(evt => {
                                            const typeColors: Record<string, string> = { term_start: 'var(--water)', exam: 'var(--ember)', holiday: 'var(--moss)', event: 'var(--sanctuary-saffron)', other: 'var(--ink-ghost)' };
                                            const color = typeColors[evt.type] ?? 'var(--ink-ghost)';
                                            return (
                                                <div key={evt.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: 'var(--background-alt)' }}>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '13px', fontWeight: '700' }}>{evt.title}</div>
                                                        <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>
                                                            {new Date(evt.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                            {evt.end_date && ` – ${new Date(evt.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                                                        </div>
                                                    </div>
                                                    <span style={{ padding: '2px 6px', background: `${color}22`, borderRadius: '4px', fontSize: '10px', fontWeight: '700', color, textTransform: 'uppercase' }}>
                                                        {evt.type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* ─── Principal Observations ─────────────────── */}
                            <div className="sanctuary-card" style={{ padding: '24px' }}>
                                <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <NotebookPen size={16} color="var(--sanctuary-saffron)" /> My Observations
                                </h3>

                                {/* Quick-add form */}
                                <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {(['walkthrough', 'note', 'concern', 'praise'] as const).map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setObsType(type)}
                                                style={{ flex: 1, padding: '6px 4px', borderRadius: '8px', border: `1px solid ${obsType === type ? 'var(--sanctuary-saffron)' : 'var(--border)'}`, background: obsType === type ? 'rgba(245,158,11,0.08)' : 'var(--background-alt)', color: obsType === type ? 'var(--sanctuary-saffron)' : 'var(--ink-ghost)', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: '700', cursor: 'pointer', textTransform: 'uppercase' }}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={obsContent}
                                        onChange={(e: any) => setObsContent(e.target.value)}
                                        placeholder="Quick observation…"
                                        rows={2}
                                        style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '13px', width: '100%', boxSizing: 'border-box' as const, resize: 'vertical' as const }}
                                    />
                                    <button
                                        className="premium-button"
                                        style={{ alignSelf: 'flex-end', fontSize: '12px', padding: '6px 14px', background: 'var(--sanctuary-saffron)' }}
                                        onClick={handleSaveObservation}
                                        disabled={!obsContent.trim() || savingObs}
                                    >
                                        {savingObs ? '⏳' : '+ Log'}
                                    </button>
                                </div>

                                {obsLoading ? (
                                    <SkeletonCard />
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {observations.map(obs => {
                                            const obsColors: Record<string, string> = { walkthrough: 'var(--water)', note: 'var(--ink-ghost)', concern: 'var(--ember)', praise: 'var(--moss)' };
                                            const color = obsColors[obs.type] ?? 'var(--ink-ghost)';
                                            return (
                                                <div key={obs.id} style={{ padding: '12px', borderRadius: '10px', borderLeft: `3px solid ${color}`, background: 'var(--background-alt)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                        <span style={{ fontSize: '10px', fontWeight: '800', color, textTransform: 'uppercase' }}>{obs.type}</span>
                                                        <span style={{ fontSize: '10px', color: 'var(--ink-ghost)' }}>{new Date(obs.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '12px', lineHeight: '1.5', color: 'var(--ink)' }}>{obs.content}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Guest Invitation */}
                    {isGuest && (
                        <div style={{ padding: '40px 0 100px', display: 'flex', justifyContent: 'center' }}>
                            <div style={{ maxWidth: '800px', width: '100%' }}>
                                <PositiveInvitation
                                    type="guest"
                                    context="classroom"
                                    onAction={() => navigation.navigate('Auth')}
                                />
                            </div>
                        </div>
                    )}

                    {(!effectiveSchoolId && !isGuest) && (
                        <div style={{ padding: '40px 0 100px', display: 'flex', justifyContent: 'center' }}>
                            <div style={{ maxWidth: '800px', width: '100%' }}>
                                <PositiveInvitation
                                    type="empty"
                                    title="Establish your own Sanctuary"
                                    description="You're currently viewing a demo. Ready to bring your own vision to life? Create your official school profile now and start your journey."
                                    actionLabel="Create Your School"
                                    onAction={() => setIsCreateModalOpen(true)}
                                />
                            </div>
                        </div>
                    )}
                </>}
            </div>

            {/* ── Modals ──────────────────────────────────────── */}
            <CreateClassroomModal
                isOpen={showCreateClassroom}
                onClose={() => setShowCreateClassroom(false)}
                onSuccess={() => setShowCreateClassroom(false)}
            />
            <AddStudentModal
                isOpen={showAddTeacher}
                onClose={() => setShowAddTeacher(false)}
                onSuccess={() => setShowAddTeacher(false)}
                classroomId=""
                studentToEdit={null}
            />

            {/* ── At-Risk Students Panel ───────────────────────── */}
            {showAtRiskPanel && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 9500, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
                    onClick={e => e.target === e.currentTarget && setShowAtRiskPanel(false)}
                >
                    <div style={{ background: 'var(--background)', borderRadius: '20px 20px 0 0', padding: '28px', width: '100%', maxWidth: '600px', maxHeight: '60vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--ember)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    ⚠️ At-Risk Students
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--ink-ghost)' }}>Absent both today and yesterday</p>
                            </div>
                            <button onClick={() => setShowAtRiskPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--ink-ghost)' }}>✕</button>
                        </div>
                        {atRiskLoading ? (
                            [1, 2, 3].map(i => <div key={i} style={{ height: '50px', background: 'var(--background-alt)', borderRadius: '10px', marginBottom: '8px' }} />)
                        ) : atRiskStudents.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-ghost)', fontStyle: 'italic' }}>
                                No at-risk students found in the last 2 days.
                            </div>
                        ) : atRiskStudents.map(s => (
                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--ember)', background: 'rgba(239,68,68,0.04)', marginBottom: '8px' }}>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{s.full_name}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>{s.classroom_name}</div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowAtRiskPanel(false);
                                        navigation.navigate('ClassroomList');
                                    }}
                                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--ember)', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: 'var(--ember)', fontFamily: 'var(--font-body)' }}
                                >
                                    View Classroom →
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <CreateSchoolModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={(newSchool) => {
                    setIsCreateModalOpen(false);
                    onRefresh?.();
                }}
            />
        </>
    );
}
