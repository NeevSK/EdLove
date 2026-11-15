'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ScrollArea } from '@repo/ui/components/web';
import { useTranslation } from '@/lib/i18n';
import { useDomainWorkbench } from '../../../lib/workbench';
import { useWorkbenchScope } from '../../../lib/workbench/WorkbenchScope';
import type { WorkspaceRoleFilter } from '../components/RoleLensSwitcher';
import styles from './workspace-nav.module.css';
import { filterWorkspaceFeatures, WORKSPACE_FEATURES } from './workspaceFeatures';

interface WorkspaceNavProps {
  activeId?: string;
  roleFilter?: WorkspaceRoleFilter;
}

export function WorkspaceNav({ activeId, roleFilter = 'all' }: Readonly<WorkspaceNavProps>) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const workbench = useDomainWorkbench('workspace', { usageScope: useWorkbenchScope() });
  const [capacityMessage, setCapacityMessage] = useState('');
  const visibleItems = filterWorkspaceFeatures(WORKSPACE_FEATURES, roleFilter);

  function openFeature(item: (typeof WORKSPACE_FEATURES)[number]) {
    const route = item.id === 'attendance' ? '/workspace?task=attendance' : item.href;
    const localizedTitle = t(`workspace.features.${item.id}`);
    const displayTitle =
      localizedTitle !== `workspace.features.${item.id}` ? localizedTitle : item.label;
    const result = workbench.open({
      featureId: item.id,
      route,
      title: displayTitle,
      icon: item.symbol,
      temporalBinding: { kind: 'follow-domain' },
      localStatePolicy: 'restore-permitted',
    });
    if (result.kind === 'at-capacity') {
      setCapacityMessage('Close a Workspace task before opening another.');
      return;
    }
    setCapacityMessage('');
    if (pathname !== route) router.push(route);
  }

  return (
    <nav
      className={styles.navContainer}
      aria-label={t('workspace.toolsNav') || 'Workspace tools navigation'}
    >
      <ScrollArea
        orientation="horizontal"
        variant="auto"
        label={t('workspace.toolsNav') || 'Workspace tools navigation'}
        className={styles.workspaceNav}
        showEdgeGradients={false}
      >
        <div className={styles.navItemsList}>
          {visibleItems.map((item) => {
            const isActive = activeId ? activeId === item.id : pathname === item.href;
            const localizedLabel = t(`workspace.features.${item.id}`);
            const displayLabel =
              localizedLabel !== `workspace.features.${item.id}` ? localizedLabel : item.label;
            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => openFeature(item)}
                type="button"
              >
                <span className={styles.symbol} aria-hidden="true">
                  {item.symbol}
                </span>
                <span>{displayLabel}</span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
      {capacityMessage ? <span role="status">{capacityMessage}</span> : null}
    </nav>
  );
}
