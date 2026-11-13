import { isOnWorkspaceFloor } from '@repo/core/logic/places/workspaceCatalog';
import { useLocation } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { workspaceFeatureAt } from '../../app/(sanctuary)/workspace/workspaceFeatureRegistry';
import { GoTo } from './navigation';
import { useSession } from './session';

/**
 * Opens a Workspace feature only on the floor of the person's capacity. Navigation never offers
 * another floor's features; a link to one (shared, bookmarked, typed) opens the person's own
 * Workspace instead, as on mobile (docs/architecture/places-roles-and-features.md, rule 9).
 */
export function FloorGate({ children }: Readonly<{ children: ReactNode }>) {
  const { pathname } = useLocation();
  const { capacity } = useSession();
  const feature = workspaceFeatureAt(pathname);
  if (feature && !isOnWorkspaceFloor(capacity, feature.id)) return <GoTo to="/workspace" />;
  return children;
}
