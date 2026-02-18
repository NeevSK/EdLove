import React from 'react';
import { Box, VStack, Heading, Text, Button, ButtonText, Center } from '@/ui';
import { Plus, Sparkles, LogIn } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '../../constants/Theme';
import { useThemedColors } from '../../hooks/useThemedColors';
import { hapticLight } from '../../utils/haptics';

interface PositiveInvitationProps {
    title?: string;
    description?: string;
    icon?: any;
    actionLabel?: string;
    onAction?: () => void;
    type?: 'empty' | 'guest';
    context?: 'self' | 'library' | 'classroom' | 'community';
}

const PositiveInvitation: React.FC<PositiveInvitationProps> = ({
    title,
    description,
    icon: Icon = Sparkles,
    actionLabel,
    onAction,
    type = 'empty',
    context = 'self'
}) => {
    const { t } = useTranslation();
    const colors = useThemedColors();

    const getMessages = () => {
        if (type === 'guest') {
            return {
                title: t('invitation.guestTitle', 'Your sanctuary begins here'),
                desc: t('invitation.guestDesc', 'Sign in to sync your journey across all your devices.'),
                action: t('invitation.guestAction', 'Sign In / Sign Up'),
                icon: LogIn
            };
        }

        switch (context) {
            case 'library':
                return {
                    title: t('invitation.libraryEmptyTitle', 'Your personal library awaits'),
                    desc: t('invitation.libraryEmptyDesc', 'Save resources, books, and insights to build your knowledge treasury.'),
                    action: t('invitation.libraryEmptyAction', 'Explore Library'),
                    icon: Plus
                };
            case 'classroom':
                return {
                    title: t('invitation.classroomEmptyTitle', 'Connect with your students'),
                    desc: t('invitation.classroomEmptyDesc', 'Start a new session or view your active classrooms here.'),
                    action: t('invitation.classroomEmptyAction', 'Open Classroom'),
                    icon: Plus
                };
            case 'community':
                return {
                    title: t('invitation.communityEmptyTitle', 'Join the circle of wisdom'),
                    desc: t('invitation.communityEmptyDesc', 'Engage with fellow educators and share your experiences.'),
                    action: t('invitation.communityEmptyAction', 'Join Discussion'),
                    icon: Plus
                };
            default:
                return {
                    title: t('invitation.emptyTitle', 'This space is yours to create'),
                    desc: t('invitation.emptyDesc', 'Start by adding your first entry to this section.'),
                    action: t('invitation.emptyAction', 'Create Now'),
                    icon: Sparkles
                };
        }
    };

    const messages = getMessages();
    const DefaultIcon = messages.icon;

    return (
        <Center sx={{ flex: 1, padding: Theme.spacing.xl, minHeight: 250 }}>
            <VStack space="xl" alignItems="center" sx={{ maxWidth: 300 }}>
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: Theme.corners.full,
                        backgroundColor: colors.tertiary,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Icon size={32} color={colors.action} />
                </Box>

                <VStack space="xs" alignItems="center">
                    <Heading
                        size="md"
                        textAlign="center"
                        color={colors.text}
                    >
                        {title || messages.title}
                    </Heading>
                    <Text
                        size="sm"
                        textAlign="center"
                        color={colors.textSecondary}
                    >
                        {description || messages.desc}
                    </Text>
                </VStack>

                {onAction && (
                    <Button
                        size="md"
                        action="primary"
                        onPress={() => {
                            hapticLight();
                            onAction();
                        }}
                        sx={{
                            backgroundColor: colors.action,
                            borderRadius: Theme.corners.full,
                            paddingHorizontal: Theme.spacing.lg
                        }}
                    >
                        <ButtonText color={Theme.colors.white}>{actionLabel || messages.action}</ButtonText>
                    </Button>
                )}
            </VStack>
        </Center>
    );
};

export default PositiveInvitation;
