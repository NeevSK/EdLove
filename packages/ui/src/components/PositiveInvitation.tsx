import React from 'react';
import { Box, VStack, Heading, Text, Button, ButtonText, Center } from '../gluestack';
import { Plus, Sparkles, LogIn } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '../theme/Theme';
import { useTheme } from '../hooks/useTheme';
import { useThemedColors } from '../hooks/useThemedColors';
import { hapticLight } from '../utils/haptics';

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
    icon: iconProp,
    actionLabel,
    onAction,
    type = 'empty',
    context = 'self'
}) => {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const { textOnAccent } = useTheme();

    const getMessages = () => {
        if (type === 'guest') {
            return {
                title: t('invitation.guestTitle'),
                desc: t('invitation.guestDesc'),
                action: t('invitation.guestAction'),
                icon: LogIn
            };
        }

        switch (context) {
            case 'library':
                return {
                    title: t('invitation.libraryEmptyTitle'),
                    desc: t('invitation.libraryEmptyDesc'),
                    action: t('invitation.libraryEmptyAction'),
                    icon: Plus
                };
            case 'classroom':
                return {
                    title: t('invitation.classroomEmptyTitle'),
                    desc: t('invitation.classroomEmptyDesc'),
                    action: t('invitation.classroomEmptyAction'),
                    icon: Plus
                };
            case 'community':
                return {
                    title: t('invitation.communityEmptyTitle'),
                    desc: t('invitation.communityEmptyDesc'),
                    action: t('invitation.communityEmptyAction'),
                    icon: Plus
                };
            default:
                return {
                    title: t('invitation.emptyTitle'),
                    desc: t('invitation.emptyDesc'),
                    action: t('invitation.emptyAction'),
                    icon: Sparkles
                };
        }
    };

    const messages = getMessages();
    
    // Safety check for Icon component to prevent "Component is not a constructor" crash
    const Icon = iconProp || messages.icon || Sparkles;
    const isValidComponent = typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null);

    return (
        <Center sx={{ flex: 1, padding: Theme.spacing.xl, minHeight: 250 }}>
            <VStack alignItems="center" sx={{ maxWidth: 300, gap: Theme.spacing.xl }}>

                <Box>
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: Theme.corners.full,
                        backgroundColor: colors.tertiary,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                
                    {isValidComponent ? (
                        <Icon size={32} color={colors.action} />
                    ) : (
                        <Sparkles size={32} color={colors.action} />
                    )}
                </Box>

                <VStack alignItems="center" sx={{ gap: Theme.spacing.xs }}>
                    <Heading>
                        size="md"
                        textAlign="center"
                        color={colors.text}
                    
                        {title || messages.title}
                    </Heading>
                    <Text>
                        sx={{ fontSize: 14 }}
                        textAlign="center"
                        color={colors.textSecondary}
                    
                        {description || messages.desc}
                    </Text>
                </VStack>

                {onAction && (
                    <Button>
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
                    
                        <ButtonText color={textOnAccent}>{actionLabel || messages.action}</ButtonText
                    ></Button>
                )}
            </VStack>
        </Center>
    );
};

export default PositiveInvitation;

