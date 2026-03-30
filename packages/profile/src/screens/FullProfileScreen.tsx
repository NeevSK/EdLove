import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
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
    useBottomTabPadding,
    Center,
    SanctuaryProgressBar,
    hapticSuccess,
    AchievementUnlockOverlay,
    SanctuaryButton,
} from '@repo/ui';
import { IdentityCard } from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { Phone, Edit3, User as UserIcon, FileText, Fingerprint, Briefcase, GraduationCap, BookOpen, School, AtSign } from 'lucide-react-native';
import Reanimated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';
import { useStore } from '@repo/core';

// Local Package Imports
import { StaffPresencePulse } from '@repo/people';
import { AddSocialLinkModal } from '../components/AddSocialLinkModal';
import { UserProfile } from '../types';
import { useProfileCompletion } from '../hooks/useProfileCompletion';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { ContactLinktree } from '../components/ContactLinktree';
import { GiveThuthimalModal } from '../components/GiveThuthimalModal';
import { EditableItem } from '../components/EditableItem';
import { useProfile } from '../hooks/useProfile';
import { useSocialLinks } from '../hooks/useSocialLinks';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - Theme.spacing.xl * 2;

// We use any for navigation props to avoid strict app-level dependency inside the package
export const FullProfileScreen = ({ route, navigation }: any) => {
    const { profile: initialParams } = route.params;
    const initialProfile = initialParams as unknown as UserProfile;
    
    const { t } = useTranslation();
    const colors = useThemedColors();
    const { user: currentUser } = useStore();
    const bottomPadding = useBottomTabPadding();
    
    const { profile: liveProfile, updateField, refresh, uploadAvatar } = useProfile(initialProfile?.id);
    const profile = liveProfile || initialProfile;
    const completionResult = useProfileCompletion(profile, currentUser?.authority ?? null);
    const { links: socialLinks } = useSocialLinks(profile?.id);

    const [showCelebration, setShowCelebration] = useState(false);
    const [showSocialModal, setShowSocialModal] = useState(false);
    const [showThuthimalModal, setShowThuthimalModal] = useState(false);

    const currentUserId = currentUser?.id;
    const currentUserName = currentUser?.full_name || currentUser?.email || '';

    const barOpacity = useSharedValue(1);
    const barAnimStyle = useAnimatedStyle(() => ({
        opacity: barOpacity.value,
    }));

    useEffect(() => {
        if (
            completionResult.isComplete &&
            !completionResult.hasSeenCompletionCelebration
        ) {
            setShowCelebration(true);
            hapticSuccess();
            completionResult.markCompletionCelebrationSeen();
            const timer = setTimeout(() => {
                barOpacity.value = withTiming(0, { duration: 800 });
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [completionResult.isComplete, completionResult.hasSeenCompletionCelebration, barOpacity]);

    if (!profile) return null;

    const isOtherProfile = currentUserId !== undefined && currentUserId !== profile.id;
    const profileRole = ((profile as any).authority ?? profile.role ?? '').toString();
    const isStudentProfile = profileRole === 'student';
    const isTeacherProfile = ['teacher', 'principal', 'gradeHead', 'sectionHead', 'grade_head', 'section_head'].includes(profileRole);

    const handleSave = async (field: string, value: any) => {
        let valueToSave = value;
        if ((field === 'subjects_taught' || field === 'qualifications') && typeof value === 'string') {
            valueToSave = value.split(',').map(s => s.trim()).filter(s => s !== '');
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
            /            ><ScrollView contentContainerStyle={{ paddingBottom: bottomPadding + 40 }}                <VStack space="2xl" sx={{ paddingVertical: Theme.spacing.md }}
                    <Center                        <Box                            <IdentityCard >data={profile} /                        ></Box                    </Center
                    <Center mt={Theme.spacing.lg}                        <AvatarDisplay
                            userId={profile.id}
                            avatarUrl={profile.avatar_url}
                            fullName={profile.full_name}
                            size={72}
                            editable={!isOtherProfile}
                            onAvatarSelected={async (localUri) => {
                                const result = await uploadAvatar(localUri);
                                if (result.success) {
                                    await refresh?.();
                                    hapticSuccess();
                                }
                            }}
                        /                        {!isOtherProfile && (
                            <Text size="xs" color={colors.textTertiary} mt={Theme.spacing.xs}                                Tap to update your photo
                            </Text                        )}
                    </Center
                    {isOtherProfile && isTeacherProfile && currentUserId && (
                        <Center                            <SanctuaryButton
                                >onPress={() => setShowThuthimalModal(true)}
                                accessibilityLabel={`Give Thuthimal gift to ${profile.full_name}`}
                                                            {'=O'} Give Thuthimal
                            </SanctuaryButton                        </Center                    )}

                    {!isOtherProfile && (
                        <Reanimated.View style={barAnimStyle}                            <SanctuaryProgressBar
                                percentage={completionResult.percentage}
                                isComplete={completionResult.isComplete}
                                nextHint={completionResult.nextHint}
                                style={{
                                    paddingHorizontal: Theme.spacing.xl,
                                    marginTop: Theme.spacing.md,
                                    marginBottom: Theme.spacing.xs,
                                }}
                            /                        ></Reanimated.View                    )}

                    <Center                        <Box
                            >sx={{
                                backgroundColor: colors.secondary,
                                borderRadius: Theme.corners.generous,
                                padding: Theme.spacing.lg,
                                borderWidth: 1,
                                borderColor: colors.border,
                                width: CARD_WIDTH,
                                ...Theme.shadows.md
                            }}
                                                    <Heading size="md" color={colors.text} mb="$4"                                {t('profile.personalDetails')}
                            </Heading
                            <VStack space="xl"                                <EditableItem
                                    icon={UserIcon}
                                    label={t('profile.fullName')}
                                    value={profile.full_name}
                                    field="full_name"
                                    placeholder="Enter full name"
                                    onSave={isOtherProfile ? async () => { } : handleSave}
                                /
                                ><EditableItem
                                    icon={AtSign}
                                    label={t('profile.username')}
                                    value={profile.username}
                                    field="username"
                                    placeholder="your-handle"
                                    onSave={(isOtherProfile || profile.is_anonymous) ? async () => { } : handleSave}
                                    disabled={profile.is_anonymous}
                                    helperText={profile.is_anonymous ? t('profile.anonymousHandleNotice') : t('profile.handleGuideline')}
                                    transform={(text) => text.toLowerCase().replace(/[^a-z0-9_-]/g, '')}
                                /
                                ><EditableItem
                                    icon={Phone}
                                    label={t('profile.phone')}
                                    value={profile.phone}
                                    field="phone"
                                    placeholder="+94 XX XXX XXXX"
                                    onSave={isOtherProfile ? async () => { } : handleSave}
                                /
                                >{isStudentProfile ? (
                                    <EditableItem
                                        icon={Fingerprint}
                                        label={t('profile.indexNumber')}
                                        value={profile.index_number}
                                        field="index_number"
                                        placeholder="STU-XXXXX"
                                        onSave={isOtherProfile ? async () => { } : handleSave}
                                    /                                >) : (
                                    <EditableItem
                                        icon={Fingerprint}
                                        label={t('profile.nicNumber')}
                                        value={profile.nic_number}
                                        field="nic_number"
                                        placeholder="19XXXXXXXXXX"
                                        onSave={isOtherProfile ? async () => { } : handleSave}
                                    /                                >)}
                            </VStack                        </Box                    </Center
                    {isTeacherProfile && (
                        <Center                            <Box
                                >sx={{
                                    backgroundColor: colors.secondary,
                                    borderRadius: Theme.corners.generous,
                                    padding: Theme.spacing.lg,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    width: CARD_WIDTH,
                                    ...Theme.shadows.md
                                }}
                                                            <Heading size="md" color={colors.text} mb="$4"                                    {t('profile.professionalDetails')}
                                </Heading
                                <VStack space="xl"                                    <EditableItem
                                        icon={School}
                                        label={t('profile.currentSchool')}
                                        value={profile.school_name || ''}
                                        field="school_name"
                                        placeholder={t('profile.noSchool')}
                                        onSave={async () => { }} 
                                    /
                                    ><EditableItem
                                        icon={Briefcase}
                                        label={t('profile.experience')}
                                        value={profile.experience_years?.toString()}
                                        field="experience_years"
                                        placeholder="0"
                                        onSave={isOtherProfile ? async () => { } : handleSave}
                                    /
                                    ><EditableItem
                                        icon={BookOpen}
                                        label={t('profile.subjects')}
                                        value={Array.isArray(profile.subjects_taught) ? profile.subjects_taught.join(', ') : profile.subjects_taught}
                                        field="subjects_taught"
                                        placeholder="Math, Physics..."
                                        onSave={isOtherProfile ? async () => { } : handleSave}
                                    /
                                    ><EditableItem
                                        icon={GraduationCap}
                                        label={t('profile.qualifications')}
                                        value={Array.isArray(profile.qualifications) ? profile.qualifications.join(', ') : profile.qualifications}
                                        field="qualifications"
                                        placeholder="B.A, M.Sc, etc."
                                        onSave={isOtherProfile ? async () => { } : handleSave}
                                    /                                ></VStack                            </Box                        </Center                    )}

                    <Center                        <Box
                            >sx={{
                                backgroundColor: colors.secondary,
                                borderRadius: Theme.corners.generous,
                                padding: Theme.spacing.lg,
                                borderWidth: 1,
                                borderColor: colors.border,
                                width: CARD_WIDTH,
                                ...Theme.shadows.md
                            }}
                                                    <Heading size="md" color={colors.text} mb="$4"                                {t('profile.aboutMe')}
                            </Heading                            <EditableItem
                                field="bio"
                                label={t('profile.bio')}
                                value={profile.bio}
                                icon={FileText}
                                placeholder={t('profile.tellUsAboutYourself')}
                                onSave={isOtherProfile ? async () => { } : handleSave}
                                multiline={true}
                            /                        ></Box                    </Center
                    <Center                        <Box sx={{ width: CARD_WIDTH }}                            <ContactLinktree
                                links={socialLinks || []}
                                userName={profile.full_name}
                                bio={profile.bio}
                                userId={profile.id}
                                isOwnProfile={!isOtherProfile}
                            /
                            >{!isOtherProfile && (
                                <TouchableOpacity accessibilityRole="button"
                                    onPress={() => setShowSocialModal(true)}
                                    style={styles.manageSocialsBtn}
                                                                    <HStack space="sm" alignItems="center"                                        <Edit3 size={18} color={colors.action} /                                        ><Text color={colors.action} bold>Manage Social Hub</Text                                    ></HStack                                </TouchableOpacity                            )}
                        </Box                    </Center
                    {isTeacherProfile && profile.school_id && (
                        <Center                            <Box >sx={{ width: CARD_WIDTH }}                                <StaffPresencePulse
                                    userId={profile.id}
                                    schoolId={profile.school_id}
                                /                            ></Box                        </Center                    )}

                    <Box alignItems="center" mt="$4"                        <Text size="xs" color={colors.textTertiary}                            v1.2.0 " Sanctuary ID: {profile.id?.substring(0, 8)}
                        </Text                    </Box                </VStack            </ScrollView
            {!isOtherProfile && (
                <AddSocialLinkModal
                    visible={showSocialModal}
                    onClose={() => setShowSocialModal(false)}
                    userId={profile.id}
                /            >)}

            {isOtherProfile && currentUserId && (
                <GiveThuthimalModal
                    isOpen={showThuthimalModal}
                    onClose={() => setShowThuthimalModal(false)}
                    recipientId={profile.id}
                    recipientName={profile.full_name}
                    recipientTier={((profile as any).authority ?? profile.role) as any ?? 'teacher'}
                    giverId={currentUserId}
                    giverName={currentUserName}
                /            >)}

            {!isOtherProfile && (
                <AchievementUnlockOverlay
                    title="( Profile Complete!"
                    visible={showCelebration}
                    onHide={() => setShowCelebration(false)}
                /            >)}
        </ScreenWrapper    );
}

const styles = StyleSheet.create({
    manageSocialsBtn: {
        marginTop: 8,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        borderStyle: 'dashed',
    },
});
