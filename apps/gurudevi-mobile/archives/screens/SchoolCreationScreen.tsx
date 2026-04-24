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
import { QRCodeGenerator, QRBuilder } from '@repo/scanner-kit';
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
    const navigation = useNavigation<any>();
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
                handle: state.basicInfo.handle,
                type: type,
                created_by: user.id,
            });

            // 2. Create Community Group \u2014 creator is auto-added as owner
            const group = await communityAPI.createGroupWithOwner({
                name: `${school.name} HQ`,
                handle: `${state.basicInfo.handle}-hq`,
                description: `Official community portal for ${school.name}`,
                group_type: 'general',
                join_policy: 'open',
                school_id: school.id,
            }, user.id);

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
            <ScreenWrapper noTopInset={true}
                <GlobalHeader title="Establishing Sanctuary..." /
                <Box sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: Theme.spacing.xl }}
                    <ActivityIndicator size="large" color={Theme.colors.sanctuarySaffron} /
                    <Text sx={{ marginTop: Theme.spacing.lg, color: colors.textSecondary, textAlign: 'center' }}
                        Constructing digital foundations...
                    </Text
                </Box
            </ScreenWrapper
        );
    }

    if (successData) {
        return (
            <ScreenWrapper noTopInset={true}
                <GlobalHeader title="Sanctuary Established!" /
                <ScrollView contentContainerStyle={{ padding: Theme.spacing.lg, paddingBottom: 120 }}
                    <VStack sx={{ gap: Theme.spacing.xl, alignItems: 'center', marginTop: Theme.spacing.xl }}
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
                        }}
                            <Check size={60} color={Theme.colors.obsidian} strokeWidth={3} /
                        </Box

                        <VStack sx={{ gap: Theme.spacing.xs, alignItems: 'center' }}
                            <Heading sx={{ fontSize: Theme.typography.fontSize['2xl'], textAlign: 'center' }} color={colors.text}
                                {successData.schoolName} is Live
                            </Heading
                            <Text sx={{ color: colors.textSecondary, textAlign: 'center' }}
                                Your digital foundations are successfully established.
                            </Text
                        </VStack

                        {/* School QR \u2014 scanning joins school + its community group in one action */}
                        <Box sx={{
                            width: '100%',
                            alignItems: 'center',
                            backgroundColor: colors.secondary,
                            padding: Theme.spacing.xl,
                            borderRadius: Theme.corners.comfortable,
                            borderWidth: 1,
                            borderColor: colors.border
                        }}
                            <Text sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: 'bold', color: Theme.colors.sanctuarySaffron, marginBottom: Theme.spacing.md, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 }}
                                Share this QR to invite others
                            </Text
                            <QRCodeGenerator
                                value={QRBuilder.school(successData.schoolId, successData.groupId)}
                                size={180}
                                label={successData.schoolName}
                                errorCorrectionLevel="H"
                            /
                            <Text sx={{ fontSize: Theme.typography.fontSize.xs, color: colors.textSecondary, marginTop: Theme.spacing.md, textAlign: 'center' }}
                                Scanning joins {successData.schoolName} and its Community HQ group
                            </Text
                        </Box

                        <Box sx={{ width: '100%', marginTop: Theme.spacing.lg, gap: Theme.spacing.md }}
                            {/* Primary: hierarchy setup is the principal's real next step */}
                            <SanctuaryButton
                                onPress={() => navigation.navigate('ClassroomList')}
                                action="primary"
                                size="lg"
                                fullWidth
                            
                                Set Up School Structure \u2192
                            </SanctuaryButton
                            <Text sx={{ fontSize: Theme.typography.fontSize.xs, color: colors.textTertiary, textAlign: 'center' }}
                                Add grades, sections and grade heads. Teachers join via the QR above, then create their own classrooms.
                            </Text
                        </Box
                    </VStack
                </ScrollView
            </ScreenWrapper
        );
    }

    return (
        <ScreenWrapper noTopInset={true}
            <GlobalHeader
                title="Establish School"
                subtitle="Bring your sanctuary to life"
                showBack
            /

            <StepIndicator
                currentStep={state.step}
                totalSteps={TOTAL_STEPS}
                stepLabels={STEP_LABELS}
            /

            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
                <Box sx={{ p: 16 }}
                    {renderStep()}
                </Box
            </ScrollView

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
            }}
                <HStack sx={{ gap: Theme.spacing.md }}
                    {state.step > 1 && (
                        <Box sx={{ flex: 1 }}
                            <SanctuaryButton
                                variant="outline"
                                onPress={handleBack}
                                leftIcon={ArrowLeft}
                            
                                Back
                            </SanctuaryButton
                        </Box
                    )}
                    <Box sx={{ flex: 2 }}
                        <SanctuaryButton
                            onPress={handleNext}
                            rightIcon={state.step === TOTAL_STEPS ? Check : ArrowRight}
                        
                            {state.step === TOTAL_STEPS ? 'Complete Setup' : 'Continue'}
                        </SanctuaryButton
                    </Box
                </HStack
            </Box
        </ScreenWrapper
    );
}
