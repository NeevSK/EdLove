import React, { useState } from 'react';
import {
    useTheme,
    PositiveInvitation,
    LotusPetalFAB,
    Theme
} from '@repo/ui';
import { useUserRole, useStore } from '@repo/core';
import {
    Hash,
    MessageSquare,
    Trophy,
    Compass,
    Activity,
    Users2,
    Heart
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

export default function CommunityScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { role, isGuest } = useUserRole();
    const { user } = useStore();

    const isEcosystemRole = role === 'founder' || role === 'admin' || role === 'developer';
    const [selectedGroupId, setSelectedGroupId] = useState('all');

    return (
        <div className="sanctuary-screen">
            <div className="sanctuary-container">
                {/* 1. GREETING */}
                <div className="greeting">
                    <div className="greeting-time">{isEcosystemRole ? "Architect's Stream" : "Global Resonance"}</div>
                    <h1 className="greeting-main">The Heart</h1>
                    <p className="greeting-note">Ecosystem Resonance</p>
                </div>

                {/* 2. COMMUNITY GRID */}
                <div className="community-grid">

                    {/* LEFT: Sanctuary Explorer */}
                    <aside className="community-sidebar">
                        <nav className="sidebar-nav" style={{ gap: '8px' }}>
                            <SidebarItem
                                icon={<Compass size={18} />}
                                label="Global Stream"
                                active={selectedGroupId === 'all'}
                                onClick={() => setSelectedGroupId('all')}
                            />
                            <SidebarItem
                                icon={<Users2 size={18} />}
                                label="My Sanctuaries"
                                active={selectedGroupId === 'my'}
                                onClick={() => setSelectedGroupId('my')}
                            />
                            <SidebarItem
                                icon={<Activity size={18} />}
                                label="Tide & Pulse"
                                active={selectedGroupId === 'pulse'}
                                onClick={() => setSelectedGroupId('pulse')}
                            />
                            <button
                                className="sidebar-item"
                                onClick={() => navigation.navigate('DirectMessagesList')}
                            >
                                <span className="sidebar-icon">
                                    <MessageSquare size={18} />
                                </span>
                                <span className="sidebar-label">Messages</span>
                            </button>
                        </nav>

                        <div style={{ marginTop: '32px' }}>
                            <p style={{
                                fontSize: '11px',
                                fontWeight: '800',
                                color: 'var(--ink-ghost)',
                                letterSpacing: '1px',
                                marginBottom: '12px',
                                textTransform: 'uppercase'
                            }}>
                                Trending Sanctuaries
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {['Teachers Lounge', 'Physics Deep-dive', 'Principal Council'].map(g => (
                                    <button key={g} className="sidebar-item" style={{ padding: '8px 12px' }}>
                                        <span className="sidebar-icon">
                                            <Hash size={14} />
                                        </span>
                                        <span className="sidebar-label" style={{ fontWeight: '400' }}>{g}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* CENTER: Main Feed */}
                    <div className="community-feed">
                        {!isEcosystemRole && isGuest ? (
                            <div style={{ marginTop: '40px' }}>
                                <PositiveInvitation
                                    context="community"
                                    onAction={() => console.log('Nav to Auth')}
                                />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <FeedItem
                                    author="Arun Wijesinghe"
                                    role="Principal"
                                    content="Excited to announce our new Physics lab is now fully operational! Looking forward to seeing our students explore the wonders of the cosmos."
                                    timestamp="2h ago"
                                />
                                <FeedItem
                                    author="Nalini Perera"
                                    role="Teacher"
                                    content="The shared lesson plans for Grade 8 Mathematics have been updated with new interactive exercises. Please take a look!"
                                    timestamp="4h ago"
                                />
                                <FeedItem
                                    author="System Update"
                                    role="Gurudevi Admin"
                                    content="A new Sanctuary for Grade 12 Advanced Biology has been established. All students are encouraged to join."
                                    timestamp="Yesterday"
                                />
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Presence & Stats */}
                    <aside className="community-panel">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                            <button
                                className="sanctuary-card"
                                style={{ padding: '20px', textAlign: 'left', width: '100%', border: '1px solid var(--water-glow)' }}
                                onClick={() => navigation.navigate('DirectMessagesList')}
                            >
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <MessageSquare size={20} color="var(--water)" />
                                    <div>
                                        <p style={{ fontSize: '16px', fontWeight: '800', color: 'var(--ink)' }}>Pulse: High</p>
                                        <p style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>View All Conversations</p>
                                    </div>
                                </div>
                            </button>

                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--ink)', marginBottom: '16px' }}>Online Presence</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <PresenceItem name="Arun W." status="online" role="Principal" />
                                    <PresenceItem name="Deepika R." status="online" role="Admin" />
                                </div>
                            </div>

                            <div className="sanctuary-card" style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <Trophy size={20} color="#a07830" />
                                    <div>
                                        <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--ink)' }}>Top Resonator</p>
                                        <p style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>Nalini Perera (128 Hearts)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <LotusPetalFAB
                currentTab="community"
                onPress={() => console.log('Create Post')}
            />
        </div>
    );
}

function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`sidebar-item ${active ? 'active' : ''}`}
        >
            {React.cloneElement(icon, {
                size: 18,
                className: 'sidebar-icon',
                color: active ? 'var(--water)' : 'var(--ink-ghost)'
            })}
            <span className="sidebar-label">{label}</span>
        </button>
    );
}

function FeedItem({ author, role, content, timestamp }: { author: string, role: string, content: string, timestamp: string }) {
    return (
        <div className="sanctuary-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '20px',
                            background: 'rgba(160,120,48,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--gold)' }}>{author[0]}</span>
                        </div>
                        <div>
                            <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--ink)' }}>{author}</p>
                            <p style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>{role}</p>
                        </div>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>{timestamp}</span>
                </div>
                <p style={{ fontSize: '15px', lineHeight: '1.5', color: 'var(--ink-soft)' }}>{content}</p>
                <div style={{ display: 'flex', gap: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', cursor: 'pointer' }}>
                        <Heart size={16} color="var(--lotus)" fill="var(--lotus-glow)" />
                        <span style={{ fontSize: '13px', color: 'var(--ink-ghost)' }}>12 Hearts</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', cursor: 'pointer' }}>
                        <MessageSquare size={16} color="var(--ink-ghost)" />
                        <span style={{ fontSize: '13px', color: 'var(--ink-ghost)' }}>4 Reflections</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PresenceItem({ name, status, role }: { name: string, status: 'online' | 'away', role: string }) {
    return (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: status === 'online' ? '#10b981' : '#f59e0b',
                boxShadow: status === 'online' ? '0 0 8px #10b981' : 'none'
            }} />
            <div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>{name}</p>
                <p style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>{role}</p>
            </div>
        </div>
    );
}
