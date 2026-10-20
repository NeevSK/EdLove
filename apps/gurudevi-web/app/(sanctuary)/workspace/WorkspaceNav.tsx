'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDomainWorkbench } from '../../../lib/workbench';
import { useWorkbenchScope } from '../../../lib/workbench/WorkbenchScope';
import type { WorkspaceRoleFilter } from '../components/RoleLensSwitcher';
import styles from './workspace-nav.module.css';
import { filterWorkspaceFeatures, WORKSPACE_FEATURES } from './workspaceFeatureRegistry';

interface WorkspaceNavProps {
  activeId?: string;
  roleFilter?: WorkspaceRoleFilter;
}

export function WorkspaceNav({ activeId, roleFilter = 'all' }: Readonly<WorkspaceNavProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const workbench = useDomainWorkbench('workspace', { usageScope: useWorkbenchScope() });
  const [capacityMessage, setCapacityMessage] = useState('');
  const visibleItems = filterWorkspaceFeatures(WORKSPACE_FEATURES, roleFilter);

  function openFeature(item: (typeof WORKSPACE_FEATURES)[number]) {
    const route = item.id === 'attendance' ? '/workspace?task=attendance' : item.href;
    const result = workbench.open({
      featureId: item.id,
      route,
      title: item.label,
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
    <nav className={styles.workspaceNav} aria-label="Workspace tools navigation">
      {visibleItems.map((item) => {
        const isActive = activeId ? activeId === item.id : pathname === item.href;
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
            <span>{item.label}</span>
          </button>
        );
      })}
      {capacityMessage ? <span role="status">{capacityMessage}</span> : null}
    </nav>
  );
}
