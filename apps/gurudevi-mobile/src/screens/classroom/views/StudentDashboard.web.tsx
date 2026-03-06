import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore } from '@repo/core';
import {
    BookOpen,
    MessageSquare,
    Star,
    Layout,
    Zap,
    ClipboardCheck,
    Search,
    ChevronRight,
    PlayCircle,
    CheckCircle2,
    Clock,
    Trophy
} from 'lucide-react-native';

export default function StudentDashboardWeb() {
    const { t } = useTranslation();
    const { user } = useStore();

    const stats = [
        { label: 'Active Sanctuaries', value: '4', icon: BookOpen, color: 'var(--water)' },
        { label: 'Assignments', value: '12', icon: Zap, color: 'var(--amber-glow)' },
        { label: 'Growth Points', value: '2,450', icon: Trophy, color: 'var(--sanctuary-saffron)' },
    ];

    const sanctuaries = [
        { id: '1', title: 'Mathematics', teacher: 'Dr. Aris Purge', progress: 75, status: 'Active' },
        { id: '2', title: 'Philosophy of Grace', teacher: 'Sarah Chen', progress: 40, status: 'Up Next' },
        { id: '3', title: 'Advanced Physics', teacher: 'Marcus Aurel', progress: 90, status: 'Review' },
        { id: '4', title: 'Social Studies', teacher: 'Elena Vance', progress: 20, status: 'New' },
    ];

    return (
        <div className="sub-view-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '32px', height: '100%' }}>
            {/* 1. LEARNING PORTAL (Center) */}
            <div className="content-scroll-area">
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ padding: '8px', background: 'var(--water-soft)', borderRadius: '8px', color: 'var(--water)' }}>
                            <Star size={20} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--ink-ghost)' }}>
                            Your Learning Journey
                        </span>
                    </div>
                    <h1 style={{ fontSize: '42px', fontWeight: '800', lineHeight: '1.2', margin: 0, color: 'var(--ink)' }}>
                        Radiate <span style={{ color: 'var(--water)' }}>Curiosity</span>, {user?.full_name?.split(' ')[0] || 'Student'}.
                    </h1>
                </div>

                {/* Growth Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                    {stats.map((stat, i) => (
                        <div key={i} className="sanctuary-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <stat.icon size={20} color={stat.color} />
                            <div>
                                <div style={{ fontSize: '32px', fontWeight: '800' }}>{stat.value}</div>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sanctuary Grid */}
                <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    Active Sanctuaries
                    <span style={{ padding: '4px 8px', background: 'var(--background-alt)', borderRadius: '6px', fontSize: '11px', color: 'var(--ink-ghost)' }}>4 Total</span>
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {sanctuaries.map(s => (
                        <div key={s.id} className="sanctuary-card interactive" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: '80px', background: 'var(--background-alt)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                    <BookOpen size={20} color="var(--water)" />
                                </div>
                                <span style={{ padding: '4px 8px', background: 'white', borderRadius: '6px', fontSize: '10px', fontWeight: '800', color: 'var(--ink-ghost)' }}>{s.status}</span>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px' }}>{s.title}</h3>
                                <p style={{ fontSize: '12px', color: 'var(--ink-ghost)', margin: '0 0 20px' }}>With {s.teacher}</p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ flex: 1, height: '6px', background: 'var(--background-alt)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${s.progress}%`, height: '100%', background: 'var(--water)' }}></div>
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--water)' }}>{s.progress}%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. STUDY SUITE (Right) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Upcoming Assignments */}
                <div className="sanctuary-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', letterSpacing: '1px', marginBottom: '20px' }}>Upcoming</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { title: 'Algebra Problem Set', due: 'Today, 4pm', icon: Zap, color: 'var(--amber-glow)' },
                            { title: 'Intro to Mindfulness', due: 'Tomorrow', icon: PlayCircle, color: 'var(--lotus)' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ padding: '10px', background: `${item.color}-soft`, borderRadius: '10px', color: item.color }}>
                                    <item.icon size={18} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: '700' }}>{item.title}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>Due {item.due}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="secondary-button" style={{ width: '100%', marginTop: '20px', fontSize: '12px' }}>View All Tasks</button>
                </div>

                {/* Quick Shortcuts */}
                <div className="sanctuary-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px' }}>Study Suite</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                            { label: 'Library', icon: BookOpen, color: 'var(--amber-glow)' },
                            { label: 'Sanctuaries', icon: MessageSquare, color: 'var(--gurudevi-blue)' },
                            { label: 'Rewards', icon: Star, color: 'var(--sanctuary-saffron)' },
                            { label: 'Timetable', icon: Layout, color: 'var(--moss)' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = 'var(--background-alt)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--background-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <item.icon size={16} color={item.color} />
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: '600' }}>{item.label}</span>
                                <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.2 }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="sanctuary-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px' }}>Recent Growth</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { text: 'Completed Daily Reflection', time: '1h ago', icon: CheckCircle2 },
                            { text: 'New content in Physics', time: '3h ago', icon: BookOpen },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px' }}>
                                <item.icon size={14} color="var(--ink-ghost)" style={{ marginTop: 2 }} />
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: '600' }}>{item.text}</div>
                                    <div style={{ fontSize: '10px', color: 'var(--ink-ghost)' }}>{item.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
