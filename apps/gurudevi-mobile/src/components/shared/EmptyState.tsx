import React from 'react';
import { VStack, Text, Center, Box } from '@/ui';
import { Theme } from '../../constants/Theme';
import { LucideIcon } from 'lucide-react-native';
import SanctuaryButton from './SanctuaryButton';

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
    return (
        <Center sx={{
            minHeight,
            opacity: 0.8,
            padding: Theme.spacing.xl
        }}>
            <VStack space="md" alignItems="center" maxWidth={300}>
                <Box sx={{
                    padding: Theme.spacing.lg,
                    backgroundColor: Theme.colors.midnightBlue,
                    borderRadius: Theme.corners.full,
                    marginBottom: Theme.spacing.sm
                }}>
                    <Icon size={48} color={Theme.colors.sanctuarySaffron} strokeWidth={1.5} />
                </Box>

                <Text
                    color={Theme.colors.sacredWhite}
                    fontSize="$xl"
                    fontWeight="$bold"
                    textAlign="center"
                >
                    {title}
                </Text>

                <Text
                    color={Theme.colors.pearlGray}
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
