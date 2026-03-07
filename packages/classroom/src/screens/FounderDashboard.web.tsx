/**
 * FounderDashboard.web.tsx  (packages/classroom upstream web variant)
 *
 * Platform Ecosystem Command Centre for Founders.
 * Pure HTML/CSS web view — no RN primitives.
 *
 * Used when the mobile ClassroomScreen imports FounderDashboard and the app
 * is built for web. The app-level override at apps/gurudevi-mobile also uses
 * this same design language.
 *
 * Personal wellbeing (mood, energy, vision) lives in FounderSelfView.
 */
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore, ClassroomStackParamList, School } from '@repo/core';
import { SkeletonCard } from '@repo/ui';
import { useEcosystemStats } from '../hooks/useEcosystemStats';
import GlobalCreateModal from '../components/GlobalCreateModal';
import { Activity, Building, LayoutGrid, Users, ArrowUpRight, Plus, Globe, Zap } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function FounderDashboard() {
    const { t } = useTranslation();
    const { user } = useStore();
    const navigation = useNavigation<NativeStackNavigationProp<ClassroomStackParamList>>();
    const { stats, schools, isLoading, refreshData } = useEcosystemStats();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSchools = schools.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pulseStats = [
        { label: 'Total Institutions', value: stats?.total_schools ?? 0, icon: Building, color: 'var(--sanctuary-saffron)', bg: 'rgba(255,166,0,0.1)' },
        { label: 'Active Classrooms', value: stats?.total_classrooms ?? 0, icon: LayoutGrid, color: 'var(--water)', bg: 'rgba(58,122,154,0.1)' },
        { label: 'Lives Empowered', value: stats?.total_users ?? 0, icon: Users, color: 'var(--moss)', bg: 'rgba(78,154,78,0.1)' },
        { label: 'Ecosystem Health', value: stats?.ecosystem_health != null ? `${Math.round(stats.ecosystem_health)}%` : '—', icon: Activity, color: 'var(--lotus)', bg: 'rgba(180,80,100,0.1)', isText: true as const },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', height: '100%', overflowY: 'auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ padding: '8px', background: 'rgba(255,166,0,0.1)', borderRadius: '8px', color: 'var(--sanctuary-saffron)' }}>
                            <Globe size={20} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' as const, letterSpacing: '2px', color: 'var(--ink-ghost)' }}>
                            Ecosystem Command
                        </span>
                    </div>
                    <h1 style={{ fontSize: '40px', fontWeight: '800', margin: 0 }}>
                        The Gurudevi <span style={{ color: 'var(--sanctuary-saffron)' }}>Ecology</span>.
                    </h1>
                    <p style={{ color: 'var(--ink-ghost)', marginTop: '8px', fontSize: '14px' }}>
                        Welcome, {user?.full_name || 'Founder'}.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', border: 'none', background: 'var(--sanctuary-saffron)', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
                    >
                        <Plus size={18} /> Initialize New
                    </button>
                    <button
                        onClick={refreshData}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
                    >
                        <Zap size={16} /> Refresh
                    </button>
                </div>
            </div>

            {/* Ecosystem Pulse Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '24px' }}>
                {pulseStats.map((stat, i) => (
                    <div key={i} className="sanctuary-card">
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

            {/* Institutions Gallery */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>Institutional Gallery</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                            value={searchQuery}
                            onChange={(e: any) => setSearchQuery(e.target.value)}
                            placeholder="Search institutions…"
                            style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'inherit', minWidth: '200px' }}
                        />
                        <span style={{ fontSize: '13px', color: 'var(--ink-ghost)' }}>
                            {filteredSchools.length} institution{filteredSchools.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '24px' }}>
                        <SkeletonCard height={200} />
                        <SkeletonCard height={200} />
                        <SkeletonCard height={200} />
                    </div>
                ) : filteredSchools.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--background-alt)', borderRadius: '20px' }}>
                        <Building size={40} color="var(--ink-ghost)" />
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginTop: '16px', marginBottom: '8px' }}>
                            {searchQuery ? 'No matching institutions' : 'No institutions yet'}
                        </h3>
                        <p style={{ fontSize: '14px', color: 'var(--ink-ghost)', marginBottom: '24px' }}>
                            {searchQuery ? 'Try a different search.' : 'Initialize your first institution.'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', background: 'var(--sanctuary-saffron)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                            >
                                <Plus size={16} /> Initialize
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '24px' }}>
                        {filteredSchools.map(school => (
                            <SchoolCard
                                key={school.id}
                                school={school}
                                onPress={() => navigation.navigate('FounderSchoolView', { schoolId: school.id, userId: user?.id ?? '' })}
                            />
                        ))}
                    </div>
                )}
            </div>

            <GlobalCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                availableSchools={schools}
                onSuccess={() => { setIsCreateModalOpen(false); refreshData(); }}
            />
        </div>
    );
}

function SchoolCard({ school, onPress }: { school: School; onPress: () => void }) {
    return (
        <div
            onClick={onPress}
            style={{ padding: '24px', borderRadius: '20px', background: 'var(--surface, white)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,166,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building size={24} color="var(--sanctuary-saffron)" />
                </div>
                <ArrowUpRight size={18} color="var(--ink-ghost)" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '8px' }}>{school.name}</h3>
            {school.type && (
                <span style={{ display: 'inline-block', padding: '3px 10px', background: 'rgba(255,166,0,0.1)', color: 'var(--sanctuary-saffron)', borderRadius: '6px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' as const }}>
                    {school.type}
                </span>
            )}
        </div>
    );
}
