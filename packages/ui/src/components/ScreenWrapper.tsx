import { KeyboardAvoidingView, ScrollView, View } from '@repo/ui/components/ui/view';
import { useTheme } from '@repo/ui/hooks/useTheme';
import type React from 'react';
import { Platform, StatusBar, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePageFrame } from './layout';

export interface ScreenWrapperProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  scrollable?: boolean;
  scroll?: boolean; // When provided, overrides scrollable. Pass scroll={false} to disable scrolling even when scrollable defaults to true.
  backgroundColor?: string;
  refreshControl?: React.ReactElement<import('react-native').RefreshControlProps>;
  style?: any;
  className?: string;
  hasBottomTab?: boolean;
  noTopInset?: boolean;
}

export function useBottomTabPadding() {
  const insets = useSafeAreaInsets();
  // On web, the sidebar navigation has no bottom tab bar, so no padding is needed.
  if (Platform.OS === 'web') return 0;
  return 80 + insets.bottom;
}

export default function ScreenWrapper({
  children,
  title,
  showBack = false,
  scrollable = true,
  scroll,
  backgroundColor,
  refreshControl,
  style,
  className,
  hasBottomTab = false,
  noTopInset = false,
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();
  const { isDark, scene } = useTheme();
  const frame = usePageFrame();

  const safeAreaStyle = {
    paddingTop: noTopInset ? 0 : insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };
  const resolvedBackground = backgroundColor || scene.canvas.bg;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={resolvedBackground}
      />

      <View
        style={[styles.container, safeAreaStyle, { backgroundColor: resolvedBackground }]}
        className={className}
      >
        {(scroll ?? scrollable) ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[
              styles.contentContainer,
              { width: '100%', maxWidth: frame.maxWidth, alignSelf: 'center' },
              hasBottomTab && { paddingBottom: 80 + insets.bottom },
              style,
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}
          >
            {children}
          </ScrollView>
        ) : (
          <View
            style={[
              styles.contentContainer,
              { flex: 1, width: '100%', maxWidth: frame.maxWidth, alignSelf: 'center' },
              style,
            ]}
          >
            {children}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    // Default View
  },
});
