import {
  type ActiveSubTabDomain,
  type ActiveSubTabItem,
  useActiveSubTabsStore,
} from '@repo/core/store/useActiveSubTabsStore';
import { Plus, X } from '@repo/ui/icons';
import { Box, Pressable, ScrollView, Text } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { hapticLight, hapticSelection } from '@repo/ui/utils/haptics';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';

export interface ActiveSubTabStripProps {
  domain: ActiveSubTabDomain;
  onAddTabPress?: () => void;
  /** The owning domain route decides where its overview floor lives. */
  onReturnToOverview?: () => void;
}

/**
 * ActiveSubTabStrip: Sovereign, mobile-first horizontal sub-tab strip.
 *
 * Displays currently running tasks/activities within a domain (e.g. Attendance,
 * Gradebook, Reflection, Student Detail) so users can rapidly switch context without
 * losing their place.
 */
export const ActiveSubTabStrip: React.FC<ActiveSubTabStripProps> = ({
  domain,
  onAddTabPress,
  onReturnToOverview,
}) => {
  const router = useRouter();
  const tabs = useActiveSubTabsStore((s) => s.tabsByDomain[domain] || []);
  const activeTabId = useActiveSubTabsStore((s) => s.activeTabByDomain[domain] || '');
  const showActiveSubTabs = useActiveSubTabsStore((s) => s.preferences.showActiveSubTabs);
  const setActiveTab = useActiveSubTabsStore((s) => s.setActiveTab);
  const closeTab = useActiveSubTabsStore((s) => s.closeTab);

  const handleSelectTab = useCallback(
    (tab: ActiveSubTabItem) => {
      hapticSelection();
      setActiveTab(domain, tab.id);
      router.push({
        pathname: tab.route,
        params: tab.params,
      } as Parameters<typeof router.push>[0]);
    },
    [domain, router, setActiveTab],
  );

  const handleCloseTab = useCallback(
    (tabId: string, e?: unknown) => {
      if (
        e &&
        typeof e === 'object' &&
        'stopPropagation' in e &&
        typeof (e as { stopPropagation: () => void }).stopPropagation === 'function'
      ) {
        (e as { stopPropagation: () => void }).stopPropagation();
      }
      hapticLight();
      const result = closeTab(domain, tabId);
      if (result.kind === 'overview') {
        onReturnToOverview?.();
      } else if (result.kind === 'focused-task' && activeTabId === tabId) {
        const next = result.nextTask;
        router.push({
          pathname: next.route,
          params: next.params,
        } as Parameters<typeof router.push>[0]);
      }
    },
    [activeTabId, closeTab, domain, onReturnToOverview, router],
  );

  if (!showActiveSubTabs || (tabs.length === 0 && !onAddTabPress)) {
    return null;
  }

  return (
    <Box
      style={{
        backgroundColor: tokens.semantic.surface.canvas,
        borderBottomWidth: 1,
        borderBottomColor: tokens.semantic.border.subtle,
        paddingHorizontal: tokens.spacing.sm,
        paddingVertical: 6,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center', gap: tokens.spacing.xs }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${tab.title} active task tab`}
              onPress={() => handleSelectTab(tab)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isActive
                  ? tokens.semantic.surface.elevated
                  : tokens.semantic.surface.interactive,
                borderWidth: 1,
                borderColor: isActive ? tokens.colors.primary : tokens.semantic.border.subtle,
                borderRadius: tokens.radii.full,
                paddingVertical: 5,
                paddingLeft: tokens.spacing.md,
                paddingRight: 6,
                gap: 6,
              }}
            >
              {/* Active Indicator dot */}
              {isActive ? (
                <Box
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: tokens.colors.primary,
                  }}
                />
              ) : null}

              <Text
                style={{
                  fontSize: tokens.typography.sizes.xs,
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? tokens.semantic.text.primary : tokens.semantic.text.secondary,
                }}
                numberOfLines={1}
              >
                {tab.title}
              </Text>

              {/* Close Tab Button */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Close ${tab.title} tab`}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={(e) => handleCloseTab(tab.id, e)}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isActive ? tokens.semantic.surface.interactive : 'transparent',
                }}
              >
                <X
                  size={11}
                  color={isActive ? tokens.semantic.text.primary : tokens.semantic.text.muted}
                />
              </Pressable>
            </Pressable>
          );
        })}

        {/* Plus / Add Sub-Tab Button */}
        {onAddTabPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open feature catalog to add sub-tab"
            accessibilityHint="Presents available surfaces for this domain"
            onPress={() => {
              hapticLight();
              onAddTabPress();
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: tokens.semantic.surface.interactive,
              borderRadius: tokens.radii.full,
              paddingVertical: 5,
              paddingHorizontal: tokens.spacing.sm,
              gap: 4,
              borderWidth: 1,
              borderColor: tokens.semantic.border.subtle,
              borderStyle: 'dashed',
            }}
          >
            <Plus size={13} color={tokens.semantic.text.secondary} />
            {tabs.length === 0 ? (
              <Text
                style={{
                  fontSize: tokens.typography.sizes.xs,
                  color: tokens.semantic.text.secondary,
                  fontWeight: '600',
                }}
              >
                Add Task
              </Text>
            ) : null}
          </Pressable>
        ) : null}
      </ScrollView>
    </Box>
  );
};
