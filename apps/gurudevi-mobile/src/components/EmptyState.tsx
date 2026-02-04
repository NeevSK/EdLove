/**
 * EMPTY STATE - Reusable Empty State Component
 * 
 * A themed empty state component that supports:
 * - Icon display with lucide-react-native icons
 * - Title and description text
 * - Optional action button
 * - Centered layout within SanctuaryCard
 * 
 * Philosophy: Clear, accessible empty states that match sanctuary aesthetic
 * 
 * @example
 * ```tsx
 * import EmptyState from './components/EmptyState';
 * import { Inbox } from 'lucide-react-native';
 * 
 * function MyScreen() {
 *   return (
 *     <EmptyState
 *       icon={Inbox}
 *       title="No messages yet"
 *       description="When you receive messages, they'll appear here"
 *       actionLabel="Refresh"
 *       onAction={() => console.log('Refresh')}
 *     />
 *   );
 * }
 * ```
 */

import React, { FC } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { VStack } from '@gluestack-ui/themed';
import Theme from '../constants/Theme';
import SanctuaryCard from './SanctuaryCard';
import LotusButton from './LotusButton';

// ============================================================================
// TYPES
// ============================================================================

interface EmptyStateProps {
    icon: React.ComponentType<{ color?: string; size?: number }>; // lucide-react-native icon
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const EmptyState: FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
}) => {
    return (
        <SanctuaryCard elevated={false}>
            <VStack space="lg" style={styles.container}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                    <Icon color={Theme.colors.dimGray} size={64} />
                </View>

                {/* Title */}
                <Text style={styles.title}>{title}</Text>

                {/* Description */}
                <Text style={styles.description}>{description}</Text>

                {/* Optional Action Button */}
                {actionLabel && onAction && (
                    <LotusButton
                        title={actionLabel}
                        onPress={onAction}
                        variant="ghost"
                    />
                )}
            </VStack>
        </SanctuaryCard>
    );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Theme.spacing.lg,
    },
    iconContainer: {
        marginBottom: Theme.spacing.sm,
    },
    title: {
        fontSize: Theme.typography.fontSize.lg,
        fontWeight: Theme.typography.fontWeight.semibold,
        color: Theme.colors.sacredWhite,
        textAlign: 'center',
    },
    description: {
        fontSize: Theme.typography.fontSize.md,
        color: Theme.colors.dimGray,
        textAlign: 'center',
        paddingHorizontal: Theme.spacing.md,
    },
});

export default EmptyState;
