import React, { useState, useEffect } from 'react';
import {
    useTheme,
    GlassCard,
    LotusPetalFAB,
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    useThemedColors
} from '@repo/ui';
import { useUserRole, useStore } from '@repo/core';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import {
    Activity,
    Trophy,
    Award,
    Heart,
    FileText,
} from 'lucide-react-native';
import {
    useProfile,
    IdentityCard,
    ContactLinktree,
    StaffPresencePulse,
    useProfileCompletion,
    AvatarDisplay,
    LivingJourneyPanel,
    AchievementGallery
} from '@repo/profile';

export default function ProfileScreenWeb() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const colors = useThemedColors();
    const { role, isGuest } = useUserRole();
    const { user } = useStore();
    const { profile, loading: isProfileLoading, updateField, rewards } = useProfile();
    const completionResult = useProfileCompletion(profile, (role as any) ?? null);

    if (isProfileLoading || !profile) {
        return (
            <div className="sanctuary-screen">
                <div className="sanctuary-container">
                    <div className="greeting skeleton">
                        <div style={{ height: '40px', width: '200px', background: 'var(--border)', borderRadius: '8px', marginBottom: '12px' }} />
                        <div style={{ height: '60px', width: '400px', background: 'var(--border)', borderRadius: '8px' }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="sanctuary-screen">
            <div className="sanctuary-container">
                {/* 1. GREETING */}
                <div className="greeting">
                    <div className="greeting-time">{t('profile.presence', 'Your Presence')}</div>
                    <h1 className="greeting-main">{t('profile.identity', 'Identity & Rewards')}</h1>
                    <p className="greeting-note">{t('profile.ecosystem', 'Connected to the Gurudevi Sanctuary Ecosystem')}</p>
                </div>

                <div className="profile-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '24px',
                    alignItems: 'start'
                }}>
                    {/* LEFT: Identity & Social */}
                    <div className="profile-column" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <IdentityCard profile={profile} />

                        {/* Social Sanctuary */}
                        {profile.social_links && profile.social_links.length > 0 && (
                            <div className="sanctuary-card" style={{ padding: '24px' }}>
                                <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '800', color: colors.textSecondary, textTransform: 'uppercase' }}>
                                    Social Sanctuary
                                </h3>
                                <ContactLinktree
                                    links={profile.social_links}
                                    userName={profile.full_name}
                                    isOwnProfile={true}
                                />
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Professional & Rewards */}
                    <div className="profile-column" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Professional Pulse (Staff Only) */}
                        {['teacher', 'principal', 'grade_head', 'section_head'].includes(profile.role) && profile.school_id && (
                            <div className="sanctuary-card" style={{ padding: '24px' }}>
                                <StaffPresencePulse
                                    userId={profile.id}
                                    schoolId={profile.school_id}
                                />
                            </div>
                        )}

                        {/* Living Journey (Rewards & Growth) */}
                        <div style={{ width: '100%' }}>
                            <LivingJourneyPanel userId={profile.id} role={profile.role as any} />
                        </div>

                        {/* Bio & Story */}
                        <div className="sanctuary-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <FileText size={20} color={colors.textSecondary} />
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>{t('profile.bio_title', 'The Resonance Story')}</h3>
                            </div>
                            <Text size="md" style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                {profile.bio || t('profile.no_bio_fallback', 'This resident has not yet shared their resonance manifesto with the sanctuary.')}
                            </Text>
                        </div>

                        {/* Achievement Gallery */}
                        <div className="sanctuary-card" style={{ padding: '32px' }}>
                            <AchievementGallery unlockedBadges={rewards?.badges || []} />
                        </div>

                    </div>
                </div>
            </div>
            {/* LotusPetalFAB removed per user request for web */}
        </div>
    );
}
