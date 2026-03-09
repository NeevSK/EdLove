import React, { useState } from 'react';
import { useUserRole, useStore } from '@repo/core';
import { LotusPetalFAB, SandboxBanner } from '@repo/ui';
import { useNavigation } from '@react-navigation/native';
import {
    BookOpen, Users, Shield, GraduationCap, Zap, ArrowRight
} from 'lucide-react-native';

// High-Fidelity Role Sub-Views
import StudentDashboard from './classroom/views/StudentDashboard.web';
import TeacherDashboard from './classroom/views/TeacherDashboard.web';
import PrincipalSchoolView from './classroom/views/PrincipalSchoolView.web';
import FounderDashboard from './classroom/views/FounderDashboard.web';

/** Shown to guests / users with no school yet — lets them explore a demo role view */
function DemoExplorerView() {
    const navigation = useNavigation<any>();
    const { isDemoMode, setDemoMode } = useStore();
    const [demoRole, setDemoRole] = useState<'teacher' | 'principal' | 'student' | null>(null);

    const DEMO_ROLES = [
        {
            id: 'teacher' as const,
            emoji: '📚',
            title: 'Teacher',
            desc: 'Manage classrooms, assignments, attendance & gradebook.',
            color: 'var(--sanctuary-saffron)',
            bg: 'rgba(245,158,11,0.08)',
        },
        {
            id: 'principal' as const,
            emoji: '🏛️',
            title: 'Principal',
            desc: 'School-wide oversight: staff presence, leave approvals & echo.',
            color: 'var(--lotus)',
            bg: 'rgba(139,92,246,0.08)',
        },
        {
            id: 'student' as const,
            emoji: '🌱',
            title: 'Student',
            desc: 'Your sanctuaries, upcoming assignments & learning goals.',
            color: 'var(--moss)',
            bg: 'rgba(34,197,94,0.08)',
        },
    ];

    const enterDemo = (role: typeof demoRole) => {
        setDemoMode(true);
        setDemoRole(role);
    };

    const exitDemo = () => {
        setDemoMode(false);
        setDemoRole(null);
    };

    if (demoRole === 'teacher')  return <><DemoExitBanner onExit={exitDemo} /><TeacherDashboard /></>;
    if (demoRole === 'principal') return <><DemoExitBanner onExit={exitDemo} /><PrincipalSchoolView schoolId="mock-school" userId="mock-principal" /></>;
    if (demoRole === 'student')  return <><DemoExitBanner onExit={exitDemo} /><StudentDashboard /></>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', padding: '8px 0' } as any}>
            {/* Hero */}
            <div style={{ textAlign: 'center', padding: '0 16px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌿</div>
                <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 12px' }}>
                    Welcome to <span style={{ color: 'var(--sanctuary-saffron)' }}>Gurudevi</span>
                </h1>
                <p style={{ fontSize: '16px', color: 'var(--ink-ghost)', maxWidth: '520px', margin: '0 auto 28px', lineHeight: '1.6' }}>
                    A living classroom ecosystem for teachers, principals and students.
                    Explore any role below — no account required.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        className="premium-button"
                        style={{ background: 'var(--sanctuary-saffron)', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => navigation.navigate('Auth')}
                    >
                        Get started <ArrowRight size={16} />
                    </button>
                    <button className="secondary-button" onClick={() => navigation.navigate('Auth')}>
                        Sign in
                    </button>
                </div>
            </div>

            {/* Role Explorer */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <Zap size={16} color="var(--sanctuary-saffron)" fill="var(--sanctuary-saffron)" />
                    <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--ink-ghost)' }}>
                        Explore Demo
                    </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                    {DEMO_ROLES.map(r => (
                        <button
                            key={r.id}
                            onClick={() => enterDemo(r.id)}
                            style={{
                                background: r.bg,
                                border: `1.5px solid ${r.color}44`,
                                borderRadius: '16px',
                                padding: '24px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                            }}
                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                        >
                            <span style={{ fontSize: '32px' }}>{r.emoji}</span>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink)', marginBottom: '6px' }}>{r.title}</div>
                                <div style={{ fontSize: '13px', color: 'var(--ink-ghost)', lineHeight: '1.5' }}>{r.desc}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: r.color, marginTop: '4px' }}>
                                Explore as {r.title} <ArrowRight size={14} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Feature highlights */}
            <div>
                <div style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--ink-ghost)', marginBottom: '20px' }}>
                    What you can do
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {[
                        { icon: BookOpen, label: 'Classroom Management', desc: 'Create, organise and run classrooms with lessons, resources and gradebooks.' },
                        { icon: Users, label: 'Attendance & Pulse', desc: 'Mark attendance, track trends and spot at-risk students in seconds.' },
                        { icon: Shield, label: 'Principal Oversight', desc: 'Staff presence, leave approvals, echo chamber and school-wide analytics.' },
                        { icon: GraduationCap, label: 'Student Journey', desc: 'Goals, assignments, growth points and personal reflections — all in one place.' },
                    ].map((f, i) => (
                        <div key={i} className="sanctuary-card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                            <div style={{ padding: '10px', background: 'var(--background-alt)', borderRadius: '10px', flexShrink: 0 }}>
                                <f.icon size={20} color="var(--action)" />
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{f.label}</div>
                                <div style={{ fontSize: '12px', color: 'var(--ink-ghost)', lineHeight: '1.5' }}>{f.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function DemoExitBanner({ onExit }: { onExit: () => void }) {
    return (
        <div style={{
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid var(--amber-glow)',
            borderRadius: '12px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '24px',
            flexWrap: 'wrap',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--amber-glow)', fontWeight: '700' }}>
                <Zap size={15} fill="var(--amber-glow)" />
                You are exploring a demo view — data is simulated.
            </div>
            <button onClick={onExit} className="secondary-button" style={{ fontSize: '12px', padding: '6px 14px' }}>
                ← Exit demo
            </button>
        </div>
    );
}

export default function ClassroomScreenWeb() {
    const { role, isGuest } = useUserRole();
    const { user, isDemoMode } = useStore();

    const renderRoleView = () => {
        const schoolId = user?.school_id || '';
        const userId = user?.id;

        // Guest or user without school: show the explorer landing
        if (isGuest || !role) {
            return <DemoExplorerView />;
        }

        switch (role) {
            case 'student':
                return <StudentDashboard />;
            case 'teacher':
            case 'section_head':
            case 'grade_head':
                return <TeacherDashboard />;
            case 'principal':
                return <PrincipalSchoolView schoolId={schoolId} userId={userId || ''} />;
            case 'founder':
            case 'admin':
            case 'developer':
                return <FounderDashboard />;
            default:
                return <DemoExplorerView />;
        }
    };

    return (
        <div className="sanctuary-screen">
            <div className="sanctuary-container">
                {isDemoMode && <SandboxBanner />}
                {renderRoleView()}
            </div>
            <LotusPetalFAB />
        </div>
    );
}
