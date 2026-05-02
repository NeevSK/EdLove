import type React from 'react';
import { StyleSheet } from 'react-native';
import { ScrollView, View } from '../primitives';
import { useTheme } from '../hooks/useTheme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  scrollable?: boolean;
  scroll?: boolean;
  backgroundColor?: string;
  refreshControl?: React.ReactElement<import('react-native').RefreshControlProps>;
  style?: any;
  hasBottomTab?: boolean;
  noTopInset?: boolean;
}

export function useBottomTabPadding() {
  // On web, we use a sidebar, so bottom padding for a tab bar is unnecessary.
  return 0;
}

/**
 * ScreenWrapper.web.tsx - High-fidelity web implementation
 *
 * Unlike the native version, this implementation:
 * 1. Restores native browser scrollbars (showsVerticalScrollIndicator={true}).
 * 2. Removes KeyboardAvoidingView overhead which is unnecessary on desktop.
 * 3. Optimizes scroll behavior for mouse/touchpad interaction.
 */
export default function ScreenWrapper({
  children,
  scrollable = true,
  scroll,
  backgroundColor,
  style,
  refreshControl,
}: ScreenWrapperProps) {
  const { scene } = useTheme();

  const isScrollable = scroll ?? scrollable;
  const resolvedBackground = backgroundColor || scene.canvas.bg;

  return (
    <View style={[styles.container, { backgroundColor: resolvedBackground }]}>
      {isScrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.contentContainer, style]}
          // High-fidelity fix: show scrollbars on web for better spatial awareness (System 2 resonance)
          showsVerticalScrollIndicator={true}
          refreshControl={refreshControl}
          scrollEventThrottle={16}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.contentContainer, styles.flex1, style]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  flex1: {
    flex: 1,
  },
});
