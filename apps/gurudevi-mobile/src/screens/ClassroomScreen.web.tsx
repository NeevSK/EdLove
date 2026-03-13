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
import {
    Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Heading, VStack, HStack, Box, Text, Input, InputField, Button, ButtonText,
    FormControl, FormControlLabel, FormControlLabelText, Spinner, Icon,
    SandboxBanner, WebScreenHeader
} from '@repo/ui';
import { useNavigation } from '@react-navigation/native';
import {
    BookOpen, Users, Shield, GraduationCap, Zap, ArrowRight, Plus, LogIn,
} from 'lucide-react-native';

// Real role views (always show live// @ts-ignore
import PrincipalSchoolView from './classroom/views/PrincipalSchoolView.web';
import TeacherDashboard from './classroom/views/TeacherDashboard.web';
import StudentDashboard from './classroom/views/StudentDashboard.web';
import FounderDashboard from './classroom/views/FounderDashboard.web';

// New authenticated user — no school yet
import NoSchoolView from './classroom/NoSchoolView.web';

// Demo overlay (authenticated users only)
import DemoPlaygroundPanel from './classroom/DemoPlaygroundPanel.web';

// ── Helpers ────────────────────────────────────────────────────────────────

type DemoRole = 'teacher' | 'principal' | 'student';

const ROLE_META: Record<DemoRole, { emoji: string; title: string; color: string }> = {
    teacher:   { emoji: '📚', title: 'Teacher',   color: 'var(--sanctuary-saffron)' },
    principal: { emoji: '🏛️', title: 'Principal', color: 'var(--lotus)'             },
    student:   { emoji: '🌱', title: 'Student',   color: 'var(--moss)'              },
};

function roleToDemo(role: string | null): DemoRole {
    if (role === 'principal' || role === 'founder' || role === 'admin' || role === 'developer') return 'principal';
    if (role === 'student') return 'student';
    return 'teacher'; // teacher / grade_head / section_head / any unknown
}

// ── Path 1: Guest with role ────────────────────────────────────────────────

function GuestDemoView({ role }: { role: string }) {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const demoRole = roleToDemo(role);
    const meta = ROLE_META[demoRole];

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div style={{ paddingBottom: '80px' }}>
            <SandboxBanner />

            {demoRole === 'principal' && (
                <PrincipalSchoolView
                    schoolId="mock-school"
                    userId="mock-principal"
                    forceDemo
                    key={`guest-demo-${refreshTrigger}`}
                    onRefresh={handleRefresh}
                />
            )}
            {demoRole === 'student' && <StudentDashboard forceDemo />}
        </div>
    );
}

// ── Path 2: Authenticated real view with "Try Demo" button ─────────────────

function AuthRoleView({ role, schoolId, userId }: { role: string; schoolId: string; userId: string }) {
    const [showDemo, setShowDemo] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const demoRole = roleToDemo(role);
    const meta = ROLE_META[demoRole];

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const RealView = () => {
        switch (role) {
            case 'student':
                return <StudentDashboard />;
            case 'teacher':
            case 'section_head':
            case 'grade_head':
                return <TeacherDashboard />;
            case 'principal':
                return (
                    <PrincipalSchoolView
                        schoolId={schoolId}
                        userId={userId}
                        key={`${schoolId}-${refreshTrigger}`} // Add key for refresh
                        onRefresh={handleRefresh} // Pass refresh handler
                    />
                );
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
            </div>
        );
    }

    return (
        <div className="sanctuary-screen">
            <div className="sanctuary-container">
                <WebScreenHeader 
                    title="The Academy"
                    note={role === 'principal' ? "Institutional Oversight" : "Growth & Mastery"}
                    showPersonalizedGreeting={true}
                />
                <div style={{ marginTop: 24 }} />
                
                {/* Path 1: Anonymous guest with role → own-role demo + sign-up CTAs */}
                {isAnonymous && <GuestDemoView role={role} />}

                {/* Path 2: Authenticated, no school yet → role-specific setup wizard */}
                {isNewAuthUser && (
                    role === 'principal' ? (
                        <AuthRoleView 
                            role={role} 
                            schoolId="demo-school" 
                            userId={user.id} 
                        />
                    ) : (
                        <NoSchoolView />
                    )
                )}

                {/* Path 3: Authenticated with school → real data + "Try Demo" overlay */}
                {hasSchool && (
                    <AuthRoleView
                        role={role}
                        schoolId={user!.school_id!}
                        userId={userId || ''}
                    />
                )}
            </div>
        </div>
    );
}
