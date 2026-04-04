/**
 * DemoPlaygroundPanel.web.tsx
 *
 * Full-screen overlay that sits UNDER the topbar (64 px) and BESIDE the sidebar
 * (240 px on desktop, 0 on mobile < 1024 px). Authenticated users launch this
 * to preview their own role with mock data without disturbing their real session.
 *
 * Layout anchor:
 *   position: fixed
 *   top:  var(--top-bar-h)   = 64px
 *   left: var(--sidebar-w)   = 240px desktop / 0px mobile
 */

import React, { useEffect, useState } from 'react';
import { X, Zap } from 'lucide-react-native';

import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import PrincipalDashboard from './PrincipalDashboard';

type DemoRole = 'teacher' | 'principal' | 'student';

interface DemoPlaygroundPanelProps {
    role: DemoRole;
    onClose: () => void;
}

export default function DemoPlaygroundPanel({ role, onClose }: DemoPlaygroundPanelProps) {
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth < 1024 : false
    );

    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    // Trap scrolling of the content behind the panel
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const ROLE_LABEL: Record<DemoRole, string> = {
        teacher: 'Teacher',
        principal: 'Principal',
        student: 'Student',
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 'var(--top-bar-h, 64px)',
                left: isMobile ? 0 : 'var(--sidebar-w, 240px)',
                right: 0,
                bottom: 0,
                zIndex: 300,
                background: 'var(--background)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/*  Demo banner  */}
            <div style={{
                background: 'rgba(245,158,11,0.10)',
                borderBottom: '1px solid rgba(245,158,11,0.25)',
                padding: '12px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexShrink: 0,
                flexWrap: 'wrap',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Zap size={15} color="var(--amber-glow)" fill="var(--amber-glow)" />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--amber-glow)' }}>
                        Demo  {ROLE_LABEL[role]} view with simulated data
                    </span>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 14px', borderRadius: '8px',
                        border: '1px solid var(--border)', background: 'var(--glass-surface)',
                        cursor: 'pointer', fontSize: '12px', fontWeight: '700',
                        color: 'var(--ink)', fontFamily: 'var(--font-body)',
                    }}
                >
                    <X size={13} /> Exit demo
                </button>
            </div>

            {/*  Scrollable demo content  */}
            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '40px 48px 60px',
                }}
            >
                {role === 'teacher' && <TeacherDashboard />}
                {role === 'principal' && (
                    <PrincipalDashboard
                        schoolId="mock-school"
                        userId="mock-principal"
                    />
                )}
                {role === 'student' && <StudentDashboard />}
            </div>
        </div>
    );
}
