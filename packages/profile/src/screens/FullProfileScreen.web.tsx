import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    useThemedColors,
    Theme,
    GlobalHeader,
    ScreenWrapper,
    hapticSuccess,
    SanctuaryButton,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import {
    User as UserIcon,
    AtSign,
    Edit3,
} from 'lucide-react-native';
import type { UserProfile } from '../types';
import { useProfileCompletion } from '../hooks/useProfileCompletion';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { ContactLinktree } from '../components/ContactLinktree';
import { StaffPresencePulse } from '@repo/people';
import { AddSocialLinkModal } from '../components/AddSocialLinkModal';
import { GiveThuthimalModal } from '../components/GiveThuthimalModal';
import { EditableItem } from '../components/EditableItem';
import { useStore } from '@repo/core';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useProfile } from '../hooks/useProfile';
import { useSocialLinks } from '../hooks/useSocialLinks';

export default function FullProfileScreenWeb() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { profile: initialParams } = route.params || {};
    const initialProfile = initialParams as unknown as UserProfile;

    const { t } = useTranslation();
    const colors = useThemedColors();
    const { user: currentUser } = useStore();

    const { profile: liveProfile, updateField, refresh, uploadAvatar } = useProfile(initialProfile?.id);
    const profile = liveProfile || initialProfile;
    useProfileCompletion(profile, currentUser?.authority ?? currentUser?.roles?.[0] ?? null);
    const { links: socialLinks } = useSocialLinks(profile?.id);

    const [showSocialModal, setShowSocialModal] = useState(false);
    const [showThuthimalModal, setShowThuthimalModal] = useState(false);

    const currentUserId = currentUser?.id;
    const currentUserName = currentUser?.full_name || currentUser?.email || '';

    if (!profile) return null;

    const isOtherProfile = currentUserId !== undefined && currentUserId !== profile.id;
    const isTeacherProfile = ['teacher', 'principal', 'grade_head', 'section_head'].includes(profile.role || '');

    const handleSave = async (field: string, value: any) => {
        let valueToSave = value;
        if ((field === 'subjects_taught' || field === 'qualifications') && typeof value === 'string') {
            valueToSave = value.split(',').map((s) => s.trim()).filter((s) => s !== '');
        } else if (field === 'experience_years' && typeof value === 'string') {
            valueToSave = parseInt(value, 10) || 0;
        }

        const result = await updateField(field as keyof UserProfile, valueToSave);
        const success = !!result?.success;
        if (success) {
            hapticSuccess();
            refresh?.();
        }
        return success;
    };

    return (
        <ScreenWrapper scroll={false}            <GlobalHeader
                title={t('profile.fullProfile')}
                showBack
                onBack={() => navigation.goBack()}
            /            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}                <Box sx={{ maxWidth: 800, margin: '0 auto', width: '100%', padding: '$6' }}                    <VStack space="2xl"                        <HStack space="xl" alignItems="center"                            <AvatarDisplay
                                userId={profile.id}
                                avatarUrl={profile.avatar_url}
                                fullName={profile.full_name}
                                size={120}
                                editable={!isOtherProfile}
                                onAvatarSelected={async (localUri) => {
                                    const result = await uploadAvatar(localUri);
                                    if (result.success) {
                                        refresh?.();
                                        hapticSuccess();
                                    }
                                }}
                            /                            <VStack                                <Heading size="xl">{profile.full_name}</Heading                                <Text color={colors.textTertiary}>@{profile.username || 'no-handle'}</Text                                {isTeacherProfile && profile.school_id ? (
                                    <StaffPresencePulse userId={profile.id} schoolId={profile.school_id} /                                ) : null}
                            </VStack                        </HStack
                        <Box
                            sx={{
                                backgroundColor: colors.secondary,
                                borderRadius: Theme.corners.generous,
                                padding: '$6',
                                borderWidth: 1,
                                borderColor: colors.border,
                            }}
                                                    <Heading size="md" mb="$4">{t('profile.personalDetails')}</Heading                            <VStack space="lg"                                <EditableItem
                                    icon={UserIcon}
                                    label={t('profile.fullName')}
                                    value={profile.full_name}
                                    field="full_name"
                                    onSave={handleSave}
                                    disabled={isOtherProfile}
                                /                                <EditableItem
                                    icon={AtSign}
                                    label={t('profile.username')}
                                    value={profile.username}
                                    field="username"
                                    onSave={handleSave}
                                    disabled={isOtherProfile}
                                /                            </VStack                        </Box
                        <ContactLinktree
                            links={socialLinks || []}
                            userName={profile.full_name}
                            bio={profile.bio}
                            userId={profile.id}
                            isOwnProfile={!isOtherProfile}
                        /
                        {!isOtherProfile && (
                            <SanctuaryButton onPress={() => setShowSocialModal(true)}                                <HStack space="sm" alignItems="center"                                    <Edit3 size={18} color="white" /                                    <Text color="white" bold>Manage Social Links</Text                                </HStack                            </SanctuaryButton                        )}
                    </VStack                </Box            </ScrollView
            {!isOtherProfile && (
                <AddSocialLinkModal
                    visible={showSocialModal}
                    onClose={() => setShowSocialModal(false)}
                    userId={profile.id}
                /            )}

            {isOtherProfile && currentUserId && (
                <GiveThuthimalModal
                    isOpen={showThuthimalModal}
                    onClose={() => setShowThuthimalModal(false)}
                    recipientId={profile.id}
                    recipientName={profile.full_name ?? 'this person'}
                    recipientTier={profile.role ?? 'teacher'}
                    giverId={currentUserId}
                    giverName={currentUserName}
                /            )}
        </ScreenWrapper    );
}
