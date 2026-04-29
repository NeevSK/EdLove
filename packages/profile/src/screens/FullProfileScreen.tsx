import { useStore } from '@repo/core/logic';

// Local Package Imports
import { StaffPresencePulse } from '@repo/people';
import {
  AchievementUnlockOverlay,
  Box,
  Button,
  ButtonText,
  Center,
  GlobalHeader,
  Heading,
  HStack,
  IdentityCard,
  ScreenWrapper,
  Text,
  VStack,
} from '@repo/ui';
import { SanctuaryProgressBar, useBottomTabPadding } from '@repo/ui/components';
import { Pressable } from '@repo/ui/primitives';
import { hapticSuccess } from '@repo/ui/utils/haptics';

import {
  AtSign,
  BookOpen,
  Briefcase,
  Edit3,
  FileText,
  Fingerprint,
  GraduationCap,
  Heart,
  Phone,
  School,
  User as UserIcon,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, ScrollView, useWindowDimensions } from 'react-native';
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AddSocialLinkModal } from '../components/AddSocialLinkModal';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { ContactLinktree } from '../components/ContactLinktree';
import { EditableItem } from '../components/EditableItem';
import { GiveThuthimalModal } from '../components/GiveThuthimalModal';
import { useProfile } from '../hooks/useProfile';
import { useProfileCompletion } from '../hooks/useProfileCompletion';
import { useSocialLinks } from '../hooks/useSocialLinks';
import type { UserProfile } from '../types';

// We use any for navigation props to avoid strict app-level dependency inside the package
export const FullProfileScreen = ({ route, navigation }: any) => {
  const { profile: initialParams } = route.params;
  const initialProfile = initialParams as unknown as UserProfile;

  const { t } = useTranslation();
  const { user: currentUser, userRole } = useStore();
  const bottomPadding = useBottomTabPadding();
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(windowWidth, 600) - 32;

  const {
    profile: liveProfile,
    updateField,
    refresh,
    uploadAvatar,
  } = useProfile(initialProfile?.id);
  const profile = liveProfile || initialProfile;
  const completionResult = useProfileCompletion(profile, userRole ?? null);
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
    if (completionResult.isComplete && !completionResult.hasSeenCompletionCelebration) {
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
  const isTeacherProfile = [
    'teacher',
    'principal',
    'gradeHead',
    'sectionHead',
    'grade_head',
    'section_head',
  ].includes(profileRole);

  const handleSave = async (field: string, value: any) => {
    let valueToSave = value;
    if ((field === 'subjects_taught' || field === 'qualifications') && typeof value === 'string') {
      valueToSave = value
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== '');
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
    <ScreenWrapper scroll={false}>
      <GlobalHeader title={t('profile.fullProfile')} showBack onBack={() => navigation.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: 16,
          paddingBottom: bottomPadding + 40,
        }}
      >
        <VStack space="2xl">
          <Center>
            <Box style={{ width: cardWidth }}>
              <IdentityCard data={profile} />
            </Box>
          </Center>

          <Center className="mt-4">
            <AvatarDisplay
              userId={profile.id}
              avatarUrl={profile.avatar_url}
              fullName={profile.full_name}
              size={80}
              editable={!isOtherProfile}
              onAvatarSelected={async (localUri) => {
                const result = await uploadAvatar(localUri);
                if (result.success) {
                  await refresh?.();
                  hapticSuccess();
                }
              }}
            />
            {!isOtherProfile && (
              <Text className="text-phase-text-tertiary text-xs mt-2">
                Tap to update your photo
              </Text>
            )}
          </Center>

          {isOtherProfile && isTeacherProfile && currentUserId && (
            <Center>
              <Button
                size="lg"
                onPress={() => setShowThuthimalModal(true)}
                className="bg-phase-interactive rounded-2xl"
                action="primary"
              >
                <HStack space="sm" className="items-center">
                  <Heart size={20} color="white" />
                  <ButtonText>Give Thuthimal</ButtonText>
                </HStack>
              </Button>
            </Center>
          )}

          {!isOtherProfile && (
            <Reanimated.View style={barAnimStyle}>
              <Box className="px-4 mt-2">
                <SanctuaryProgressBar
                  percentage={completionResult.percentage}
                  isComplete={completionResult.isComplete}
                  nextHint={completionResult.nextHint}
                />
              </Box>
            </Reanimated.View>
          )}

          <Center>
            <Box
              className="bg-phase-canvas rounded-3xl p-6 border border-phase-surface shadow-md"
              style={{
                width: cardWidth,
                shadowColor: '#9DA1A3',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
              }}
            >
              <Heading className="text-phase-text-primary text-lg mb-6">
                {t('profile.personalDetails')}
              </Heading>
              <VStack space="xl">
                <EditableItem
                  icon={UserIcon}
                  label={t('profile.fullName')}
                  value={profile.full_name}
                  field="full_name"
                  placeholder="Enter full name"
                  onSave={isOtherProfile ? async () => {} : handleSave}
                />
                <EditableItem
                  icon={AtSign}
                  label={t('profile.username')}
                  value={profile.username}
                  field="username"
                  placeholder="your-handle"
                  onSave={isOtherProfile || profile.is_anonymous ? async () => {} : handleSave}
                  disabled={profile.is_anonymous}
                  helperText={
                    profile.is_anonymous
                      ? t('profile.anonymousHandleNotice')
                      : t('profile.handleGuideline')
                  }
                  transform={(text) => text.toLowerCase().replace(/[^a-z0-9_-]/g, '')}
                />
                <EditableItem
                  icon={Phone}
                  label={t('profile.phone')}
                  value={profile.phone}
                  field="phone"
                  placeholder="+94 XX XXX XXXX"
                  onSave={isOtherProfile ? async () => {} : handleSave}
                />
                {isStudentProfile ? (
                  <EditableItem
                    icon={Fingerprint}
                    label={t('profile.indexNumber')}
                    value={profile.index_number}
                    field="index_number"
                    placeholder="STU-XXXXX"
                    onSave={isOtherProfile ? async () => {} : handleSave}
                  />
                ) : (
                  <EditableItem
                    icon={Fingerprint}
                    label={t('profile.nicNumber')}
                    value={profile.nic_number}
                    field="nic_number"
                    placeholder="19XXXXXXXXXX"
                    onSave={isOtherProfile ? async () => {} : handleSave}
                  />
                )}
              </VStack>
            </Box>
          </Center>

          {isTeacherProfile && (
            <Center>
              <Box
                className="bg-phase-canvas rounded-3xl p-6 border border-phase-surface shadow-md"
                style={{
                  width: cardWidth,
                  shadowColor: '#9DA1A3',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 10,
                }}
              >
                <Heading className="text-phase-text-primary text-lg mb-6">
                  {t('profile.professionalDetails')}
                </Heading>
                <VStack space="xl">
                  <EditableItem
                    icon={School}
                    label={t('profile.currentSchool')}
                    value={profile.school_name || ''}
                    field="school_name"
                    placeholder={t('profile.noSchool')}
                    onSave={async () => {}}
                  />
                  <EditableItem
                    icon={Briefcase}
                    label={t('profile.experience')}
                    value={profile.experience_years?.toString()}
                    field="experience_years"
                    placeholder="0"
                    onSave={isOtherProfile ? async () => {} : handleSave}
                  />
                  <EditableItem
                    icon={BookOpen}
                    label={t('profile.subjects')}
                    value={
                      Array.isArray(profile.subjects_taught)
                        ? profile.subjects_taught.join(', ')
                        : profile.subjects_taught
                    }
                    field="subjects_taught"
                    placeholder="Math, Physics..."
                    onSave={isOtherProfile ? async () => {} : handleSave}
                  />
                  <EditableItem
                    icon={GraduationCap}
                    label={t('profile.qualifications')}
                    value={
                      Array.isArray(profile.qualifications)
                        ? profile.qualifications.join(', ')
                        : profile.qualifications
                    }
                    field="qualifications"
                    placeholder="B.A, M.Sc, etc."
                    onSave={isOtherProfile ? async () => {} : handleSave}
                  />
                </VStack>
              </Box>
            </Center>
          )}

          <Center>
            <Box
              className="bg-phase-canvas rounded-3xl p-6 border border-phase-surface shadow-md"
              style={{
                width: cardWidth,
                shadowColor: '#9DA1A3',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
              }}
            >
              <Heading className="text-phase-text-primary text-lg mb-6">
                {t('profile.aboutMe')}
              </Heading>
              <EditableItem
                field="bio"
                label={t('profile.bio')}
                value={profile.bio}
                icon={FileText}
                placeholder={t('profile.tellUsAboutYourself')}
                onSave={isOtherProfile ? async () => {} : handleSave}
                multiline={true}
              />
            </Box>
          </Center>

          <Center>
            <Box style={{ width: cardWidth }}>
              <ContactLinktree
                links={socialLinks || []}
                userName={profile.full_name}
                bio={profile.bio}
                userId={profile.id}
                isOwnProfile={!isOtherProfile}
              />
              {!isOtherProfile && (
                <Pressable
                  onPress={() => setShowSocialModal(true)}
                  className="mt-4 p-4 rounded-2xl border border-dashed border-phase-surface items-center bg-phase-surface/30"
                >
                  <HStack space="sm" className="items-center">
                    <Edit3 size={18} color="#4A90E2" />
                    <Text className="text-phase-interactive font-bold">Manage Social Hub</Text>
                  </HStack>
                </Pressable>
              )}
            </Box>
          </Center>

          {isTeacherProfile && profile.school_id && (
            <Center>
              <Box style={{ width: cardWidth }}>
                <StaffPresencePulse userId={profile.id} schoolId={profile.school_id} />
              </Box>
            </Center>
          )}

          <Box className="items-center mt-4">
            <Text className="text-phase-text-tertiary text-[10px] uppercase tracking-widest">
              v1.2.0 • Sanctuary ID: {profile.id?.substring(0, 8)}
            </Text>
          </Box>
        </VStack>
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
          recipientName={profile.full_name}
          recipientTier={profileRole}
          giverId={currentUserId}
          giverName={currentUserName}
        />
      )}

      {!isOtherProfile && (
        <AchievementUnlockOverlay
          title="Profile Complete!"
          visible={showCelebration}
          onHide={() => setShowCelebration(false)}
        />
      )}
    </ScreenWrapper>
  );
};
