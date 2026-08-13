import type React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '@repo/ui/hooks/useTheme';
import { ScrollView, View } from '@repo/ui/primitives';
import { usePageFrame } from './layout';

export interface ScreenWrapperProps {
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
  className?: string;
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
  title,
  scrollable = true,
  scroll,
  backgroundColor,
  style,
  refreshControl,
  className,
}: ScreenWrapperProps) {
  const { scene } = useTheme();
  const frame = usePageFrame();

  const isScrollable = scroll ?? scrollable;
  const resolvedBackground = backgroundColor || scene.canvas.bg;

  return (
    <View
      role="main"
      aria-label={title}
      className={className}
      style={[styles.container, { backgroundColor: resolvedBackground }]}
    >
      {isScrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.contentContainer, {
            maxWidth: frame.maxWidth,
            paddingHorizontal: frame.gutter,
          }, style]}
          // High-fidelity fix: show scrollbars on web for better spatial awareness (System 2 resonance)
          showsVerticalScrollIndicator={true}
          refreshControl={refreshControl}
          scrollEventThrottle={16}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.contentContainer,
            styles.flex1,
            { maxWidth: frame.maxWidth, paddingHorizontal: frame.gutter },
            style,
          ]}
        >
          {children}
        </View>
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
    width: '100%',
    alignSelf: 'center',
  },
  flex1: {
    flex: 1,
  },
});
