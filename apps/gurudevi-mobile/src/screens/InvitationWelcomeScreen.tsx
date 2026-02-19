import { VStack, Heading, Text, Button, ButtonText, Box, useToast, Toast, ToastTitle, ToastDescription } from '@repo/ui';
import { useThemedColors, Theme } from '@repo/ui';
import { supabase } from '@repo/core';
import { useNavigation } from '@react-navigation/native';

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
    const role = route?.params?.role || 'User';
    const schoolName = route?.params?.schoolName || 'the Sanctuary';

    const handleJoin = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                // In a real app, we would update the user's role in the database
                const { error } = await supabase
                    .from('users')
                    .update({
                        role: role.toLowerCase(),
                        organization_name: schoolName,
                        onboarding_completed: true,
                        onboarding_completed_at: new Date().toISOString()
                    })
                    .eq('id', session.user.id);

                if (error) {
                    console.error('Database update error:', error);
                    toast.show({
                        placement: 'top',
                        render: ({ id }) => (
                            <Toast nativeID={id} action="error" variant="solid">
                                <ToastTitle>Failed to join</ToastTitle>
                                <ToastDescription>
                                    Unable to update your profile. Please try again.
                                </ToastDescription>
                            </Toast>
                        ),
                    });
                    return;
                }
            }

            // Navigate to Main screen on success (or if no session for demo)
            console.log('Successfully joined:', role, 'at', schoolName);
            navigation.navigate('Main');
        } catch (error) {
            console.error('Error joining sanctuary:', error);
            toast.show({
                placement: 'top',
                render: ({ id }) => (
                    <Toast nativeID={id} action="error" variant="solid">
                        <ToastTitle>Error</ToastTitle>
                        <ToastDescription>
                            An unexpected error occurred. Please try again.
                        </ToastDescription>
                    </Toast>
                ),
            });
        }
    };

    return (
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo, justifyContent: 'center', padding: Theme.spacing.xl }}>
            <VStack space="xl" alignItems="center">
                <Text color={Theme.colors.sanctuarySaffron} size="xl" bold>
                    You have been invited
                </Text>
                <Heading size="2xl" color={Theme.colors.sacredWhite} textAlign="center">
                    Welcome to {schoolName}
                </Heading>
                <Box sx={{ backgroundColor: Theme.colors.deepIndigo, padding: Theme.spacing.md, borderRadius: Theme.corners.comfortable }}>
                    <Text color={Theme.colors.mistGray}>
                        Role: <Text color={Theme.colors.sacredWhite} bold>{role.charAt(0).toUpperCase() + role.slice(1)}</Text>
                    </Text>
                </Box>
                <Button
                    size="lg"
                    variant="solid"
                    action="primary"
                    sx={{ backgroundColor: Theme.colors.sanctuarySaffron, width: '100%' }}
                    onPress={handleJoin}
                >
                    <ButtonText color={Theme.colors.voidIndigo} bold>
                        Join the Sanctuary
                    </ButtonText>
                </Button>
            </VStack>
        </Box>
    );
}
