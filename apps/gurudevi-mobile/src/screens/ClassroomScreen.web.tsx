/**
 * ClassroomScreen.web.tsx
 *
 * Four clear paths:
 *
 *  1. No role set yet (edge case / mid-onboarding) → redirect to Auth.
 *
 *  2. Guest WITH role (anonymous, role set by onboarding, no school_id, no user)
 *     → Show own-role demo + sign-up / join-school CTAs.
 *
 *  3. Authenticated NEW user (user exists, role set, but NO school_id yet)
 *     → Role-aware setup: principal → Create School;
 *                         teacher   → Create OR Join School;
 *                         student   → Join Class.
 *
 *  4. Authenticated WITH school (fully set up)
 *     → Real data for their role + subtle "Try Demo" overlay button.
 */

import React, { useState } from 'react';
import { useUserRole, useStore } from '@repo/core';
import { LotusPetalFAB } from '@repo/ui';
import { useNavigation } from '@react-navigation/native';
import {
    BookOpen, Users, Shield, GraduationCap, Zap, ArrowRight, Plus, LogIn,
} from 'lucide-react-native';

// Real role views (always show live data)
import StudentDashboard from './classroom/views/StudentDashboard.web';
import TeacherDashboard from './classroom/views/TeacherDashboard.web';
import PrincipalSchoolView from './classroom/views/PrincipalSchoolView.web';
import FounderDashboard from './classroom/views/FounderDashboard.web';

// New authenticated user — no school yet
import NoSchoolView from './classroom/NoSchoolView.web';

// Demo overlay (authenticated users only)
import DemoPlaygroundPanel from './classroom/DemoPlaygroundPanel.web';

// ── Helpers ────────────────────────────────────────────────────────────────

type DemoRole = 'teacher' | 'principal' | 'student';

const ROLE_META: Record<DemoRole, { emoji: string; title: string; color: string }> = {
    teacher:   { emoji: '📚', title: 'Teacher',   color: 'var(--sanctuary-saffron)' },
    principal: { emoji: '��️', title: 'Principal', color: 'var(--lotus)'             },
    student:   { emoji: '🌱', title: 'Student',   color: 'var(--moss)'              },
};

function roleToDemo(role: string | null): DemoRole {
    if (role === 'principal' || role === 'founder' || role === 'admin' || role === 'developer') return 'principal';
    if (role === 'student') return 'student';
    return 'teacher'; // teacher / grade_head / section_head / any unknown
}

// ── Path 1: Guest with role ────────────────────────────────────────────────

function GuestDemoView({ role }: { role: string }) {
    const navigation = useNavigation<any>();
    const demoRole = roleToDemo(role);
    const meta = ROLE_META[demoRole];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {/* Conversion banner */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(212,132,58,0.12), rgba(212,132,58,0.06))',
                border: '1px solid rgba(212,132,58,0.25)',
                borderRadius: '16px',
                padding: '24px 28px',
                marginBottom: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
            }}>
                <div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        fontSize: '11px', fontWeight: '800', textTransform: 'uppercase',
                        letterSpacing: '1.5px', color: 'var(--sanctuary-saffron)', marginBottom: '8px',
                    }}>
                        <Zap size={13} fill="var(--sanctuary-saffron)" />
                        Demo Mode — {meta.emoji} {meta.title} Preview
                    </div>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--ink)' }}>
                        You're exploring with simulated data.
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--ink-ghost)' }}>
                        Sign up or sign in to access your real {demoRole === 'teacher' ? 'classrooms' : demoRole === 'principal' ? 'school dashboard' : 'learning journey'}.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                        className="premium-button"
                        style={{ background: 'var(--sanctuary-saffron)', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => navigation.navigate('Auth')}
                    >
                        <Plus size={15} />
                        {demoRole === 'teacher' ? 'Create my classroom' : demoRole === 'principal' ? 'Set up my school' : 'Join my school'}
                    </button>
                    <button
                        className="secondary-button"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => navigation.navigate('Auth')}
                    >
                        <LogIn size={15} />
                        Sign in
                    </button>
                </div>
            </div>

            {/* Feature teaser strip */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginBottom: '28px',
            }}>
                {(demoRole === 'teacher' ? [
                    { icon: BookOpen,    text: 'Create & manage classrooms'  },
                    { icon: Users,       text: 'Mark attendance instantly'   },
                    { icon: GraduationCap, text: 'Gradebook & assignments'   },
                ] : demoRole === 'principal' ? [
                    { icon: Shield,      text: 'School-wide staff presence'  },
                    { icon: Users,       text: 'Leave approvals & echo'      },
                    { icon: BookOpen,    text: 'Classroom & student pulse'   },
                ] : [
                    { icon: BookOpen,    text: 'Your enrolled classrooms'    },
                    { icon: Zap,         text: 'Goals & growth points'       },
                    { icon: GraduationCap, text: 'Assignments & submissions' },
                ]).map((item, i) => (
                    <div key={i} style={{
                        padding: '14px 16px',
                        background: 'var(--glass-surface)',
                        borderRadius: '10px',
                        border: '1px solid var(--border-light)',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        fontSize: '12px', fontWeight: '600', color: 'var(--ink-ghost)',
                    }}>
                        <item.icon size={15} color={meta.color} />
                        {item.text}
                    </div>
                ))}
            </div>

            {/* Role demo — forceDemo isolates mock data from real session */}
            {demoRole === 'teacher'   && <TeacherDashboard   forceDemo />}
            {demoRole === 'principal' && <PrincipalSchoolView schoolId="mock-school" userId="mock-principal" forceDemo />}
            {demoRole === 'student'   && <StudentDashboard   forceDemo />}
        </div>
    );
}

// ── Path 2: Authenticated real view with "Try Demo" button ─────────────────

function AuthRoleView({ role, schoolId, userId }: { role: string; schoolId: string; userId: string }) {
    const [showDemo, setShowDemo] = useState(false);
    const demoRole = roleToDemo(role);
    const meta = ROLE_META[demoRole];

    const RealView = () => {
        switch (role) {
            case 'student':
                return <StudentDashboard />;
            case 'teacher':
            case 'section_head':
            case 'grade_head':
                return <TeacherDashboard />;
            case 'principal':
                return <PrincipalSchoolView schoolId={schoolId} userId={userId} />;
            case 'founder':
            case 'admin':
            case 'developer':
                return <FounderDashboard />;
            default:
                return <TeacherDashboard />;
        }
    };

    return (
        <>
            {/* Try Demo button — lives in-flow above the real dashboard */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                <button
                    onClick={() => setShowDemo(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 14px', borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'var(--glass-surface)',
                        cursor: 'pointer',
                        fontSize: '12px', fontWeight: '700',
                        color: 'var(--ink-ghost)',
                        fontFamily: 'var(--font-body)',
                    }}
                    title={`Preview ${meta.title} demo`}
                >
                    <Zap size={13} color="var(--sanctuary-saffron)" />
                    Try {meta.emoji} Demo
                </button>
            </div>

            <RealView />

            {/* Demo overlay — renders under topbar + sidebar via fixed positioning */}
            {showDemo && (
                <DemoPlaygroundPanel
                    role={demoRole}
                    onClose={() => setShowDemo(false)}
                />
            )}
        </>
    );
}

// ── Root export ────────────────────────────────────────────────────────────

export default function ClassroomScreenWeb() {
    const { role, userId } = useUserRole();
    const { user } = useStore();
    const navigation = useNavigation<any>();

    const isAnonymous   = !user;                           // no supabase user at all
    const hasSchool     = !!(user?.school_id);             // authenticated + has school
    const isNewAuthUser = !!user && !hasSchool;            // authenticated but no school yet

    // Edge case: no role set at all — shouldn't happen after onboarding
    if (!role) {
        return (
            <div className="sanctuary-screen">
                <div className="sanctuary-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px' }}>🌿</div>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Welcome to Gurudevi</h2>
                    <p style={{ color: 'var(--ink-ghost)', maxWidth: '400px', margin: 0 }}>
                        Let's get you set up. Choose your role to get started.
                    </p>
                    <button
                        className="premium-button"
                        style={{ background: 'var(--sanctuary-saffron)', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => navigation.navigate('Auth')}
                    >
                        Get started <ArrowRight size={16} />
                    </button>
                </div>
                <LotusPetalFAB />
            </div>
        );
    }

    return (
        <div className="sanctuary-screen">
            <div className="sanctuary-container">
                {/* Path 1: Anonymous guest with role → own-role demo + sign-up CTAs */}
                {isAnonymous && <GuestDemoView role={role} />}

                {/* Path 2: Authenticated, no school yet → role-specific setup wizard */}
                {isNewAuthUser && <NoSchoolView />}

                {/* Path 3: Authenticated with school → real data + "Try Demo" overlay */}
                {hasSchool && (
                    <AuthRoleView
                        role={role}
                        schoolId={user!.school_id!}
                        userId={userId || ''}
                    />
                )}
            </div>
            <LotusPetalFAB />
        </div>
    );
}
