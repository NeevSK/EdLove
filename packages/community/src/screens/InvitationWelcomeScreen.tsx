import React from 'react';
import {
    VStack,
    Heading,
    Text,
    Button,
    ButtonText,
    Box,
    useSanctuaryToast,
    ScreenWrapper
} from '@repo/ui';
import { supabase, identityAPI } from '@repo/core';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

interface InvitationWelcomeScreenProps {
    route?: {
        params: {
            role: string;
            schoolName: string;
        };
    };
}

export default function InvitationWelcomeScreen({ route }: InvitationWelcomeScreenProps) {
    const navigation = useNavigation<any>();
    const { showToast } = useSanctuaryToast();
    const { t } = useTranslation();
    const role = route?.params?.role || 'User';
    const schoolName = route?.params?.schoolName || 'the Sanctuary';

    const handleJoin = async () => {
        try {
            const userId = await identityAPI.getMyInternalId();

            if (userId) {
                const { error } = await supabase
                    .from('users')
                    .update({
                        role: role.toLowerCase(),
                        organization_name: schoolName,
                        onboarding_completed: true,
                        onboarding_completed_at: new Date().toISOString()
                    })
                    .eq('id', userId);

                if (error) {
                    console.error('Database update error:', error);
                    showToast({
                        message: t('invitationWelcome.joinFailedDesc') || 'Unable to update your profile. Please try again.',
                        type: 'error'
                    });
                    return;
                }
            }

            navigation.navigate('Main');
        } catch (error) {
            console.error('Error joining sanctuary:', error);
            showToast({
                message: t('invitationWelcome.errorDesc') || 'Something went wrong. Please contact support.',
                type: 'error'
            });
        }
    };

    return (
        <ScreenWrapper scroll={false} className="bg-phase-canvas">
            <Box 
                className="flex-1 justify-center p-8"
            >
                <VStack className="gap-8 items-center">
                    <Text 
                        className="text-phase-interactive text-xl font-bold uppercase tracking-wider"
                    >
                        {t('invitationWelcome.invited') || "You've been invited!"}
                    </Text>
                    <Heading 
                        className="text-4xl text-ink text-center font-bold"
                    >
                        {t('invitationWelcome.welcomeTo', { schoolName })}
                    </Heading>
                    
                    <Box 
                        className="bg-phase-surface p-6 rounded-2xl w-full border border-border mt-4"
                    >
                        <Text className="text-ink/60 text-center text-lg">
                            {t('invitationWelcome.role') || 'Your Role'}: {' '}
                            <Text className="text-ink font-bold">
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                            </Text>
                        </Text>
                    </Box>

                    <Button
                        className="bg-phase-interactive w-full h-14 rounded-2xl mt-4 active:opacity-90 shadow-lg"
                        onPress={handleJoin}
                    >
                        <ButtonText className="text-inverted text-lg font-bold">
                            {t('invitationWelcome.joinButton') || 'Accept Invitation'}
                        </ButtonText>
                    </Button>
                </VStack>
            </Box>
        </ScreenWrapper>
    );
}
