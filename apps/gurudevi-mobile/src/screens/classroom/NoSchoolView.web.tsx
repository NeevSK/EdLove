/**
 * NoSchoolView.web.tsx
 *
 * Shown to authenticated users who have no school_id yet.
 * Each role sees exactly the right flow:
 *
 *  PRINCIPAL → Create School (2-step wizard)
 *
 *  TEACHER   → Three options in a tab bar:
 *               1. Join a School (invite code or name search)
 *                  → after joining, create or join a classroom under that school
 *               2. Create standalone personal classroom (no school needed)
 *
 *  STUDENT   → Join Classroom via 8-char teacher invite code (claimStudent)
 */

import React, { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
    schoolAPI, onboardingAPI, validateInviteCode, incrementInviteCodeUsage,
    communityAPI, api, useStore, useUserRole, supabase,
} from '@repo/core';
import {
    Building2, BookOpen, Users, Search, Key, CheckCircle2,
    ArrowRight, ChevronRight,
} from 'lucide-react-native';

// ─────────────────────────────────────────────────────────────────────────────
// Tiny helpers
// ─────────────────────────────────────────────────────────────────────────────

function Spin({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            style={{ animation: 'spin 0.7s linear infinite', display: 'block' }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p style={{
            margin: '0 0 8px', fontSize: '11px', fontWeight: '800',
            textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ink-ghost)'
        }}>
            {children}
        </p>
    );
}

function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
    const { label, error, ...rest } = props;
    return (
        <div>
            {label && <SectionLabel>{label}</SectionLabel>}
            <input
                {...rest}
                style={{
                    width: '100%', boxSizing: 'border-box' as const,
                    padding: '11px 14px', borderRadius: '10px',
                    border: `1.5px solid ${error ? 'var(--ember)' : 'var(--border)'}`,
                    background: 'var(--background-alt)', color: 'var(--ink)',
                    fontFamily: 'var(--font-body)', fontSize: '14px',
                    ...rest.style,
                }}
            />
            {error && <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--ember)' }}>{error}</p>}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUCCESS CARD — reused across flows
// ─────────────────────────────────────────────────────────────────────────────

function SuccessCard({ emoji, title, body, cta, onCta }: {
    emoji: string; title: string; body: string; cta: string; onCta: () => void;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px 16px', textAlign: 'center' }}>
            <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'rgba(34,197,94,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <CheckCircle2 size={32} color="var(--moss)" />
            </div>
            <div style={{ fontSize: '28px' }}>{emoji}</div>
            <div>
                <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: '800' }}>{title}</h3>
                <p style={{ margin: 0, color: 'var(--ink-ghost)', fontSize: '13px', maxWidth: '380px' }}>{body}</p>
            </div>
            <button className="premium-button"
                style={{ background: 'var(--sanctuary-saffron)', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={onCta}>
                {cta} <ArrowRight size={14} />
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRINCIPAL — Create School
// ─────────────────────────────────────────────────────────────────────────────

const SCHOOL_TYPES = [
    { value: 'primary', label: 'Primary School', emoji: '🏫', desc: 'Grades 1–5' },
    { value: 'secondary', label: 'Secondary School', emoji: '🎓', desc: 'Grades 6–13' },
    { value: 'mixed', label: 'Mixed / All Grades', emoji: '🌿', desc: 'All grade levels' },
] as const;

function PrincipalCreateSchool({ onSuccess }: { onSuccess: () => void }) {
    const { user } = useStore();
    const [step, setStep] = useState<'details' | 'type' | 'done'>('details');
    const [name, setName] = useState('');
    const [type, setType] = useState<'primary' | 'secondary' | 'mixed'>('mixed');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [schoolName, setSchoolName] = useState('');

    const handleCreate = async () => {
        if (!user?.id || !name.trim()) return;
        setLoading(true); setError('');
        try {
            const school = await schoolAPI.create({ name: name.trim(), type, created_by: user.id });
            try {
                await communityAPI.createGroupWithOwner({
                    name: `${school.name} HQ`,
                    description: `Official community for ${school.name}`,
                    group_type: 'general',
                    join_policy: 'open',
                    school_id: school.id,
                }, user.id);
            } catch { /* non-fatal */ }
            setSchoolName(school.name);
            useStore.getState().setUser({ ...user, school_id: school.id });
            setStep('done');
        } catch (e: any) {
            setError(e?.message || 'Failed to create school');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'done') return (
        <SuccessCard
            emoji="🏛️"
            title={`${schoolName} is live!`}
            body="Your school sanctuary is ready. Invite teachers, create classrooms and start your journey."
            cta="Set up my school"
            onCta={onSuccess}
        />
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {step === 'details' && (
                <>
                    <FieldInput label="School Name *" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Gurudevi Life School" />
                    <button className="premium-button"
                        style={{ background: 'var(--sanctuary-saffron)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        onClick={() => setStep('type')} disabled={!name.trim()}>
                        Next — Choose school type <ChevronRight size={14} />
                    </button>
                </>
            )}

            {step === 'type' && (
                <>
                    <p style={{ margin: 0, color: 'var(--ink-ghost)', fontSize: '13px' }}>
                        What kind of school is <strong style={{ color: 'var(--ink)' }}>{name}</strong>?
                    </p>
                    {SCHOOL_TYPES.map(t => (
                        <button key={t.value} onClick={() => setType(t.value)} style={{
                            display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px',
                            borderRadius: '12px', border: `2px solid ${type === t.value ? 'var(--sanctuary-saffron)' : 'var(--border)'}`,
                            background: type === t.value ? 'rgba(212,132,58,0.06)' : 'var(--background-alt)',
                            cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left' as const,
                        }}>
                            <span style={{ fontSize: '22px' }}>{t.emoji}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--ink)' }}>{t.label}</div>
                                <div style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>{t.desc}</div>
                            </div>
                            {type === t.value && <CheckCircle2 size={16} color="var(--sanctuary-saffron)" />}
                        </button>
                    ))}
                    {error && <p style={{ margin: 0, fontSize: '12px', color: 'var(--ember)' }}>{error}</p>}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="secondary-button" onClick={() => setStep('details')} style={{ flex: 1 }}>← Back</button>
                        <button className="premium-button"
                            style={{ flex: 2, background: 'var(--sanctuary-saffron)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            onClick={handleCreate} disabled={loading}>
                            {loading ? <><Spin /> Creating…</> : <><Building2 size={14} /> Create School</>}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEACHER — Join School (invite code or name search)
// ─────────────────────────────────────────────────────────────────────────────

function TeacherJoinSchool({ onJoined }: { onJoined: (schoolId: string) => void }) {
    const { user } = useStore();
    const [method, setMethod] = useState<'code' | 'search'>('code');

    // ── invite code path ──
    const [code, setCode] = useState('');
    const [codeErr, setCodeErr] = useState('');
    const [codeLoading, setCodeLoading] = useState(false);

    const fmtCode = (v: string) => {
        const raw = v.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 16);
        if (raw.length <= 4) return raw;
        if (raw.length <= 10) return `${raw.slice(0, 4)}-${raw.slice(4)}`;
        return `${raw.slice(0, 4)}-${raw.slice(4, 10)}-${raw.slice(10)}`;
    };

    const handleCode = async () => {
        if (!user?.id) return;
        setCodeLoading(true); setCodeErr('');
        try {
            const res = await validateInviteCode(code.trim());
            if (!res.valid || !res.data) { setCodeErr(res.error || 'Invalid code'); return; }
            await onboardingAPI.requestSchoolJoin(user.id, res.data.school_id, 'teacher');
            await incrementInviteCodeUsage(code.trim());
            const { data: p } = await supabase.from('users').select('school_id').eq('id', user.id).single();
            if (p?.school_id) {
                useStore.getState().setUser({ ...user, school_id: p.school_id });
                onJoined(p.school_id);
            }
        } catch (e: any) {
            setCodeErr(e?.message || 'Something went wrong');
        } finally {
            setCodeLoading(false);
        }
    };

    // ── search path ──
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [requesting, setRequesting] = useState<string | null>(null);
    const [reqSent, setReqSent] = useState(false);

    const handleSearch = useCallback(async () => {
        if (query.length < 3) return;
        setSearching(true);
        try { setResults(await schoolAPI.searchSchools(query)); }
        finally { setSearching(false); }
    }, [query]);

    const handleRequest = async (schoolId: string) => {
        if (!user?.id) return;
        setRequesting(schoolId);
        try {
            await onboardingAPI.requestSchoolJoin(user.id, schoolId, 'teacher');
            setReqSent(true);
        } finally { setRequesting(null); }
    };

    if (reqSent) return (
        <SuccessCard
            emoji="📬"
            title="Request Sent!"
            body="Your join request has been sent to the Principal. You'll be notified once approved."
            cta="OK, I'll wait"
            onCta={() => setReqSent(false)}
        />
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Method tabs */}
            <div style={{ display: 'flex', gap: '6px', padding: '3px', background: 'var(--background-alt)', borderRadius: '10px' }}>
                {([{ id: 'code', label: '🔑 Invite Code' }, { id: 'search', label: '🔍 Search School' }] as const).map(m => (
                    <button key={m.id} onClick={() => setMethod(m.id)} style={{
                        flex: 1, padding: '8px 12px', borderRadius: '8px', border: 'none',
                        fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                        background: method === m.id ? 'var(--background)' : 'transparent',
                        color: method === m.id ? 'var(--ink)' : 'var(--ink-ghost)',
                        boxShadow: method === m.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    }}>{m.label}</button>
                ))}
            </div>

            {/* Invite code */}
            {method === 'code' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <FieldInput
                        label="Invite Code from Principal"
                        value={code} onChange={e => setCode(fmtCode(e.target.value))}
                        placeholder="GURU-ABC123-TEACH"
                        error={codeErr}
                        style={{ fontFamily: 'var(--font-mono, monospace)', letterSpacing: '2px', textTransform: 'uppercase' as const, fontWeight: '700' }}
                        onKeyDown={(e: any) => e.key === 'Enter' && code.length >= 15 && handleCode()}
                    />
                    <button className="premium-button"
                        style={{ background: 'var(--sanctuary-saffron)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        onClick={handleCode} disabled={code.length < 15 || codeLoading}>
                        {codeLoading ? <Spin /> : <Key size={14} />}
                        {codeLoading ? 'Joining…' : 'Join with Code'}
                    </button>
                </div>
            )}

            {/* Search */}
            {method === 'search' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input value={query} onChange={e => setQuery(e.target.value)}
                            onKeyDown={(e: any) => e.key === 'Enter' && handleSearch()}
                            placeholder="Type school name…"
                            style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '13px' }} />
                        <button className="secondary-button" onClick={handleSearch} disabled={query.length < 3 || searching}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {searching ? <Spin size={13} /> : <Search size={13} />} Search
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                        {results.map(s => (
                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '10px', background: 'var(--background-alt)', border: '1px solid var(--border-light)' }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '700' }}>{s.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>{s.type}</div>
                                </div>
                                <button className="secondary-button" style={{ fontSize: '12px', padding: '6px 12px' }}
                                    onClick={() => handleRequest(s.id)} disabled={requesting === s.id}>
                                    {requesting === s.id ? <Spin size={12} /> : 'Request Join'}
                                </button>
                            </div>
                        ))}
                        {!searching && query.length >= 3 && results.length === 0 && (
                            <p style={{ fontSize: '12px', color: 'var(--ink-ghost)', textAlign: 'center', margin: 0 }}>No schools found. Try a different name or get an invite code.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEACHER — Create standalone classroom (no school needed)
// ─────────────────────────────────────────────────────────────────────────────

function TeacherCreateStandaloneClassroom({ onSuccess }: { onSuccess: () => void }) {
    const { user } = useStore();
    const { userId } = useUserRole();
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [created, setCreated] = useState<{ name: string } | null>(null);

    const handleCreate = async () => {
        if (!userId || !name.trim()) return;
        setLoading(true); setError('');
        try {
            await api.classrooms.create({
                name: name.trim(),
                subject: subject.trim() || undefined,
                teacher_id: userId,
                school_id: null as any,   // standalone — no school
                is_archived: false,
            } as any);
            setCreated({ name: name.trim() });
        } catch (e: any) {
            setError(e?.message || 'Failed to create classroom');
        } finally {
            setLoading(false);
        }
    };

    if (created) return (
        <SuccessCard
            emoji="📚"
            title={`"${created.name}" is ready!`}
            body="Your personal classroom is live. Start adding students and lessons."
            cta="Go to my classroom"
            onCta={onSuccess}
        />
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px 16px', background: 'rgba(212,132,58,0.06)', borderRadius: '10px', border: '1px solid rgba(212,132,58,0.15)', fontSize: '12px', color: 'var(--ink-ghost)', lineHeight: '1.6' }}>
                💡 A <strong style={{ color: 'var(--ink)' }}>standalone classroom</strong> is personal — it's not linked to any school.
                You can join a school later and move classrooms under it.
            </div>
            <FieldInput label="Classroom Name *" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Grade 10B Science" />
            <FieldInput label="Subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Biology" />
            {error && <p style={{ margin: 0, fontSize: '12px', color: 'var(--ember)' }}>{error}</p>}
            <button className="premium-button"
                style={{ background: 'var(--water)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={handleCreate} disabled={!name.trim() || loading}>
                {loading ? <><Spin /> Creating…</> : <><BookOpen size={14} /> Create Classroom</>}
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEACHER — top-level: 3 tabs
// ─────────────────────────────────────────────────────────────────────────────

type TeacherTab = 'join_school' | 'standalone';

function TeacherFlow({ onSuccess }: { onSuccess: () => void }) {
    const [tab, setTab] = useState<TeacherTab>('join_school');
    const [joinedSchoolId, setJoinedSchoolId] = useState<string | null>(null);

    const TABS: { id: TeacherTab; label: string; icon: React.ReactNode }[] = [
        { id: 'join_school', label: 'Join a School', icon: <Building2 size={14} /> },
        { id: 'standalone', label: 'Personal Classroom', icon: <BookOpen size={14} /> },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Tab bar */}
            <div style={{ display: 'flex', gap: '6px', padding: '3px', background: 'var(--background-alt)', borderRadius: '12px' }}>
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '10px 8px', borderRadius: '10px', border: 'none',
                        fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                        background: tab === t.id ? 'var(--background)' : 'transparent',
                        color: tab === t.id ? 'var(--sanctuary-saffron)' : 'var(--ink-ghost)',
                        boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.15s',
                    }}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {tab === 'join_school' && (
                joinedSchoolId
                    ? <SuccessCard
                        emoji="🎉"
                        title="Joined!"
                        body="You've been added to the school. Go ahead and create your classroom."
                        cta="Continue"
                        onCta={onSuccess}
                    />
                    : <TeacherJoinSchool onJoined={id => { setJoinedSchoolId(id); onSuccess(); }} />
            )}

            {tab === 'standalone' && (
                <TeacherCreateStandaloneClassroom onSuccess={onSuccess} />
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT — Join classroom via 8-char teacher invite code (claimStudent)
// ─────────────────────────────────────────────────────────────────────────────

function StudentJoinClassroom({ onSuccess }: { onSuccess: () => void }) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const handleClaim = async () => {
        if (!code.trim()) return;
        setLoading(true); setError('');
        try {
            await api.classroomStudents.claimStudent(code.trim());
            setDone(true);
        } catch (e: any) {
            setError(e?.message || 'Invalid code or record already claimed');
        } finally {
            setLoading(false);
        }
    };

    if (done) return (
        <SuccessCard
            emoji="🌱"
            title="Enrolled!"
            body="You've been linked to your classroom. Your teacher will see you in the roll."
            cta="Go to my classes"
            onCta={onSuccess}
        />
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px 16px', background: 'rgba(59,130,246,0.06)', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.15)', fontSize: '12px', color: 'var(--ink-ghost)', lineHeight: '1.6' }}>
                <Users size={13} color="var(--water)" style={{ marginRight: 6 }} />
                Ask your teacher for your classroom invite code.
                It's typically 8 characters, like <code style={{ fontWeight: '800', letterSpacing: '1px' }}>a1b2c3d4</code>.
            </div>

            <div>
                <SectionLabel>Your Classroom Code</SectionLabel>
                <input
                    value={code}
                    onChange={e => setCode(e.target.value.toLowerCase().slice(0, 12))}
                    onKeyDown={(e: any) => e.key === 'Enter' && code.length >= 6 && handleClaim()}
                    placeholder="a1b2c3d4"
                    style={{
                        width: '100%', boxSizing: 'border-box' as const,
                        padding: '14px 20px', borderRadius: '12px',
                        border: `2px solid ${error ? 'var(--ember)' : 'var(--border)'}`,
                        background: 'var(--background-alt)', color: 'var(--ink)',
                        fontFamily: 'var(--font-mono, monospace)', fontSize: '24px',
                        fontWeight: '800', letterSpacing: '4px', textAlign: 'center' as const,
                    }}
                />
                {error && <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--ember)' }}>{error}</p>}
            </div>

            <button className="premium-button"
                style={{ background: 'var(--water)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={handleClaim} disabled={code.length < 6 || loading}>
                {loading ? <><Spin /> Joining…</> : <><BookOpen size={14} /> Join Classroom</>}
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export default function NoSchoolView() {
    const { role } = useUserRole();
    const navigation = useNavigation<any>();

    const isPrincipal = role === 'principal' || role === 'founder' || role === 'admin';
    const isTeacher = role === 'teacher' || role === 'grade_head' || role === 'section_head';
    const isStudent = role === 'student';

    const handleSuccess = () => {
        // Navigate back to classroom tab — router reloads and picks up new school_id
        try { (navigation.navigate as any)('Classroom'); } catch { /* noop */ }
    };

    const META = isPrincipal
        ? { emoji: '🏛️', heading: 'Create your school', sub: 'Set up your school sanctuary. Invite teachers and students once ready.' }
        : isTeacher
            ? { emoji: '📚', heading: 'Set up your classroom', sub: 'Join a school, or create a standalone personal classroom right away.' }
            : { emoji: '🌱', heading: 'Join your classroom', sub: 'Enter the invite code your teacher gave you to link your account.' };

    return (
        <div style={{ maxWidth: '520px', margin: '0 auto', padding: '8px 0 48px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>{META.emoji}</div>
                <h1 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: '800' }}>{META.heading}</h1>
                <p style={{ margin: 0, color: 'var(--ink-ghost)', fontSize: '14px', lineHeight: '1.6', maxWidth: '380px', marginInline: 'auto' as any }}>
                    {META.sub}
                </p>
            </div>

            <div className="sanctuary-card" style={{ padding: '28px 32px' }}>
                {isPrincipal && <PrincipalCreateSchool onSuccess={handleSuccess} />}
                {isTeacher && <TeacherFlow onSuccess={handleSuccess} />}
                {isStudent && <StudentJoinClassroom onSuccess={handleSuccess} />}
            </div>
        </div>
    );
}
