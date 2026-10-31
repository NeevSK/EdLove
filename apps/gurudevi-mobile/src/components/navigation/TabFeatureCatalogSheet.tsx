import { PERSONAL_SCOPE_PERSPECTIVE, useScopeSessionStore } from '@repo/core/store/scopeSession';
import { useActiveSubTabsStore } from '@repo/core/store/useActiveSubTabsStore';
import { Badge, Launcher, Sheet, Text } from '@repo/ui/components/native';
import { useRouter } from 'expo-router';
import type React from 'react';
import { useMemo } from 'react';
import { View } from 'react-native';
import {
  getDomainFeatureRegistry,
  type MobileDomainRegistry,
  type MobileFeatureItem,
} from '@/navigation/registries';

export interface TabFeatureCatalogSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeTabKey: 'self' | 'workspace' | 'library' | 'community' | 'profile';
}

/**
 * TabFeatureCatalogSheet: Dynamic, role-aware feature catalog for mobile domains.
 *
 * Accessible via long-pressing any bottom tab or tapping the '+' button on the
 * ActiveSubTabStrip. Opens items directly into active sub-tabs by default.
 * Drawn by the kit: a `Sheet` holding a `Launcher` (search, kinds, tiles);
 * a long press on a tile keeps it in the task strip without leaving.
 */
export const TabFeatureCatalogSheet: React.FC<TabFeatureCatalogSheetProps> = ({
  isOpen,
  onClose,
  activeTabKey,
}) => {
  const router = useRouter();

  const scopeSnapshot = useScopeSessionStore((s) => s.snapshot);
  const scopeTransitioning = useScopeSessionStore((s) => s.isTransitioning);
  const activePerspective = scopeSnapshot?.activePerspective ?? PERSONAL_SCOPE_PERSPECTIVE;
  const openTab = useActiveSubTabsStore((s) => s.openTab);
  const preferences = useActiveSubTabsStore((s) => s.preferences);
  const openTabs = useActiveSubTabsStore((s) => s.tabsByDomain[activeTabKey]);

  // Derive role capacity from perspective
  const capacity = useMemo(() => {
    if (scopeTransitioning) return null;
    if (scopeSnapshot?.activeBond) return scopeSnapshot.activeBond.capacity;
    return activePerspective.kind === 'personal' ? 'personal' : null;
  }, [activePerspective.kind, scopeSnapshot?.activeBond, scopeTransitioning]);

  // Resolve dynamic registry for active domain and capacity
  const registry: MobileDomainRegistry = useMemo(() => {
    return getDomainFeatureRegistry(activeTabKey, capacity);
  }, [activeTabKey, capacity]);

  const byId = useMemo(
    () => new Map(registry.items.map((item) => [item.id, item])),
    [registry.items],
  );

  const keepInTabs = (item: MobileFeatureItem) =>
    openTab({
      id: item.id,
      title: item.title,
      route: item.route,
      params: item.params,
      domain: activeTabKey,
    });

  // Primary action: Default is to open into active sub-tab and navigate
  const handleSelectFeature = (item: MobileFeatureItem) => {
    if (preferences.catalogDefaultAction === 'open_in_subtab') keepInTabs(item);
    onClose();
    router.push({
      pathname: item.route,
      params: item.params,
    } as Parameters<typeof router.push>[0]);
  };

  return (
    <Sheet open={isOpen} onClose={onClose} title={registry.title}>
      <View style={{ gap: 4, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
        <Text kind="caption" tone="soft" style={{ flexShrink: 1 }}>
          {registry.subtitle}
        </Text>
        {registry.roleBadge ? <Badge label={registry.roleBadge} tone="lamp" /> : null}
      </View>
      <Launcher
        label={registry.title}
        items={registry.items.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          icon: item.icon,
          badge: item.badge,
          group: item.category,
        }))}
        // Tasks already in the strip are the ones the person keeps coming back to.
        recent={(openTabs ?? []).map((t) => t.id).filter((id) => byId.has(id))}
        onOpen={(id) => {
          const item = byId.get(id);
          if (item) handleSelectFeature(item);
        }}
        onKeep={(id) => {
          const item = byId.get(id);
          if (item) keepInTabs(item);
        }}
      />
    </Sheet>
  );
};
