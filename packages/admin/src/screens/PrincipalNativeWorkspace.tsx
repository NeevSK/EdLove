import React, { useEffect, useState } from 'react';
import { ScreenWrapper } from '@repo/ui';
import { usePermissions } from '@repo/core';
import { HierarchyBuilder, InviteManager } from '../components';
import { PrincipalWorkspaceContainer } from './PrincipalWorkspaceContainer';
import type { PrincipalWorkspaceView } from '../principal/workspace';

export interface PrincipalNativeWorkspaceRenderCtx {
  activeView: PrincipalWorkspaceView;
  canManageSchoolScope: boolean;
  navigatePrincipalView: (view: PrincipalWorkspaceView) => void;
}

interface PrincipalNativeWorkspaceProps {
  schoolId: string;
  userId: string;
  activeView?: PrincipalWorkspaceView;
  onActiveViewChange?: (view: PrincipalWorkspaceView) => void;
  renderMain: (ctx: PrincipalNativeWorkspaceRenderCtx) => React.ReactNode;
  renderAdditionalView?: (ctx: PrincipalNativeWorkspaceRenderCtx) => React.ReactNode | null;
}

export function PrincipalNativeWorkspace({
  schoolId,
  userId,
  activeView: controlledActiveView,
  onActiveViewChange,
  renderMain,
  renderAdditionalView,
}: PrincipalNativeWorkspaceProps) {
  const { can } = usePermissions();
  const [internalActiveView, setInternalActiveView] = useState<PrincipalWorkspaceView>('main');
  const activeView = controlledActiveView ?? internalActiveView;
  const canManageSchoolScope = can('manage', 'School');

  const navigatePrincipalView = (view: PrincipalWorkspaceView) => {
    if (view === 'main') {
      if (controlledActiveView === undefined) {
        setInternalActiveView('main');
      }
      onActiveViewChange?.('main');
      return;
    }

    if (canManageSchoolScope) {
      if (controlledActiveView === undefined) {
        setInternalActiveView(view);
      }
      onActiveViewChange?.(view);
    }
  };

  useEffect(() => {
    if (!canManageSchoolScope && activeView !== 'main') {
      if (controlledActiveView === undefined) {
        setInternalActiveView('main');
      }
      onActiveViewChange?.('main');
    }
  }, [activeView, canManageSchoolScope, controlledActiveView, onActiveViewChange]);

  const ctx: PrincipalNativeWorkspaceRenderCtx = {
    activeView,
    canManageSchoolScope,
    navigatePrincipalView,
  };

  const renderWorkspaceView = () => {
    if (activeView === 'hierarchy') {
      return (
        <ScreenWrapper>
          <HierarchyBuilder schoolId={schoolId} onBack={() => navigatePrincipalView('main')} />
        </ScreenWrapper>
      );
    }

    if (activeView === 'invites') {
      return (
        <ScreenWrapper>
          <InviteManager schoolId={schoolId} userId={userId} onBack={() => navigatePrincipalView('main')} />
        </ScreenWrapper>
      );
    }

    return renderAdditionalView?.(ctx) ?? null;
  };

  return (
    <PrincipalWorkspaceContainer
      activeView={activeView}
      onActiveViewChange={navigatePrincipalView}
      renderView={() => renderWorkspaceView()}
      renderMain={() => renderMain(ctx)}
    />
  );
}
