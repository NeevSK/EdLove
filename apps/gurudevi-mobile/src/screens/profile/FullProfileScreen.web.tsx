import React, { useState, useEffect } from 'react';
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
    Center,
    useEnvironment,
    SanctuaryProgressBar,
    hapticSuccess,
    AchievementUnlockOverlay,
    SanctuaryButton,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { 
    User as UserIcon, 
    FileText, 
    Phone, 
    Fingerprint, 
    AtSign,
    Edit3
} from 'lucide-react-native';
import { 
    IdentityCard,
    AddSocialLinkModal,
    StaffPresencePulse,
    UserProfile,
    useProfileCompletion,
    AvatarDisplay,
    ContactLinktree,
    GiveThuthimalModal,
    EditableItem
} from '@repo/profile';
import { useEntity, useStore } from '@repo/core';
import { EntityView } from '@repo/ui';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function FullProfileScreenWeb() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { profile: initialParams } = route.params || {};
    const initialProfile = initialParams as unknown as UserProfile;
    
    const { t } = useTranslation();
    const colors = useThemedColors();
    const { user: currentUser } = useStore();
    
    // Initialize Entity System
    const { entity, updateInstance, loading: isLoading } = useEntity<UserProfile>('user', initialProfile?.id);
    
    const profile = (entity?.data as UserProfile) || initialProfile;
    const { role } = useEnvironment();
    const completionResult = useProfileCompletion(profile, role ?? null);

    const [showCelebration, setShowCelebration] = useState(false);
    const [showSocialModal, setShowSocialModal] = useState(false);
    const [showThuthimalModal, setShowThuthimalModal] = useState(false);

    const currentUserId = currentUser?.id;
    const currentUserName = currentUser?.full_name || currentUser?.email || '';

    if (!profile) return null;

    const isOtherProfile = currentUserId !== undefined && currentUserId !== profile.id;
    const isTeacherProfile = ['teacher', 'principal', 'grade_head', 'section_head'].includes(profile.role);

    const handleSave = async (field: string, value: any) => {
        let valueToSave = value;
        if ((field === 'subjects_taught' || field === 'qualifications') && typeof value === 'string') {
            valueToSave = value.split(',').map(s => s.trim()).filter(s => s !== '');
        } else if (field === 'experience_years' && typeof value === 'string') {
            valueToSave = parseInt(value, 10) || 0;
        }

        const success = await updateInstance({ [field]: valueToSave });
        if (success) {
             hapticSuccess();
        }
        return success;
    };

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader
                title={t('profile.fullProfile')}
                showBack
                onBack={() => navigation.goBack()}
            />
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <Box sx={{ maxWidth: 800, margin: '0 auto', width: '100%', padding: '$6' }}>
                    <VStack space="2xl">
                        {/* Profile Header section */}
                        <HStack space="xl" alignItems="center">
                            <AvatarDisplay
                                userId={profile.id}
                                avatarUrl={profile.avatar_url}
                                fullName={profile.full_name}
                                size={120}
                                editable={!isOtherProfile}
                                onAvatarUpdated={async (url) => {
                                    await updateInstance({ avatar_url: url });
                                    hapticSuccess();
                                }}
                            />
                            <VStack>
                                <Heading size="xl">{profile.full_name}</Heading>
                                <Text color={colors.textTertiary}>@{profile.username || 'no-handle'}</Text>
                                {isTeacherProfile && <StaffPresencePulse userId={profile.id} schoolId={profile.school_id} />}
                            </VStack>
                        </HStack>

                        {/* Info Sections using EntityView or Manual Items */}
                        <Box sx={{ 
                            backgroundColor: colors.secondary, 
                            borderRadius: Theme.corners.generous,
                            padding: '$6',
                            borderWidth: 1,
                            borderColor: colors.border
                        }}>
                             <Heading size="md" mb="$4">{t('profile.personalDetails')}</Heading>
                             <VStack space="lg">
                                <EditableItem
                                    icon={UserIcon}
                                    label={t('profile.fullName')}
                                    value={profile.full_name}
                                    field="full_name"
                                    onSave={isOtherProfile ? undefined : handleSave}
                                />
                                <EditableItem
                                    icon={AtSign}
                                    label={t('profile.username')}
                                    value={profile.username}
                                    field="username"
                                    onSave={isOtherProfile ? undefined : handleSave}
                                />
                             </VStack>
                        </Box>

                        {/* Social Links */}
                        <ContactLinktree
                            links={profile.social_links || []}
                            userName={profile.full_name}
                            bio={profile.bio}
                            isOwnProfile={!isOtherProfile}
                        />

                        {!isOtherProfile && (
                             <SanctuaryButton onPress={() => setShowSocialModal(true)}>
                                 <HStack space="sm" alignItems="center">
                                     <Edit3 size={18} color="white" />
                                     <Text color="white" bold>Manage Social Links</Text>
                                 </HStack>
                             </SanctuaryButton>
                        )}
                    </VStack>
                </Box>
            </ScrollView>

            {!isOtherProfile && (
                <AddSocialLinkModal
                    visible={showSocialModal}
                    onClose={() => setShowSocialModal(false)}
                    userId={profile.id}
                />
            )}

            {isOtherProfile && currentUserId && (
                <GiveThuthimalModal
                    isOpen={showThuthimalModal}
                    onClose={() => setShowThuthimalModal(false)}
                    recipientId={profile.id}
                    recipientName={profile.full_name ?? 'this person'}
                    recipientRole={profile.role ?? 'teacher'}
                    giverId={currentUserId}
                    giverName={currentUserName}
                />
            )}
        </ScreenWrapper>
    );
}
