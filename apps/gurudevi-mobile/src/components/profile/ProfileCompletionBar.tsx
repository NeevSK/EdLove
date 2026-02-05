/**
 * PROFILE COMPLETION BAR COMPONENT
 * 
 * Widget to show profile completion progress.
 * Features:
 * - Circular progress bar showing completion percentage
 * - Checks if fields are null (avatar_url, bio, phone, etc.)
 * - "Complete Profile" button if < 100%
 * 
 * Mission 06: Community & Onboarding
 */

import React, { useMemo } from 'react';
import {
    VStack,
    HStack,
    Text,
    Box,
    Button,
    ButtonText,
    Progress,
    ProgressFilledTrack,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import Theme from '../../constants/Theme';

interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string | null;
    bio?: string | null;
    phone?: string | null;
    school_id?: string | null;
    role?: string | null;
}

interface ProfileCompletionBarProps {
    userProfile: UserProfile;
    onCompleteProfile?: () => void;
}

export default function ProfileCompletionBar({
    userProfile,
    onCompleteProfile,
}: ProfileCompletionBarProps) {
    const { t } = useTranslation();

    // Calculate completion percentage
    const completionData = useMemo(() => {
        const fields = [
            { name: 'full_name', value: userProfile.full_name, weight: 15 },
            { name: 'email', value: userProfile.email, weight: 15 },
            { name: 'avatar_url', value: userProfile.avatar_url, weight: 20 },
            { name: 'bio', value: userProfile.bio, weight: 20 },
            { name: 'phone', value: userProfile.phone, weight: 15 },
            { name: 'school_id', value: userProfile.school_id, weight: 10 },
            { name: 'role', value: userProfile.role, weight: 5 },
        ];

        const completedFields = fields.filter(
            (field) => field.value && field.value.trim() !== ''
        );

        const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);
        const completedWeight = completedFields.reduce((sum, field) => sum + field.weight, 0);

        const percentage = Math.round((completedWeight / totalWeight) * 100);

        const missingFields = fields
            .filter((field) => !field.value || field.value.trim() === '')
            .map((field) => field.name);

        return {
            percentage,
            missingFields,
            completedCount: completedFields.length,
            totalCount: fields.length,
        };
    }, [userProfile]);

    const getCompletionMessage = (): string => {
        const { percentage } = completionData;

        if (percentage === 100) {
            return t('profileCompletion.complete') || '🎉 Profile Complete!';
        } else if (percentage >= 75) {
            return t('profileCompletion.almostThere') || 'Almost there!';
        } else if (percentage >= 50) {
            return t('profileCompletion.halfwayThere') || 'Halfway there!';
        } else if (percentage >= 25) {
            return t('profileCompletion.goodStart') || 'Good start!';
        } else {
            return t('profileCompletion.getStarted') || 'Get started!';
        }
    };

    const getCompletionColor = (): string => {
        const { percentage } = completionData;

        if (percentage === 100) {
            return Theme.colors.sageGreen;
        } else if (percentage >= 75) {
            return Theme.colors.sanctuarySaffron;
        } else if (percentage >= 50) {
            return Theme.colors.amberGlow;
        } else {
            return Theme.colors.emberRed;
        }
    };

    const getMissingFieldsText = (): string => {
        const { missingFields } = completionData;

        if (missingFields.length === 0) {
            return '';
        }

        const fieldNames = missingFields.map((field) => {
            switch (field) {
                case 'avatar_url':
                    return t('profileCompletion.field.avatar') || 'Profile Photo';
                case 'bio':
                    return t('profileCompletion.field.bio') || 'Bio';
                case 'phone':
                    return t('profileCompletion.field.phone') || 'Phone';
                case 'school_id':
                    return t('profileCompletion.field.school') || 'School';
                case 'role':
                    return t('profileCompletion.field.role') || 'Role';
                default:
                    return field;
            }
        });

        if (fieldNames.length === 1) {
            return t('profileCompletion.missing', { fields: fieldNames[0] }) ||
                `Missing: ${fieldNames[0]}`;
        } else if (fieldNames.length === 2) {
            return t('profileCompletion.missing', { fields: fieldNames.join(' and ') }) ||
                `Missing: ${fieldNames.join(' and ')}`;
        } else {
            const lastField = fieldNames.pop();
            return t('profileCompletion.missing', {
                fields: `${fieldNames.join(', ')}, and ${lastField}`,
            }) || `Missing: ${fieldNames.join(', ')}, and ${lastField}`;
        }
    };

    // Don't show if profile is complete
    if (completionData.percentage === 100) {
        return null;
    }

    return (
        <Box
            sx={{
                padding: Theme.spacing.lg,
                backgroundColor: Theme.colors.deepIndigo,
                borderRadius: Theme.corners.comfortable,
                borderLeftWidth: 4,
                borderLeftColor: getCompletionColor(),
            }}
        >
            <VStack space="md">
                {/* Header */}
                <HStack
                    sx={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <VStack sx={{ flex: 1 }}>
                        <Text
                            color={Theme.colors.sacredWhite}
                            size="lg"
                            sx={{ fontWeight: '700' }}
                        >
                            {t('profileCompletion.title') || 'Complete Your Profile'}
                        </Text>
                        <Text color={Theme.colors.mistGray} size="sm">
                            {getCompletionMessage()}
                        </Text>
                    </VStack>

                    {/* Circular Progress Indicator */}
                    <Box
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            backgroundColor: Theme.colors.voidIndigo,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 4,
                            borderColor: getCompletionColor(),
                        }}
                    >
                        <Text
                            color={getCompletionColor()}
                            sx={{
                                fontSize: 18,
                                fontWeight: '700',
                            }}
                        >
                            {completionData.percentage}%
                        </Text>
                    </Box>
                </HStack>

                {/* Progress Bar */}
                <Progress
                    value={completionData.percentage}
                    sx={{
                        height: 8,
                        backgroundColor: Theme.colors.voidIndigo,
                    }}
                >
                    <ProgressFilledTrack
                        sx={{
                            backgroundColor: getCompletionColor(),
                        }}
                    />
                </Progress>

                {/* Missing Fields Info */}
                {completionData.missingFields.length > 0 && (
                    <Text color={Theme.colors.pearlGray} size="sm">
                        {getMissingFieldsText()}
                    </Text>
                )}

                {/* Complete Profile Button */}
                {completionData.percentage < 100 && onCompleteProfile && (
                    <Button
                        sx={{
                            backgroundColor: getCompletionColor(),
                            marginTop: Theme.spacing.sm,
                        }}
                        onPress={onCompleteProfile}
                    >
                        <ButtonText color={Theme.colors.sacredWhite}>
                            {t('profileCompletion.completeButton') || '✨ Complete Profile'}
                        </ButtonText>
                    </Button>
                )}
            </VStack>
        </Box>
    );
}
