import React from 'react';
import { ScrollView, Dimensions } from 'react-native';
import {
    Box,
    VStack,
    Text,
    Heading,
    useThemedColors,
    Theme,
    GlobalHeader,
    ScreenWrapper,
    useBottomTabPadding,
    Center,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, User as UserIcon, Fingerprint, FileText, Briefcase, GraduationCap, BookOpen, School } from 'lucide-react-native';
import IdentityCard from '../../components/profile/IdentityCard';

import { useProfile, EditableItem, UserProfile } from '@repo/profile';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - Theme.spacing.xl * 2;

type FullProfileScreenProps = NativeStackScreenProps<ProfileStackParamList, 'FullProfile'>;

export default function FullProfileScreen({ navigation }: FullProfileScreenProps) {
    const { profile, updateField } = useProfile();
    const { t } = useTranslation();
    const colors = useThemedColors();
    const bottomPadding = useBottomTabPadding();

    if (!profile) return null;

    const handleSave = async (field: string, value: any) => {
        // Handle array-based professional fields transformation before passing to hook
        let valueToSave = value;
        if ((field === 'subjects_taught' || field === 'qualifications') && typeof value === 'string') {
            valueToSave = value.split(',').map(s => s.trim()).filter(s => s !== '');
        } else if (field === 'experience_years' && typeof value === 'string') {
            valueToSave = parseInt(value, 10) || 0;
        }

        return updateField(field as keyof UserProfile, valueToSave);
    };

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader
                title={t('profile.fullProfile', 'Profile Details')}
                showBack
                onBack={() => navigation.goBack()}
            />
            <ScrollView contentContainerStyle={{ paddingBottom: bottomPadding + 40 }}>
                <VStack space="2xl" sx={{ paddingVertical: Theme.spacing.md }}>

                    {/* Identity Card Preview - Centered */}
                    <Center>
                        <Box>
                            <IdentityCard profile={profile} />
                        </Box>
                    </Center>

                    {/* Detailed Information */}
                    <Center>
                        <Box
                            sx={{
                                backgroundColor: colors.secondary,
                                borderRadius: Theme.corners.generous,
                                padding: Theme.spacing.lg,
                                borderWidth: 1,
                                borderColor: colors.border,
                                width: CARD_WIDTH,
                                ...Theme.shadows.md
                            }}
                        >
                            <Heading size="md" color={colors.text} mb="$4">
                                {t('profile.personalDetails', 'Identity & Contact')}
                            </Heading>

                            <VStack space="xl">
                                <EditableItem
                                    icon={UserIcon}
                                    label={t('profile.fullName', 'Full Name')}
                                    value={profile.full_name}
                                    field="full_name"
                                    placeholder="Enter full name"
                                    onSave={handleSave}
                                />

                                <EditableItem
                                    icon={Phone}
                                    label={t('profile.phone', 'Phone Number')}
                                    value={profile.phone}
                                    field="phone"
                                    placeholder="+94 XX XXX XXXX"
                                    onSave={handleSave}
                                />

                                {profile.role === 'student' ? (
                                    <EditableItem
                                        icon={Fingerprint}
                                        label={t('profile.indexNumber', 'Index Number')}
                                        value={profile.index_number}
                                        field="index_number"
                                        placeholder="STU-XXXXX"
                                        onSave={handleSave}
                                    />
                                ) : (
                                    <EditableItem
                                        icon={Fingerprint}
                                        label={t('profile.nicNumber', 'NIC Number')}
                                        value={profile.nic_number}
                                        field="nic_number"
                                        placeholder="19XXXXXXXXXX"
                                        onSave={handleSave}
                                    />
                                )}
                            </VStack>
                        </Box>
                    </Center>

                    {/* Professional Details Section - Educational Staff Only */}
                    {['teacher', 'principal', 'grade_head', 'section_head'].includes(profile.role) && (
                        <Center>
                            <Box
                                sx={{
                                    backgroundColor: colors.secondary,
                                    borderRadius: Theme.corners.generous,
                                    padding: Theme.spacing.lg,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    width: CARD_WIDTH,
                                    ...Theme.shadows.md
                                }}
                            >
                                <Heading size="md" color={colors.text} mb="$4">
                                    {t('profile.professionalDetails', 'Professional Branding')}
                                </Heading>

                                <VStack space="xl">
                                    <EditableItem
                                        icon={School}
                                        label={t('profile.currentSchool', 'Sanctuary Institution')}
                                        value={profile.school_name || ''}
                                        field="school_name"
                                        placeholder={t('profile.noSchool', 'Affiliate with a school')}
                                        onSave={async () => { }} // Read-only for now or needs school Picker
                                    />

                                    <EditableItem
                                        icon={Briefcase}
                                        label={t('profile.experience', 'Years of Experience')}
                                        value={profile.experience_years?.toString()}
                                        field="experience_years"
                                        placeholder="0"
                                        onSave={handleSave}
                                    />

                                    <EditableItem
                                        icon={BookOpen}
                                        label={t('profile.subjects', 'Specialized Subjects')}
                                        value={Array.isArray(profile.subjects_taught) ? profile.subjects_taught.join(', ') : profile.subjects_taught}
                                        field="subjects_taught"
                                        placeholder="Math, Physics..."
                                        onSave={handleSave}
                                    />

                                    <EditableItem
                                        icon={GraduationCap}
                                        label={t('profile.qualifications', 'Degrees & Certifications')}
                                        value={Array.isArray(profile.qualifications) ? profile.qualifications.join(', ') : profile.qualifications}
                                        field="qualifications"
                                        placeholder="B.A, M.Sc, etc."
                                        onSave={handleSave}
                                    />
                                </VStack>
                            </Box>
                        </Center>
                    )}

                    {/* Bio Section */}
                    <Center>
                        <Box
                            sx={{
                                backgroundColor: colors.secondary,
                                borderRadius: Theme.corners.generous,
                                padding: Theme.spacing.lg,
                                borderWidth: 1,
                                borderColor: colors.border,
                                width: CARD_WIDTH,
                                ...Theme.shadows.md
                            }}
                        >
                            <Heading size="md" color={colors.text} mb="$4">
                                {t('profile.aboutMe', 'Your Story')}
                            </Heading>
                            <EditableItem
                                field="bio"
                                label={t('profile.bio', 'Bio')}
                                value={profile.bio}
                                icon={FileText}
                                placeholder={t('profile.tellUsAboutYourself', 'Tell us about yourself...')}
                                onSave={handleSave}
                                multiline={true}
                            />
                        </Box>
                    </Center>

                    {/* App Version Info */}
                    <Box alignItems="center" mt="$4">
                        <Text size="xs" color={colors.textTertiary}>
                            v1.2.0 • Sanctuary ID: {profile.id?.substring(0, 8)}
                        </Text>
                    </Box>
                </VStack>
            </ScrollView>
        </ScreenWrapper>
    );
}
