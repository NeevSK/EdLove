/**
 * SMART SHELF - Generic Horizontal Section Scroller
 *
 * A section component following the "Netflix for Learning" aesthetic:
 * - Section header with title and optional "See All" action
 * - Horizontal ScrollView for child card components
 *
 * Usage:
 *   <SmartShelf title="Featured Collections" onSeeAll={() => navigate('collections')}>
 *     {collections.map(c => <CollectionCard key={c.id} {...c} />)}
 *   </SmartShelf>
 */

import { ChevronRight } from 'lucide-react-native';
import type React from 'react';
import { StyleSheet } from 'react-native';
import { useThemedColors } from '../hooks/useThemedColors';
import { Pressable, ScrollView, Text, View } from '../primitives';
import { Theme } from '../theme/Theme';

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {onSeeAll && (
          <Pressable
            accessibilityRole="button"
            onPress={onSeeAll}
            style={styles.seeAllRow}
            hitSlop={8}
          >
            <Text style={styles.seeAllText}>See All</Text>
            <ChevronRight color={Theme.colors.sanctuarySaffron} size={16} />
          </Pressable>
        )}
      </View>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  title: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: '700',
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
    paddingVertical: Theme.spacing.xs,
  },
});

export default SmartShelf;
