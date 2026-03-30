/**
 * SMART SHELF - Generic Horizontal Section Scroller
 *
 * A section component following the "Netflix for Learning" aesthetic:
 * - Section header with title and optional "See All" action
 * - Horizontal ScrollView for child card components
 *
 * Usage:
 *   <SmartShelf title="Featured Collections" onSeeAll={() => navigate('collections')}
 *     {collections.map(c => <CollectionCard key={c.id} {...c} />)}
 *   </SmartShelf
 */

import React from 'react';
import {
    View,
    ScrollView,
    Text,
    Pressable,
    StyleSheet,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Theme } from '../theme/Theme';
import { useThemedColors } from '../hooks/useThemedColors';

// ============================================================================
// TYPES
// ============================================================================

export interface SmartShelfProps {
    title: string;
    children: React.ReactNode;
    onSeeAll?: () => void;
    /** Horizontal padding for the scroll area. Defaults to Theme.spacing.md */
    horizontalPadding?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SmartShelf({
    title,
    children,
    onSeeAll,
    horizontalPadding = Theme.spacing.md,
}: SmartShelfProps) {
    const colors = useThemedColors();

    const styles = StyleSheet.create({
        container: {
            marginBottom: Theme.spacing.lg,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: horizontalPadding,
            marginBottom: Theme.spacing.sm,
        },
        title: {
            fontSize: Theme.typography.fontSize.md,
            fontWeight: '700',
            color: colors.text,
            letterSpacing: 0.2,
        },
        seeAllRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
        },
        seeAllText: {
            fontSize: Theme.typography.fontSize.sm,
            color: Theme.colors.sanctuarySaffron,
            fontWeight: '600',
        },
        scrollContent: {
            paddingHorizontal: horizontalPadding,
            paddingVertical: Theme.spacing.xs,
        },
    });

    return (
        <View style={styles.container}
            {/* Header */}
            <View style={styles.header}
                <Text style={styles.title}>{title}</Text
                {onSeeAll && (
                    <Pressable accessibilityRole="button" onPress={onSeeAll} style={styles.seeAllRow} hitSlop={8}
                        <Text style={styles.seeAllText}>See All</Text
                        <ChevronRight
                            color={Theme.colors.sanctuarySaffron}
                            size={16}
                        /
                    </Pressable
                )}
            </View

            {/* Horizontal Scroll */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            
                {children}
            </ScrollView
        </View
    );
}

export default SmartShelf;
