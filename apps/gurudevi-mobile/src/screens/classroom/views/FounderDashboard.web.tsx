/**
 * FounderDashboard.web.tsx  (app-level web view)
 *
 * Platform Ecosystem Command Centre for Founders on web.
 * Pure HTML/CSS — no RN primitives.
 *
 * Features: Ecosystem stats · Schools gallery · Create actions
 *
 * Personal wellbeing (mood, energy, vision, philosophy) lives in FounderSelfView.
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@repo/core';
import { School } from '@repo/core';
import { SkeletonCard } from '@repo/ui';
import { useEcosystemStats, GlobalCreateModal } from '@repo/classroom';
import {
    Activity,
    Building,
    LayoutGrid,
    Users,
    Layers,
    ArrowUpRight,
    Plus,
    Globe,
    TrendingUp,
    Zap
} from 'lucide-react-native';

export default function FounderDashboardWeb() {
    const { t } = useTranslation();
    const { user } = useStore();

    const { stats, schools, isLoading, error, refreshData } = useEcosystemStats();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSchools = schools.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const ecosystemStats = [
        {
            label: 'Total Institutions',
            value: stats?.total_schools ?? 0,
            icon: Building,
            color: 'var(--sanctuary-saffron)',
            bg: 'rgba(255,166,0,0.1)'
        },
        {
            label: 'Active Classrooms',
            value: stats?.total_classrooms ?? 0,
            icon: LayoutGrid,
            color: 'var(--water)',
            bg: 'rgba(58,122,154,0.1)'
        },
        {
            label: 'Lives Empowered',
            value: stats?.total_users ?? 0,
            icon: Users,
            color: 'var(--moss)',
            bg: 'rgba(78,154,78,0.1)'
        },
        {
            label: 'Ecosystem Health',
            value: stats?.ecosystem_health != null ? `${Math.round(stats.ecosystem_health)}%` : '—',
            icon: Activity,
            color: 'var(--lotus)',
            bg: 'rgba(180,80,100,0.1)',
            isText: true
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', height: '100%', overflowY: 'auto' }}>

            {/* ─── 1. COMMAND HEADER ─────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ padding: '8px', background: 'rgba(255,166,0,0.1)', borderRadius: '8px', color: 'var(--sanctuary-saffron)' }}>
                            <Globe size={20} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ink-ghost)' }}>
                            Ecosystem Command
                        </span>
                    </div>
                    <h1 style={{ fontSize: '40px', fontWeight: '800', margin: 0 }}>
                        The Gurudevi <span style={{ color: 'var(--sanctuary-saffron)' }}>Ecology</span>.
                    </h1>
                    <p style={{ color: 'var(--ink-ghost)', marginTop: '8px', fontSize: '14px' }}>
                        Welcome, {user?.full_name || 'Founder'}. Real-time institutional resonance across Gurudevi.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="premium-button"
                        style={{ background: 'var(--sanctuary-saffron)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Plus size={18} /> Initialize New
                    </button>
                    <button
                        onClick={refreshData}
                        className="secondary-button"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Zap size={16} /> Refresh
                    </button>
                </div>
            </div>

            {/* ─── 2. ECOSYSTEM PULSE STATS ──────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                {ecosystemStats.map((stat, i) => (
                    <div key={i} className="sanctuary-card" style={{ transition: 'transform 0.2s' }}>
                        <div className="card-body-inner">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ padding: '8px', borderRadius: '10px', background: stat.bg, color: stat.color }}>
                                    <stat.icon size={18} />
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-ghost)' }}>{stat.label}</span>
                            </div>
                            <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--ink)' }}>
                                {isLoading ? '—' : stat.isText ? stat.value : Number(stat.value).toLocaleString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ─── 3. INSTITUTIONS GALLERY ───────────────────── */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>Institutional Gallery</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search institutions…"
                            style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'inherit', minWidth: '200px' }}
                        />
                        <span style={{ fontSize: '13px', color: 'var(--ink-ghost)' }}>
                            {filteredSchools.length} institution{filteredSchools.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                        <SkeletonCard height={200} />
                        <SkeletonCard height={200} />
                        <SkeletonCard height={200} />
                    </div>
                ) : filteredSchools.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--background-alt)', borderRadius: '20px' }}>
                        <Building size={40} color="var(--ink-ghost)" style={{ marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
                            {searchQuery ? 'No matching institutions' : 'No institutions yet'}
                        </h3>
                        <p style={{ fontSize: '14px', color: 'var(--ink-ghost)', marginBottom: '24px' }}>
                            {searchQuery ? 'Try a different search term.' : 'Initialize your first institution to begin building the Gurudevi ecology.'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="premium-button"
                                style={{ background: 'var(--sanctuary-saffron)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Plus size={16} /> Initialize First Institution
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                        {filteredSchools.map(school => (
                            <SchoolCard key={school.id} school={school} />
                        ))}
                    </div>
                )}
            </div>

            {/* ─── 4. PLATFORM INSIGHTS ROW ──────────────────── */}
            {!isLoading && stats && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Teacher/Student split */}
                    <div className="sanctuary-card">
                        <div className="card-body-inner">
                            <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '20px' }}>Community Breakdown</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    { label: 'Teachers', value: stats.total_teachers, color: 'var(--water)', total: stats.total_users },
                                    { label: 'Students', value: stats.total_students, color: 'var(--moss)', total: stats.total_users },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                                            <span>{item.label}</span>
                                            <span>{item.value?.toLocaleString() ?? '—'}</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ width: item.total ? `${((item.value ?? 0) / item.total) * 100}%` : '0%', height: '100%', background: item.color, borderRadius: '3px', transition: 'width 0.6s' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Active communities */}
                    <div className="sanctuary-card">
                        <div className="card-body-inner">
                            <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '20px' }}>Platform Activity</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {[
                                    { label: 'Active Communities', value: stats.active_communities?.toLocaleString() ?? '—', color: 'var(--lotus)' },
                                    { label: 'Total Classrooms', value: stats.total_classrooms?.toLocaleString() ?? '—', color: 'var(--water)' },
                                ].map((item, i) => (
                                    <div key={i} style={{ padding: '16px', background: 'var(--background-alt)', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '22px', fontWeight: '800', color: item.color, marginBottom: '4px' }}>{item.value}</div>
                                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Create Modal */}
            <GlobalCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                availableSchools={schools}
                onSuccess={() => { setIsCreateModalOpen(false); refreshData(); }}
            />
        </div>
    );
}

// ── School Card Component ────────────────────────────────────────────────────

function SchoolCard({ school }: { school: School }) {
    return (
        <div
            className="sanctuary-card interactive"
            style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onClick={() => console.log('Navigate to school:', school.id)}
        >
            <div className="card-body-inner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,166,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building size={24} color="var(--sanctuary-saffron)" />
                    </div>
                    <ArrowUpRight size={18} color="var(--ink-ghost)" />
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '8px', lineHeight: '1.3' }}>{school.name}</h3>

                {school.type && (
                    <span style={{ display: 'inline-block', padding: '3px 10px', background: 'rgba(255,166,0,0.1)', color: 'var(--sanctuary-saffron)', borderRadius: '6px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px' }}>
                        {school.type}
                    </span>
                )}

                <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: 'auto' }}>
                    <div>
                        <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>Type</div>
                        <div style={{ fontSize: '13px', fontWeight: '700', textTransform: 'capitalize' }}>{school.type ?? 'Institutional'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>Since</div>
                        <div style={{ fontSize: '13px', fontWeight: '700' }}>
                            {new Date(school.created_at).getFullYear()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

