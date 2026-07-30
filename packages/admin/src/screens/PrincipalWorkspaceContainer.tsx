import type React from 'react';
import { useState } from 'react';
import type { PrincipalWorkspaceView } from '@repo/admin/principal/workspace';

interface PrincipalWorkspaceRenderCtx {
  activeView: PrincipalWorkspaceView;
  setActiveView: (view: PrincipalWorkspaceView) => void;
}

interface PrincipalWorkspaceContainerProps {
  activeView?: PrincipalWorkspaceView;
  onActiveViewChange?: (view: PrincipalWorkspaceView) => void;
  initialView?: PrincipalWorkspaceView;
  renderMain: (ctx: PrincipalWorkspaceRenderCtx) => React.ReactNode;
  renderView: (ctx: PrincipalWorkspaceRenderCtx) => React.ReactNode | null;
}

export function PrincipalWorkspaceContainer({
  activeView: controlledActiveView,
  onActiveViewChange,
  initialView = 'main',
  renderMain,
  renderView,
}: PrincipalWorkspaceContainerProps) {
  const [internalActiveView, setInternalActiveView] = useState<PrincipalWorkspaceView>(initialView);
  const activeView = controlledActiveView ?? internalActiveView;
  const setActiveView = (view: PrincipalWorkspaceView) => {
    if (controlledActiveView === undefined) {
      setInternalActiveView(view);
    }
    onActiveViewChange?.(view);
  };
  const ctx: PrincipalWorkspaceRenderCtx = { activeView, setActiveView };

  if (activeView !== 'main') {
    return <>{renderView(ctx)}</>;
  }

  return <>{renderMain(ctx)}</>;
}
