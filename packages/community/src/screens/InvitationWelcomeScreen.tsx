import React from 'react';
import {
    VStack,
    Heading,
    Text,
    Button,
    ButtonText,
    Box,
    useToast,
    Toast,
    ToastTitle,
    ToastDescription,
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
    const toast = useToast();
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
                    toast.show({
                        placement: 'top',
                        render: ({ id }: any) => (
                            <Toast nativeID={id} action="error" variant="solid">
                                <VStack className="gap-1">
                                    <ToastTitle>{t('invitationWelcome.joinFailed') || 'Join Failed'}</ToastTitle>
                                    <ToastDescription>
                                        {t('invitationWelcome.joinFailedDesc') || 'Unable to update your profile. Please try again.'}
                                    </ToastDescription>
                                </VStack>
                            </Toast>
                        ),
                    });
                    return;
                }
            }

            navigation.navigate('Main');
        } catch (error) {
            console.error('Error joining sanctuary:', error);
            toast.show({
                placement: 'top',
                render: ({ id }: any) => (
                    <Toast nativeID={id} action="error" variant="solid">
                        <VStack className="gap-1">
                            <ToastTitle>{t('invitationWelcome.errorTitle') || 'Error'}</ToastTitle>
                            <ToastDescription>
                                {t('invitationWelcome.errorDesc') || 'Something went wrong. Please contact support.'}
                            </ToastDescription>
                        </VStack>
                    </Toast>
                ),
            });
        }
    };

    return (
        <ScreenWrapper scroll={false}>
            <Box 
                className="flex-1 bg-background justify-center p-8"
            >
                <VStack className="gap-6 items-center">
                    <Text 
                        className="text-primary-500 text-xl font-bold"
                    >
                        {t('invitationWelcome.invited') || "You've been invited!"}
                    </Text>
                    <Heading 
                        className="text-[32px] text-foreground text-center"
                    >
                        {t('invitationWelcome.welcomeTo', { schoolName })}
                    </Heading>
                    
                    <Box 
                        className="bg-surface-low p-4 rounded-comfortable w-full border border-outline-variant"
                    >
                        <Text className="text-muted-foreground text-center">
                            {t('invitationWelcome.role') || 'Role'}: {' '}
                            <Text className="text-foreground font-bold">
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                            </Text>
                        </Text>
                    </Box>

                    <Button
                        size="xl"
                        variant="solid"
                        action="primary"
                        className="bg-primary-500 w-full rounded-comfortable"
                        onPress={handleJoin}
                    >
                        <ButtonText className="text-primary-foreground font-bold">
                            {t('invitationWelcome.joinButton') || 'Join Sanctuary'}
                        </ButtonText>
                    </Button>
                </VStack>
            </Box>
        </ScreenWrapper>
    );
}
