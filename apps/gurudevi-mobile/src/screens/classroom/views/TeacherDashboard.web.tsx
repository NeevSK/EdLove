import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore } from '@repo/core';
import {
    Plus,
    Users,
    BookOpen,
    ScanLine,
    ShieldCheck,
    MessageCircle,
    Search,
    Filter,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    UserPlus,
    BarChart3
} from 'lucide-react-native';

export default function TeacherDashboardWeb() {
    const { t } = useTranslation();
    const { user } = useStore();
    const [searchQuery, setSearchQuery] = useState('');

    const classrooms = [
        { id: '1', name: 'Grade 10 - Mathematics', students: 32, lastActive: '2h ago', attendance: '94%' },
        { id: '2', name: 'Grade 11 - Physics', students: 28, lastActive: 'Yesterday', attendance: '88%' },
        { id: '3', name: 'Grade 9 - Advanced Algebra', students: 35, lastActive: '5m ago', attendance: '91%' },
    ];

    return (
        <div className="sub-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '32px', height: '100%' }}>
            {/* Header & Quick Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ padding: '8px', background: 'var(--sanctuary-saffron-soft)', borderRadius: '8px', color: 'var(--sanctuary-saffron)' }}>
                            <Users size={20} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--ink-ghost)' }}>
                            Classroom Management
                        </span>
                    </div>
                    <h1 style={{ fontSize: '36px', fontWeight: '800', margin: 0 }}>Registry & <span style={{ color: 'var(--sanctuary-saffron)' }}>Resonance</span>.</h1>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="premium-button" style={{ background: 'var(--sanctuary-saffron)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} />
                        Create Classroom
                    </button>
                    <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ScanLine size={18} />
                        Scan QR
                    </button>
                    <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={18} />
                        Admin Portal
                    </button>
                </div>
            </div>

            {/* Performance Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                {[
                    { label: 'Active Classes', value: '3', icon: Users, color: 'var(--lotus)' },
                    { label: 'Total Students', value: '95', icon: UserPlus, color: 'var(--water)' },
                    { label: 'Avg. Attendance', value: '91%', icon: CheckCircle2, color: 'var(--moss)' },
                    { label: 'Engagement', value: '8.4', icon: BarChart3, color: 'var(--sanctuary-saffron)' },
                ].map((stat, i) => (
                    <div key={i} className="sanctuary-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ padding: '12px', background: `${stat.color}-soft`, borderRadius: '12px', color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>{stat.label}</div>
                            <div style={{ fontSize: '24px', fontWeight: '800' }}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Classroom Registry Table */}
            <div className="sanctuary-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Your Classrooms</h3>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div className="search-box" style={{ width: '300px' }}>
                            <Search size={16} />
                            <input type="text" placeholder="Search classrooms..." style={{ background: 'transparent', border: 'none', color: 'var(--ink)', width: '100%' }} />
                        </div>
                        <button className="secondary-button" style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Filter size={14} />
                            Filter
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--background-alt)', color: 'var(--ink-ghost)', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>
                            <tr>
                                <th style={{ padding: '16px 24px' }}>Classroom Name</th>
                                <th style={{ padding: '16px 24px' }}>Students</th>
                                <th style={{ padding: '16px 24px' }}>Attendance</th>
                                <th style={{ padding: '16px 24px' }}>Last Activity</th>
                                <th style={{ padding: '16px 24px' }}>Status</th>
                                <th style={{ padding: '16px 24px' }}></th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '14px' }}>
                            {classrooms.map(cls => (
                                <tr key={cls.id} style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = 'var(--background-alt)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '20px 24px', fontWeight: '700' }}>{cls.name}</td>
                                    <td style={{ padding: '20px 24px' }}>{cls.students} Members</td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '60px', height: '4px', background: 'var(--border-light)', borderRadius: '2px', overflow: 'hidden' }}>
                                                <div style={{ width: cls.attendance, height: '100%', background: 'var(--moss)' }}></div>
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: '600' }}>{cls.attendance}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px', color: 'var(--ink-ghost)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Clock size={14} />
                                            {cls.lastActive}
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <span style={{ padding: '4px 8px', background: 'var(--moss-soft)', color: 'var(--moss)', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>ACTIVE</span>
                                    </td>
                                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                        <button style={{ background: 'transparent', border: 'none', color: 'var(--ink-ghost)', cursor: 'pointer' }}>
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
