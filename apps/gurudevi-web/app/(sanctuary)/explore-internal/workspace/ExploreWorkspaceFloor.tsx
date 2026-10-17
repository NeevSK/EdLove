'use client';

import { useExploreCapacity } from '../../../../lib/explore/exploreCapacity';
import { WorkspaceFloor } from '../../workspace/WorkspaceFloor';

export function ExploreWorkspaceFloor() {
  const capacity = useExploreCapacity();
  return <WorkspaceFloor key={capacity} capacity={capacity} mode="explore" />;
}
