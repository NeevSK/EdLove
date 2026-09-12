import { useActiveSubTabsStore, type ActiveSubTabItem } from '@repo/core/store/useActiveSubTabsStore';
import { useEffect } from 'react';

/**
 * useTrackActiveSubTab: Registers the active screen into the domain's
 * running active sub-tabs list on mount.
 */
export function useTrackActiveSubTab(tab: Omit<ActiveSubTabItem, 'openedAt'>) {
  const openTab = useActiveSubTabsStore((s) => s.openTab);

  useEffect(() => {
    openTab(tab);
  }, [tab.id, tab.domain, tab.route, tab.title, openTab]);
}
