import {
  type ActiveSubTabInput,
  useActiveSubTabsStore,
} from '@repo/core/store/useActiveSubTabsStore';
import { useEffect, useMemo } from 'react';

/**
 * Registers a task screen with its domain workbench. Overview routes must not
 * call this hook: an empty working set is the overview state.
 */
export function useTrackActiveSubTab(tab: ActiveSubTabInput) {
  const openTab = useActiveSubTabsStore((s) => s.openTab);
  const paramsSignature = JSON.stringify(tab.params ?? {});
  const contextSignature = JSON.stringify(tab.context ?? {});
  const resourceSignature = JSON.stringify(tab.resource ?? {});
  const temporalBindingSignature = JSON.stringify(tab.temporalBinding ?? { kind: 'follow-domain' });
  const trackedTab = useMemo(
    () => ({ ...tab }),
    [
      contextSignature,
      paramsSignature,
      resourceSignature,
      tab.domain,
      tab.featureId,
      tab.iconName,
      tab.id,
      tab.localStatePolicy,
      tab.route,
      temporalBindingSignature,
      tab.title,
    ],
  );

  useEffect(() => {
    openTab(trackedTab);
  }, [openTab, trackedTab]);
}
