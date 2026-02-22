import React, { useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    ScreenWrapper,
    GlobalHeader,
    SanctuaryButton,
    StepIndicator,
    useThemedColors,
    Theme
} from '@repo/ui';
import { useSchoolCreation, SRI_LANKAN_PROVINCES, SRI_LANKAN_DISTRICTS, STUDENT_TYPES, useStore, schoolAPI } from '@repo/core';
import { communityAPI } from '@repo/community';
import { QRCodeGenerator } from '@repo/scanner-kit';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowLeft, Check, Zap } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

// Step Components
import StepBasicInfo from '../components/school/StepBasicInfo';
import StepLocation from '../components/school/StepLocation';
import StepDemographics from '../components/school/StepDemographics';
import StepHierarchy from '../components/school/StepHierarchy';

const TOTAL_STEPS = 4;
const STEP_LABELS = [
    'Basic Information',
    'Location & Area',
    'Students & Identity',
    'Hierarchy & Levels'
];

export default function SchoolCreationScreen() {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const navigation = useNavigation();
    const { user, setUser, setDemoMode } = useStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successData, setSuccessData] = useState<{ schoolId: string; groupId: string; schoolName: string } | null>(null);

    const {
        state,
        updateStep,
        updateBasicInfo,
        updateLocation,
        updateDemographics,
        updateHierarchy,
        resetProgress
    } = useSchoolCreation();

    const handleNext = () => {
        if (state.step < TOTAL_STEPS) {
            updateStep(state.step + 1);
        } else {
            handleFinalSubmit();
        }
    };

    const handleBack = () => {
        if (state.step > 1) {
            updateStep(state.step - 1);
        }
    };

    const handleFinalSubmit = async () => {
        if (!user) return;

        try {
            setIsSubmitting(true);

            const hasPrimary = state.hierarchy.levels.some(l => l.toLowerCase().includes('primary'));
            const hasSecondary = state.hierarchy.levels.some(l => l.toLowerCase().includes('secondary'));
            const type = (hasPrimary && hasSecondary) ? 'mixed' : hasPrimary ? 'primary' : 'secondary';

            // 1. Create School
            const school = await schoolAPI.create({
                name: state.basicInfo.name || 'My Sanctuary',
                type: type,
                created_by: user.id,
            });

            // 2. Create Community Group
            const group = await communityAPI.createGroup({
                name: `${school.name} HQ`,
                description: `Official community portal for ${school.name}`,
                type: 'general',
                join_policy: 'open',
                visibility: 'school',
                allow_posts: true,
                allow_announcements: true,
                require_post_approval: false,
                school_id: school.id,
            }, user.id, user.role);

            // 3. Update Global Store & Disable Demo Mode
            setUser({
                ...user,
                school_id: school.id
            });
            setDemoMode(false);

            // Set Success Data and Reset local cache
            setSuccessData({ schoolId: school.id, groupId: group.id, schoolName: school.name });
            await resetProgress();

            // Note: useStore User state (`school_id`) and App context must be refreshed 
            // by the application to fully lock into the new school. 
            // schoolAPI.create already updates `users.school_id`.
        } catch (error) {
            console.error('Failed to establish school', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        switch (state.step) {
            case 1:
                return <StepBasicInfo data={state.basicInfo} onUpdate={updateBasicInfo} />;
            case 2:
                return <StepLocation data={state.location} onUpdate={updateLocation} />;
            case 3:
                return <StepDemographics data={state.demographics} onUpdate={updateDemographics} />;
            case 4:
                return <StepHierarchy data={state.hierarchy} onUpdate={updateHierarchy} />;
            default:
                return null;
        }
    };

    if (isSubmitting) {
        return (
            <ScreenWrapper>
                <GlobalHeader title="Establishing Sanctuary..." />
                <Box sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: Theme.spacing.xl }}>
                    <ActivityIndicator size="large" color={Theme.colors.sanctuarySaffron} />
                    <Text sx={{ marginTop: Theme.spacing.lg, color: colors.textSecondary, textAlign: 'center' }}>
                        Constructing digital foundations...
                    </Text>
                </Box>
            </ScreenWrapper>
        );
    }

    if (successData) {
        return (
            <ScreenWrapper>
                <GlobalHeader title="Sanctuary Established!" />
                <ScrollView contentContainerStyle={{ padding: Theme.spacing.lg, paddingBottom: 120 }}>
                    <VStack sx={{ gap: Theme.spacing.xl, alignItems: 'center', marginTop: Theme.spacing.xl }}>
                        <Box sx={{
                            width: 100,
                            height: 100,
                            borderRadius: 50,
                            backgroundColor: Theme.colors.sanctuarySaffron,
                            alignItems: 'center',
                            justifyContent: 'center',
                            elevation: 8,
                            shadowColor: Theme.colors.sanctuarySaffron,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 10
                        }}>
                            <Check size={60} color={Theme.colors.voidIndigo} strokeWidth={3} />
                        </Box>

                        <VStack sx={{ gap: Theme.spacing.xs, alignItems: 'center' }}>
                            <Heading sx={{ fontSize: Theme.typography.fontSize['2xl'], textAlign: 'center' }} color={colors.text}>
                                {successData.schoolName} is Live
                            </Heading>
                            <Text sx={{ color: colors.textSecondary, textAlign: 'center' }}>
                                Your digital foundations are successfully established.
                            </Text>
                        </VStack>

                        {/* QR Codes Grid */}
                        <HStack sx={{ gap: Theme.spacing.md, width: '100%', flexWrap: 'wrap' }}>
                            {/* School QR */}
                            <Box sx={{
                                flex: 1,
                                minWidth: 160,
                                alignItems: 'center',
                                backgroundColor: colors.secondary,
                                padding: Theme.spacing.lg,
                                borderRadius: Theme.corners.comfortable,
                                borderWidth: 1,
                                borderColor: colors.border
                            }}>
                                <Text sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: 'bold', color: Theme.colors.sanctuarySaffron, marginBottom: Theme.spacing.md, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>
                                    School Identity
                                </Text>
                                <QRCodeGenerator value={successData.schoolId} label={successData.schoolId.split('-')[0]} />
                            </Box>

                            {/* Community HQ QR */}
                            <Box sx={{
                                flex: 1,
                                minWidth: 160,
                                alignItems: 'center',
                                backgroundColor: colors.secondary,
                                padding: Theme.spacing.lg,
                                borderRadius: Theme.corners.comfortable,
                                borderWidth: 1,
                                borderColor: colors.border
                            }}>
                                <Text sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: 'bold', color: Theme.colors.sageGreen, marginBottom: Theme.spacing.md, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Community HQ
                                </Text>
                                <QRCodeGenerator value={`join-group:${successData.groupId}`} label={successData.groupId.split('-')[0]} />
                            </Box>
                        </HStack>

                        <Box sx={{ width: '100%', marginTop: Theme.spacing.lg }}>
                            <SanctuaryButton
                                onPress={() => navigation.navigate('ClassroomList')}
                            >
                                Enter Your Sanctuary
                            </SanctuaryButton>
                        </Box>
                    </VStack>
                </ScrollView>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <GlobalHeader
                title="Establish School"
                subtitle="Bring your sanctuary to life"
                showBack
            />

            <StepIndicator
                currentStep={state.step}
                totalSteps={TOTAL_STEPS}
                stepLabels={STEP_LABELS}
            />

            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}>
                <Box sx={{ p: '$4' as any }}>
                    {renderStep()}
                </Box>
            </ScrollView>

            {/* Footer Navigation */}
            <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: colors.secondary,
                padding: Theme.spacing.lg,
                borderTopWidth: 1,
                borderTopColor: colors.border,
                paddingBottom: 40 // Safe area handling
            }}>
                <HStack sx={{ gap: '$md' as any }}>
                    {state.step > 1 && (
                        <Box sx={{ flex: 1 }}>
                            <SanctuaryButton
                                variant="outline"
                                onPress={handleBack}
                                leftIcon={ArrowLeft}
                            >
                                Back
                            </SanctuaryButton>
                        </Box>
                    )}
                    <Box sx={{ flex: 2 }}>
                        <SanctuaryButton
                            onPress={handleNext}
                            rightIcon={state.step === TOTAL_STEPS ? Check : ArrowRight}
                        >
                            {state.step === TOTAL_STEPS ? 'Complete Setup' : 'Continue'}
                        </SanctuaryButton>
                    </Box>
                </HStack>
            </Box>
        </ScreenWrapper>
    );
}
