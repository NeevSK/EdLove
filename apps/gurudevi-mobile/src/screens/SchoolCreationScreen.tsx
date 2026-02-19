import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    ScreenWrapper,
    GlobalHeader,
    SanctuaryButton,
    StepIndicator,
    useThemedColors,
    Theme
} from '@repo/ui';
import { useSchoolCreation, SRI_LANKAN_PROVINCES, SRI_LANKAN_DISTRICTS, STUDENT_TYPES } from '@repo/core';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowLeft, Check, School } from 'lucide-react-native';

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
        // Final submission logic to Supabase
        console.log('Submitting School Data:', state);
        // await api.school.create(state);
        // resetProgress();
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

    return (
        <ScreenWrapper>
            <GlobalHeader
                title="Establish School"
                subtitle="Bring your sanctuary to life"
                showBackButton
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
