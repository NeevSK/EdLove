import type React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { ScrollView, View } from '../primitives';
import { useThemedColors } from '../hooks/useThemedColors';

interface AdaptiveLayoutProps {
  /**
   * Fallback content for mobile/single-column layouts.
   */
  children?: React.ReactNode;
  /**
   * Component/Function to render in the left column (sidebar) on tablets.
   */
  renderSidebar?: () => React.ReactNode;
  /**
   * Component/Function to render in the right column (content) on tablets.
   */
  renderContent?: () => React.ReactNode;
  /**
   * Fixed width for the sidebar on tablets. Defaults to 320.
   */
  sidebarWidth?: number;
  /**
   * Breakpoint for tablet layout. Defaults to 768.
   */
  breakpoint?: number;
  /**
   * Whether the columns should be separately scrollable. Defaults to true.
   */
  scrollable?: boolean;
}

/**
 * AdaptiveLayout Component
 *
 * Automatically switches between 1-column mobile and 2-column tablet layouts.
 */
export const AdaptiveLayout = ({
  children,
  renderSidebar,
  renderContent,
  sidebarWidth = 320,
  breakpoint = 768,
  scrollable = true,
}: AdaptiveLayoutProps) => {
  const { width } = useWindowDimensions();
  const colors = useThemedColors();
  const isTablet = width >= breakpoint;

  if (isTablet && renderSidebar && renderContent) {
    return (
      <View style={styles.tabletContainer}>
        <View
          style={[styles.sidebarColumn, { width: sidebarWidth, borderRightColor: colors.border }]}
        >
          {scrollable ? (
            <ScrollView showsVerticalScrollIndicator={false}>{renderSidebar()}</ScrollView>
          ) : (
            renderSidebar()
          )}
        </View>
        <View style={styles.contentColumn}>
          {scrollable ? (
            <ScrollView showsVerticalScrollIndicator={false}>{renderContent()}</ScrollView>
          ) : (
            renderContent()
          )}
        </View>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  tabletContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  sidebarColumn: {
    height: '100%',
    borderRightWidth: 1,
  },
  contentColumn: {
    flex: 1,
    height: '100%',
  },
});
