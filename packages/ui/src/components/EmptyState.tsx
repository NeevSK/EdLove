import React from 'react';
import { VStack, Text, Center, Box } from '../gluestack';
import { Theme } from '../theme/Theme';
import { useTheme } from '../hooks/useTheme';
import SanctuaryButton from './SanctuaryButton';
import { LucideIcon } from 'lucide-react-native';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    minHeight?: number;
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    minHeight = 300
}: EmptyStateProps) {
    const { scene, text, accent } = useTheme();

    return (
        <Center sx={{
            minHeight,
            opacity: 1.0,
            padding: Theme.spacing.xl
        }}>
            <VStack space="md" alignItems="center" maxWidth={300}>
                <Box sx={{
                    padding: Theme.spacing.lg,
                    backgroundColor: scene.interactive.bg,
                    borderColor: scene.interactive.border,
                    borderWidth: 1,
                    borderRadius: Theme.corners.full,
                    marginBottom: Theme.spacing.sm
                }}>
                    <Icon size={48} color={accent.action} strokeWidth={1.5} />
                </Box>

                <Text
                    color={text.onCanvas}
                    fontSize="$xl"
                    fontWeight="$bold"
                    textAlign="center"
                >
                    {title}
                </Text>

                <Text
                    color={text.secondary}
                    textAlign="center"
                    fontSize="$md"
                    sx={{ lineHeight: 24 }}
                >
                    {description}
                </Text>

                {actionLabel && onAction && (
                    <Box mt="$4">
                        <SanctuaryButton
                            onPress={onAction}
                            size="md"
                            variant="outline"
                        >
                            {actionLabel}
                        </SanctuaryButton>
                    </Box>
                )}
            </VStack>
        </Center>
    );
}
