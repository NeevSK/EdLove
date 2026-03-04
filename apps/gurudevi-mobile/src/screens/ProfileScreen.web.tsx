import React, { useState } from 'react';
import {
    useTheme,
    GlassCard,
    LotusPetalFAB
} from '@repo/ui';
import { useUserRole, useStore } from '@repo/core';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import {
    User,
    Settings,
    LogOut,
    Trash2,
    HelpCircle,
    MessageSquare,
    Info,
    Heart,
    Edit3,
    UserPlus,
    ChevronRight,
    Trophy,
    Award,
    Activity
} from 'lucide-react-native';

export default function ProfileScreenWeb() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { role, isGuest } = useUserRole();
    const { user } = useStore();
    const { logout } = useStore((state) => ({ logout: () => state.setUser(null) })); // Simplified for now

    const [activeSection, setActiveSection] = useState('identity');

    return (
        <div className="sanctuary-screen">
            {/* 1. GREETING */}
            <div className="greeting">
                <div className="greeting-time">Your Presence</div>
                <h1 className="greeting-main">Identity</h1>
                <p className="greeting-note">Connected to Gurudevi Ecosystem</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
                {/* LEFT: Identity Card & Core Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="sanctuary-card" style={{ padding: '32px', textAlign: 'center' }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '60px',
                            background: 'var(--water-soft)',
                            margin: '0 auto 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '4px solid white',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}>
                            <User size={64} color="var(--water)" />
                        </div>
                        <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '800' }}>{user?.full_name || 'Guest Explorer'}</h2>
                        <p style={{ margin: '0 0 24px', color: 'var(--ink-ghost)', fontWeight: '600', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>
                            {role || 'Seeker'}
                        </p>

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button className="sidebar-item" style={{ background: 'var(--lotus-soft)', border: 'none', padding: '10px 20px' }}>
                                <span className="sidebar-icon">{isGuest ? <UserPlus size={16} /> : <Edit3 size={16} />}</span>
                                <span className="sidebar-label">{isGuest ? 'Join Us' : 'Edit Profile'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="sanctuary-card" style={{ padding: '24px' }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>Quick Links</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button className="sidebar-item" onClick={() => setActiveSection('settings')}>
                                <span className="sidebar-icon"><Settings size={18} /></span>
                                <span className="sidebar-label">Sanctuary Settings</span>
                            </button>
                            <button className="sidebar-item" onClick={() => setActiveSection('support')}>
                                <span className="sidebar-icon"><HelpCircle size={18} /></span>
                                <span className="sidebar-label">Divine Support</span>
                            </button>
                            <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />
                            <button className="sidebar-item" style={{ color: 'var(--ink-ghost)' }}>
                                <span className="sidebar-icon"><LogOut size={18} /></span>
                                <span className="sidebar-label">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Stats & Journey */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    <div className="sanctuary-card" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Ecosystem Status</h3>
                            <Activity size={20} color="var(--moss)" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                            <div style={{ background: 'var(--water-soft)', padding: 20, borderRadius: 16, textAlign: 'center' }}>
                                <Trophy size={24} color="var(--water)" style={{ marginBottom: 8 }} />
                                <div style={{ fontSize: 24, fontWeight: '800' }}>24</div>
                                <div style={{ fontSize: 11, color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>Achievements</div>
                            </div>
                            <div style={{ background: 'var(--lotus-soft)', padding: 20, borderRadius: 16, textAlign: 'center' }}>
                                <Award size={24} color="var(--lotus)" style={{ marginBottom: 8 }} />
                                <div style={{ fontSize: 24, fontWeight: '800' }}>Level 5</div>
                                <div style={{ fontSize: 11, color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>Exploration</div>
                            </div>
                            <div style={{ background: 'var(--moss-soft)', padding: 20, borderRadius: 16, textAlign: 'center' }}>
                                <Heart size={24} color="var(--moss)" style={{ marginBottom: 8 }} />
                                <div style={{ fontSize: 24, fontWeight: '800' }}>128</div>
                                <div style={{ fontSize: 11, color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>Contributions</div>
                            </div>
                        </div>
                    </div>

                    <div className="sanctuary-card" style={{ padding: '32px' }}>
                        <h3 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: '800' }}>About This Version</h3>
                        <p style={{ lineHeight: '1.6', color: 'var(--ink-ghost)' }}>
                            You are currently viewing the **Sanctuary Web Interface (v4.0)**. This experience is hand-crafted for high-fidelity desktop resonance. All your mobile data is synchronized securely through our unified ecosystem.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                            <div style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.3)' }}>
                                <h4 style={{ margin: '0 0 8px', fontSize: '14px' }}>Account Status</h4>
                                <div style={{ fontSize: '12px', color: 'var(--moss)', fontWeight: '700' }}>Synchronized</div>
                            </div>
                            <div style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.3)' }}>
                                <h4 style={{ margin: '0 0 8px', fontSize: '14px' }}>Ecosystem Security</h4>
                                <div style={{ fontSize: '12px', color: 'var(--water)', fontWeight: '700' }}>Protected by Dharma</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LotusPetalFAB />
        </div>
    );
}
