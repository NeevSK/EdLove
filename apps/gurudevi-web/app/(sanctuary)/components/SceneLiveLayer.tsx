import type { SceneRoom } from '@repo/ui/theme/scene';
import React from 'react';
import { WorldGroundSurface } from './WorldGroundSurface';

export interface SceneLiveLayerProps {
  fixed?: boolean;
  worldId?: string;
  worldGlow?: string;
  room?: SceneRoom;
  customSvg?: React.ReactNode;
}

export function SceneLiveLayer({
  fixed = true,
  worldId = 'sanctuary',
  room = 'self',
  customSvg,
}: Readonly<SceneLiveLayerProps>) {
  return (
    <WorldGroundSurface
      customSvg={customSvg}
      fixed={fixed}
      groundMode="live"
      room={room}
      worldId={worldId}
    />
  );
}
