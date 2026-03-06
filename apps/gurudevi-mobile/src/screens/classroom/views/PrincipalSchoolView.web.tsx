import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore } from '@repo/core';
import {
    Users,
    Zap,
    CalendarCheck,
    AlertCircle,
    Shield,
    TrendingUp,
    Search,
    Plus,
    CheckCircle2,
    Clock,
    ClipboardList,
    GraduationCap,
    MoreVertical,
    ChevronRight,
    MessageCircle
} from 'lucide-react-native';

export default function PrincipalSchoolViewWeb({ schoolId, userId }: { schoolId?: string, userId?: string }) {
    const { t } = useTranslation();
    const { user } = useStore();

    return (
        <div className="sub-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '32px', height: '100%' }}>
            {/* 1. COMMAND HEADER & BRIEF */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ padding: '8px', background: 'var(--ink-soft)', borderRadius: '8px', color: 'var(--ink)' }}>
                            <Shield size={20} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ink-ghost)' }}>
                            Institutional Command
                        </span>
                    </div>
                    <h1 style={{ fontSize: '40px', fontWeight: '800', margin: 0 }}>School <span style={{ color: 'var(--lotus)' }}>Ecosystem</span>.</h1>
                    <p style={{ color: 'var(--ink-ghost)', marginTop: '8px', fontSize: '14px' }}>Welcome back, Principal. Here is your morning situational brief.</p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="premium-button" style={{ background: 'var(--lotus)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} />
                        Establish Hierarchy
                    </button>
                    <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={18} />
                        Invite Staff
                    </button>
                    <button className="secondary-button">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* 2. SITUATIONAL BRIEF (Prominent Card) */}
            <div className="sanctuary-card" style={{ padding: '32px', background: 'var(--lotus-soft)', border: '1px solid var(--lotus-soft)' }}>
                <div style={{ display: 'flex', gap: '32px' }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--lotus)', marginBottom: '16px' }}>Morning Briefing</h3>
                        <p style={{ fontSize: '16px', fontWeight: '600', lineHeight: '1.6', margin: 0 }}>
                            All systems are functioning nominally. Student sentiment is up **4%** this week. Two leave requests require your immediate resonance.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: '800' }}>94%</div>
                            <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--ink-ghost)' }}>ATTENDANCE</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: '800' }}>88%</div>
                            <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--ink-ghost)' }}>RESONANCE</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. MAIN GRID DASHBOARD */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
                {/* Left Column: Operations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Teacher Faculty */}
                    <div className="sanctuary-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Faculty Overview</h3>
                            <button style={{ color: 'var(--lotus)', background: 'transparent', border: 'none', fontWeight: '800', fontSize: '12px' }}>View All</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            {[
                                { name: 'Sarah Chen', role: 'Mathematics', performance: 'Exceeding' },
                                { name: 'Marcus Aurel', role: 'Physics', performance: 'Balanced' },
                                { name: 'Elena Vance', role: 'Civics', performance: 'Nurturing' },
                            ].map((t, i) => (
                                <div key={i} style={{ padding: '16px', background: 'var(--background-alt)', borderRadius: '16px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '16px', background: 'white', marginBottom: '12px' }}></div>
                                    <div style={{ fontSize: '13px', fontWeight: '700' }}>{t.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', marginBottom: '12px' }}>{t.role}</div>
                                    <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--moss)', textTransform: 'uppercase' }}>{t.performance}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Agentic Timetable */}
                    <div className="sanctuary-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, padding: '12px', background: 'var(--lotus-soft)', borderBottomLeftRadius: '12px', fontSize: '10px', fontWeight: '800', color: 'var(--lotus)' }}>AI ASSISTANT</div>
                        <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '800' }}>Timetable Optimization</h3>
                        <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', marginBottom: '24px' }}>The annual schedule is incomplete. I can draft a balanced timetable reflecting staff capacity and student resonance goals.</p>
                        <button className="premium-button" style={{ background: 'var(--ink)', width: '200px' }}>Draft Annual Schedule</button>
                    </div>
                </div>

                {/* Right Column: Regulatory & Support */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Pending Approvals */}
                    <div className="sanctuary-card" style={{ padding: '24px' }}>
                        <h3 style={{ margin: '0 0 20px', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)' }}>Pending Resonance</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { title: 'Leave: Dr. Aris', reason: 'Personal Silence', time: 'Received 2h ago' },
                                { title: 'Section Split: Grade 10', reason: 'Capacity Overload', time: 'Received 5h ago' },
                            ].map((p, i) => (
                                <div key={i} style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: '700' }}>{p.title}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>{p.time}</div>
                                    </div>
                                    <ChevronRight size={16} color="var(--ink-ghost)" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* School Metrics */}
                    <div className="sanctuary-card" style={{ padding: '24px' }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '800' }}>Ecosystem Pulse</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { label: 'Resource Needs', value: 'High', color: 'var(--ember)' },
                                { label: 'Staff Retention', value: '98%', color: 'var(--moss)' },
                                { label: 'Parent Engagement', value: '72%', color: 'var(--water)' },
                            ].map((m, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', fontWeight: '600' }}>
                                        <span>{m.label}</span>
                                        <span style={{ color: m.color }}>{m.value}</span>
                                    </div>
                                    <div style={{ width: '100%', height: '4px', background: 'var(--background-alt)', borderRadius: '2px' }}>
                                        <div style={{ width: '80%', height: '100%', background: m.color, borderRadius: '2px' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
