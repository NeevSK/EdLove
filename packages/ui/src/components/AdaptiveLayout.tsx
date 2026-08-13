import { responsiveLayout } from '@repo/ui/components/layout';
import { useResponsive } from '@repo/ui/hooks/useResponsive';
import { useThemedColors } from '@repo/ui/hooks/useThemedColors';
import { ScrollView, View } from '@repo/ui/primitives';
import type React from 'react';
import { StyleSheet } from 'react-native';

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
  sidebarWidth = responsiveLayout.defaultSidebarWidth,
  breakpoint = 768,
  scrollable = true,
}: AdaptiveLayoutProps) => {
  const { width, isTablet, isLandscape } = useResponsive();
  const colors = useThemedColors();
  const usesTabletLayout = isTablet && width >= breakpoint;
  const resolvedSidebarWidth = isLandscape
    ? Math.min(sidebarWidth, responsiveLayout.landscapeSidebarMaxWidth)
    : sidebarWidth;

  if (usesTabletLayout && renderSidebar && renderContent) {
    return (
      <View style={styles.tabletContainer}>
        <View
          style={[
            styles.sidebarColumn,
            { width: resolvedSidebarWidth, borderRightColor: colors.border },
          ]}
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
    width: '100%',
    minHeight: 0,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  sidebarColumn: {
    height: '100%',
    minWidth: 0,
    flexShrink: 0,
    borderRightWidth: 1,
  },
  contentColumn: {
    flex: 1,
    height: '100%',
    minWidth: 0,
    flexShrink: 1,
  },
});
