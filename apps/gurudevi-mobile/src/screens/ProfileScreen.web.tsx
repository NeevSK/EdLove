import React, { useState } from 'react';
import { useThemedColors } from '@repo/ui';
import { useUserRole, useStore, useRoleFeatures } from '@repo/core';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import {
    FileText,
    Briefcase,
    GraduationCap,
    Globe,
    Phone,
    Mail,
    Edit3,
    CheckCircle2,
    Plus,
} from 'lucide-react-native';
import {
    useProfile,
    ContactLinktree,
    StaffPresencePulse,
    useProfileCompletion,
    AvatarDisplay,
    LivingJourneyPanel,
    AddSocialLinkModal,
    useSocialLinks,
} from '@repo/profile';
import { QRCodeGenerator } from '@repo/scanner-kit';

// Safe icon renderer for web
const SafeIcon = ({ icon: Icon, size = 20, color = 'currentColor', className = '' }: any) => {
    if (!Icon) return null;
    try {
        return <Icon size={size} color={color} className={className} />;
    } catch (e) {
        console.warn('Icon render failed:', e);
        return null;
    }
};

export default function ProfileScreenWeb() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const colors = useThemedColors();
    const { role } = useUserRole();
    const { isGuest } = useRoleFeatures();
    const { user } = useStore();
    const { profile, loading: isProfileLoading, updateField, rewards, refresh } = useProfile();
    const completionResult = useProfileCompletion(profile, (role as any) ?? null);
    // isEditModalOpen removed — openInlineEdit() is used instead
    const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [editForm, setEditForm] = useState<{ full_name: string; bio: string; phone: string; username: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Social links — own data, live-updated
    const { links: socialLinks, addLink: addSocialLink, loading: isSocialLinksLoading } = useSocialLinks(user?.id);

    const openInlineEdit = () => setEditForm({ 
        full_name: profile?.full_name ?? '', 
        bio: profile?.bio ?? '', 
        phone: profile?.phone ?? '',
        username: profile?.username ?? ''
    });
    const cancelEdit = () => setEditForm(null);
    const saveEdit = async () => {
        if (!editForm || !profile) return;
        setIsSaving(true);
        try {
            if (editForm.full_name !== profile.full_name) await updateField('full_name', editForm.full_name);
            if (editForm.bio !== (profile.bio ?? '')) await updateField('bio', editForm.bio);
            if (editForm.phone !== (profile.phone ?? '')) await updateField('phone', editForm.phone);
            if (editForm.username !== (profile.username ?? '')) await updateField('username', editForm.username);
            setEditForm(null);
            refresh?.();
        } finally {
            setIsSaving(false);
        }
    };

    // Profile public URL — used by QR code and copy-link button
    const profilePublicUrl = profile?.username
    ? `https://platform.gurudevi.edlove.org/p/${profile.username}`
    : (profile?.id ? `https://platform.gurudevi.edlove.org/p/${profile.id}` : '');

    const isStaff = profile?.role && ['teacher', 'principal', 'grade_head', 'section_head'].includes(profile.role);
    const subjectsTaught = Array.isArray(profile?.subjects_taught)
        ? profile.subjects_taught
        : (profile?.subjects_taught ? [profile.subjects_taught] : []);
    const qualifications = Array.isArray(profile?.qualifications)
        ? profile.qualifications
        : (profile?.qualifications ? [profile.qualifications] : []);

    if (isProfileLoading || !profile) {
        return (
            <div className="sanctuary-screen">
                <div className="sanctuary-container">
                    {/* Hero skeleton */}
                    <div style={{ height: '220px', background: 'var(--border)', borderRadius: '24px', marginBottom: '32px', opacity: 0.4 }} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '24px' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ height: '140px', background: 'var(--border)', borderRadius: '16px', opacity: 0.3 }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="sanctuary-screen">
            <div className="sanctuary-container">

                {/* ─── HERO BANNER ─────────────────────────────── */}
                <div className="sanctuary-card" style={{
                    padding: '40px',
                    marginBottom: '32px',
                    background: 'linear-gradient(135deg, var(--glass-surface) 0%, var(--background-alt) 100%)',
                    border: '1px solid var(--border)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Background glow */}
                    <div style={{
                        position: 'absolute', top: '-60px', right: '-60px',
                        width: '200px', height: '200px',
                        background: 'radial-gradient(circle, var(--action-soft) 0%, transparent 70%)',
                        pointerEvents: 'none'
                    }} />

                    {/* Two-column: ID card (left) + QR code (right) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '32px', position: 'relative', zIndex: 1, alignItems: 'start' }}>

                        {/* ── LEFT: Identity card ── */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '28px', flexWrap: 'wrap' }}>
                            {/* Avatar */}
                            <div style={{ flexShrink: 0 }}>
                                <AvatarDisplay
                                    userId={profile.id}
                                    avatarUrl={profile.avatar_url}
                                    fullName={profile.full_name}
                                    size={88}
                                    editable={true}
                                    onAvatarUpdated={async (url: string) => { await updateField('avatar_url', url); }}
                                />
                            </div>

                            {/* Identity info */}
                            <div style={{ flex: 1, minWidth: '180px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                    <h1 style={{ margin: 0, fontSize: '30px', fontWeight: '800', color: 'var(--ink)' }}>
                                        {profile.full_name}
                                    </h1>
                                    {profile.is_thuthimal && (
                                        <span style={{ padding: '4px 10px', background: 'var(--sanctuary-saffron)', color: 'var(--text-on-action)', borderRadius: '8px', fontSize: '11px', fontWeight: '800' }}>
                                            🌸 Thuthimal
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '15px', color: 'var(--action)', fontWeight: '600', textTransform: 'capitalize' }}>
                                        {profile.role?.split('_').join(' ')}
                                    </span>
                                    {profile.school_name && (
                                        <>
                                            <span style={{ color: 'var(--border)', fontWeight: '300' }}>·</span>
                                            <span style={{ fontSize: '14px', color: 'var(--ink-ghost)' }}>{profile.school_name}</span>
                                        </>
                                    )}
                                </div>

                                {/* Completion progress bar */}
                                {!completionResult.isComplete && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-ghost)' }}>
                                                Profile Completion
                                            </span>
                                            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--action)' }}>
                                                {completionResult.percentage}%
                                            </span>
                                        </div>
                                        <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${completionResult.percentage}%`,
                                                height: '100%',
                                                background: 'linear-gradient(to right, var(--action), var(--water))',
                                                borderRadius: '3px',
                                                transition: 'width 0.6s ease'
                                            }} />
                                        </div>
                                        {completionResult.nextHint && (
                                            <p style={{ fontSize: '11px', color: 'var(--ink-ghost)', margin: '6px 0 0' }}>
                                                {completionResult.nextHint}
                                            </p>
                                        )}
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                            {completionResult.isComplete ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '14px', fontWeight: 600 }}>
                                                    <SafeIcon icon={CheckCircle2} size={18} />
                                                    {t('profile.completion.done')}
                                                </div>
                                            ) : (
                                                <div style={{ padding: '4px 12px', background: 'var(--warning-surface)', color: 'var(--warning)', borderRadius: '100px', fontSize: '12px', fontWeight: 600 }}>
                                                    {t('profile.completion.incomplete')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {/* Removed: completionResult.isComplete && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                        <CheckCircle2 size={16} color="var(--moss)" />
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--moss)' }}>
                                            Profile complete — fully resonant.
                                        </span>
                                    </div>
                                )}

                                {/* Quick contact row */}
                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
                                    {profile.email && (
                                        <span style={{ fontSize: '13px', color: 'var(--ink-ghost)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Mail size={13} color="var(--ink-ghost)" />
                                            {profile.email}
                                        </span>
                                    )}
                                    {profile.phone && (
                                        <span style={{ fontSize: '13px', color: 'var(--ink-ghost)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Phone size={13} color="var(--ink-ghost)" />
                                            {profile.phone}
                                        </span>
                                    )}
                                </div>

                                {/* Edit profile button — guests must create an account first */}
                                {isGuest ? (
                                    <button
                                        className="premium-button"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                                        onClick={() => (navigation as any).navigate('Auth')}
                                    >
                                        Create Account
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        <button
                                            className="secondary-button"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                            onClick={openInlineEdit}
                                        >
                                            <Edit3 size={16} />
                                            {t('profile.viewEditProfile')}
                                        </button>
                                        <button
                                            className="secondary-button"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                            onClick={() => (navigation as any).navigate('FullProfile', { profile })}
                                        >
                                            Full Profile
                                        </button>
                                        <button
                                            className="secondary-button"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                            onClick={() => (navigation as any).navigate('AppSettings')}
                                        >
                                            ⚙ Settings
                                        </button>
                                        <button
                                            className="secondary-button"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                            onClick={() => (navigation as any).navigate('PrivacyLedger')}
                                        >
                                            🔒 Privacy Ledger
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── RIGHT: QR code panel (authenticated users only) ── */}
                        {isGuest ? null :
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '20px',
                            background: 'var(--glass-surface)',
                            borderRadius: '16px',
                            border: '1px solid var(--border)',
                            flexShrink: 0,
                            minWidth: '140px',
                        }}>
                            <div style={{ borderRadius: '8px', overflow: 'hidden', background: '#fff', padding: '8px' }}>
                                <QRCodeGenerator
                                    value={profilePublicUrl}
                                    size={104}
                                    label={profile.full_name}
                                />
                            </div>
                            <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: 'var(--ink-ghost)', textAlign: 'center', lineHeight: 1.4 }}>
                                Scan to view profile
                            </p>
                            <button
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    color: copiedLink ? 'var(--moss)' : 'var(--action)',
                                    fontWeight: '600',
                                    padding: '2px 0',
                                    fontFamily: 'var(--font-body)',
                                    transition: 'color 0.2s',
                                }}
                                onClick={() => {
                                    navigator.clipboard?.writeText(profilePublicUrl)
                                        .then(() => {
                                            setCopiedLink(true);
                                            setTimeout(() => setCopiedLink(false), 2000);
                                        })
                                        .catch(() => {});
                                }}
                            >
                                {copiedLink ? '✓ Copied!' : 'Copy link'}
                            </button>
                        </div>
                        }
                    </div>
                </div>

                {/* ─── INLINE EDIT PANEL ─── */}
                {editForm && !isGuest && (
                    <div className="sanctuary-card" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--action)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Edit Profile</h3>
                            <button onClick={cancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-ghost)', fontSize: '20px' }}>✕</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '20px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ink-ghost)', marginBottom: '6px' }}>Display Name</label>
                                <input
                                    value={editForm.full_name}
                                    onChange={e => setEditForm(f => f ? { ...f, full_name: e.target.value } : f)}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--glass-surface)', fontSize: '15px', fontFamily: 'var(--font-body)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ink-ghost)', marginBottom: '6px' }}>Handle/Username</label>
                                <input
                                    value={editForm.username}
                                    onChange={e => setEditForm(f => f ? { ...f, username: e.target.value } : f)}
                                    placeholder="your-handle"
                                    disabled={profile.is_anonymous}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--glass-surface)', fontSize: '15px', fontFamily: 'var(--font-body)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box', opacity: profile.is_anonymous ? 0.5 : 1 }}
                                />
                                {profile.is_anonymous && <p style={{ fontSize: '10px', color: 'var(--ink-ghost)', marginTop: '4px' }}>Anonymous users cannot have handles.</p>}
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ink-ghost)', marginBottom: '6px' }}>Phone</label>
                                <input
                                    value={editForm.phone}
                                    onChange={e => setEditForm(f => f ? { ...f, phone: e.target.value } : f)}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--glass-surface)', fontSize: '15px', fontFamily: 'var(--font-body)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--ink-ghost)', marginBottom: '6px' }}>Bio</label>
                            <textarea
                                value={editForm.bio}
                                onChange={e => setEditForm(f => f ? { ...f, bio: e.target.value } : f)}
                                rows={3}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--glass-surface)', fontSize: '14px', fontFamily: 'var(--font-body)', color: 'var(--ink)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="premium-button" onClick={saveEdit} disabled={isSaving} style={{ minWidth: '100px' }}>
                                {isSaving ? 'Saving…' : 'Save Changes'}
                            </button>
                            <button className="secondary-button" onClick={cancelEdit}>Cancel</button>
                        </div>
                    </div>
                )}

                {/* ─── MAIN GRID ───────────────────────────────── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
                    gap: '24px',
                    alignItems: 'start'
                }}>
                    {/* LEFT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Bio & Story */}
                        <div className="sanctuary-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <FileText size={18} color="var(--ink-ghost)" />
                                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                    {t('profile.bio_title')}
                                </h3>
                            </div>
                            <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.7', color: profile.bio ? 'var(--ink)' : 'var(--ink-ghost)', fontStyle: profile.bio ? 'normal' : 'italic' }}>
                                {profile.bio || t('profile.no_bio_fallback')}
                            </p>
                        </div>

                        {/* Professional Fields (Staff only) */}
                        {isStaff && (subjectsTaught.length > 0 || qualifications.length > 0 || profile.experience_years) && (
                            <div className="sanctuary-card" style={{ padding: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <Briefcase size={18} color="var(--ink-ghost)" />
                                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                        Professional Credentials
                                    </h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {subjectsTaught.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase', marginBottom: '8px' }}>Subjects Taught</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {subjectsTaught.map((s: string) => (
                                                    <span key={s} style={{ padding: '4px 12px', background: 'var(--action-soft)', color: 'var(--action)', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {qualifications.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase', marginBottom: '8px' }}>Qualifications</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {qualifications.map((q: string) => (
                                                    <span key={q} style={{ padding: '4px 12px', background: 'var(--moss-soft)', color: 'var(--moss)', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                                                        <GraduationCap size={12} style={{ marginRight: 4 }} />{q}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {profile.experience_years && (
                                        <div style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: '600' }}>
                                            {profile.experience_years} years of teaching experience
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Social Sanctuary — always shown with add/edit */}
                        <div className="sanctuary-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Globe size={18} color="var(--ink-ghost)" />
                                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                        Social Sanctuary
                                    </h3>
                                </div>
                                <button
                                    className="secondary-button"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
                                    onClick={() => setIsAddLinkOpen(true)}
                                >
                                    <Plus size={14} />
                                    Add Link
                                </button>
                            </div>

                            {socialLinks && socialLinks.length > 0 ? (
                                <ContactLinktree
                                    links={socialLinks}
                                    userName={profile.full_name}
                                    isOwnProfile={true}
                                />
                            ) : (
                                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ink-ghost)' }}>
                                    <Globe size={32} color="var(--border)" />
                                    <p style={{ fontSize: '13px', marginTop: '12px', fontStyle: 'italic' }}>
                                        No social links yet. Add your first one.
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Staff Presence Pulse */}
                        {isStaff && profile.school_id && (
                            <div className="sanctuary-card" style={{ padding: '24px' }}>
                                <StaffPresencePulse
                                    userId={profile.id}
                                    schoolId={profile.school_id}
                                />
                            </div>
                        )}

                        {/* Living Journey Panel (Rewards & XP) */}
                        <div style={{ width: '100%' }}>
                            <LivingJourneyPanel userId={profile.id} role={profile.role as any} />
                        </div>
                    </div>
                </div>
            </div>

            {/* EditProfileModal removed — inline edit panel used instead for web shell compatibility */}

            {/* Add Social Link Modal */}
            <AddSocialLinkModal
                visible={isAddLinkOpen}
                userId={user?.id}
                onClose={() => setIsAddLinkOpen(false)}
            />
        </div>
    );
}
