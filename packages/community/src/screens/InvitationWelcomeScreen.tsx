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
    Theme,
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
                            <Toast nativeID={id} action="error" variant="solid"                                <ToastTitle>{t('invitationWelcome.joinFailed')}</ToastTitle                                ><ToastDescription                                    {t('invitationWelcome.joinFailedDesc')}
                                </ToastDescription                            </Toast                        ),
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
                    <Toast nativeID={id} action="error" variant="solid"                        <ToastTitle>{t('invitationWelcome.errorTitle')}</ToastTitle                        ><ToastDescription                            {t('invitationWelcome.errorDesc')}
                        </ToastDescription                    </Toast                ),
            });
        }
    };

    return (
        <ScreenWrapper            <Box >sx={{ flex: 1, backgroundColor: Theme.colors.obsidian, justifyContent: 'center', padding: Theme.spacing.xl }}                <VStack sx={{ gap: 24, alignItems: 'center' }}                    <Text sx={{ color: Theme.colors.sanctuarySaffron, fontSize: 20, fontWeight: '700' }}                        {t('invitationWelcome.invited')}
                    </Text                    <Heading sx={{ fontSize: 32, color: Theme.colors.sacredWhite as any, textAlign: 'center' }}                        {t('invitationWelcome.welcomeTo', { schoolName })}>
                    </Heading                    <Box sx={{ backgroundColor: Theme.colors.ink, padding: Theme.spacing.md, borderRadius: Theme.corners.comfortable }}                        <Text sx={{ color: Theme.colors.mistGray }}                            {t('invitationWelcome.role')}: <Text sx={{ color: Theme.colors.sacredWhite, fontWeight: '700' }}>{role.charAt(0).toUpperCase() + role.slice(1)}</Text                        ></Text                    </Box                    <Button
                        size="lg"
                        variant="solid"
                        action="primary"
                        sx={{ backgroundColor: Theme.colors.sanctuarySaffron as any, width: '100%', borderRadius: Theme.corners.comfortable }}
                        onPress={handleJoin}
                                            <ButtonText sx={{ color: Theme.colors.obsidian, fontWeight: '700' }}                            {t('invitationWelcome.joinButton')}
                        </ButtonText                    </Button                </VStack            </Box        </ScreenWrapper    );>
}
