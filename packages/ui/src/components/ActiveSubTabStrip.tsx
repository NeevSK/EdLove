import {
  type ActiveSubTabDomain,
  type ActiveSubTabItem,
  useActiveSubTabsStore,
} from '@repo/core/store/useActiveSubTabsStore';
import { TaskTabs } from '@repo/ui/components/native';
import { usePathname, useRouter } from 'expo-router';
import type React from 'react';
import { useCallback } from 'react';

const EMPTY_TABS: ActiveSubTabItem[] = [];

export interface ActiveSubTabStripProps {
  domain: ActiveSubTabDomain;
  /** The owning domain route decides where its overview floor lives. */
  onReturnToOverview?: () => void;
}

/**
 * Home stays fixed; active tasks can be reordered without keeping their screens
 * mounted. The strip's store and routes live here; the kit's TaskTabs draws it.
 */
export const ActiveSubTabStrip: React.FC<ActiveSubTabStripProps> = ({ domain, onReturnToOverview }) => {
  const router = useRouter();
  const pathname = usePathname();
  const tabs = useActiveSubTabsStore((state) => state.tabsByDomain[domain] ?? EMPTY_TABS);
  const activeTabId = useActiveSubTabsStore((state) => state.activeTabByDomain[domain] || '');
  const showActiveSubTabs = useActiveSubTabsStore((state) => state.preferences.showActiveSubTabs);
  const setActiveTab = useActiveSubTabsStore((state) => state.setActiveTab);
  const closeTab = useActiveSubTabsStore((state) => state.closeTab);
  const reorderTab = useActiveSubTabsStore((state) => state.reorderTab);

  const open = useCallback(
    (tab: ActiveSubTabItem) =>
      router.push({ pathname: tab.route, params: tab.params } as Parameters<typeof router.push>[0]),
    [router],
  );

  const handleSelect = useCallback(
    (id: string) => {
      const tab = tabs.find((t) => t.id === id);
      if (!tab) return;
      setActiveTab(domain, id);
      open(tab);
    },
    [domain, open, setActiveTab, tabs],
  );

  const handleClose = useCallback(
    (id: string) => {
      const result = closeTab(domain, id);
      if (result.kind === 'overview') onReturnToOverview?.();
      else if (result.kind === 'focused-task' && activeTabId === id) open(result.nextTask);
    },
    [activeTabId, closeTab, domain, onReturnToOverview, open],
  );

  if (!showActiveSubTabs || tabs.length === 0) return null;

  const atHome = pathname === `/${domain}`;
  return (
    <TaskTabs
      label={`Open ${domain} tasks`}
      home={
        onReturnToOverview
          ? { label: atHome ? 'Home' : 'Open Home', selected: atHome, onPress: onReturnToOverview }
          : undefined
      }
      tabs={tabs.map((t) => ({ id: t.id, title: t.title }))}
      activeId={activeTabId || null}
      onSelect={handleSelect}
      onClose={handleClose}
      onReorder={(id, to) => reorderTab(domain, id, to)}
    />
  );
};
