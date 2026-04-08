import React from 'react';
import { Box, VStack, Heading, Text, Center } from '../gluestack';
import { Plus, Sparkles, LogIn } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import SanctuaryButton from './SanctuaryButton';
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
        <Center className="flex-1 p-8 min-h-[250px]">
            <VStack className="items-center max-w-[300px] gap-6">

                <Box className="w-16 h-16 rounded-full bg-phase-accent/10 justify-center items-center">
                    {isValidComponent ? (
                        <Icon size={32} className="text-phase-accent" />
                    ) : (
                        <Sparkles size={32} className="text-phase-accent" />
                    )}
                </Box>

                <VStack className="items-center gap-1">
                    <Heading 
                        className="text-lg text-center text-phase-text-primary"
                    >
                        {title || messages.title}
                    </Heading>
                    <Text 
                        className="text-sm text-center text-phase-text-secondary leading-relaxed"
                    >
                        {description || messages.desc}
                    </Text>
                </VStack>

                {onAction && (
                    <SanctuaryButton
                        action="primary"
                        onPress={() => {
                            hapticLight();
                            onAction();
                        }}
                        className="px-8"
                    >
                        {actionLabel || messages.action}
                    </SanctuaryButton>
                )}
            </VStack>
        </Center>
    );
};

export default PositiveInvitation;

