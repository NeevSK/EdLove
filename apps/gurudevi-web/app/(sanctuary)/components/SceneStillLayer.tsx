import type { SceneRoom } from '@repo/ui/theme/scene';
import React from 'react';
import { WorldGroundSurface } from './WorldGroundSurface';

export interface SceneStillLayerProps {
  fixed?: boolean;
  worldId?: string;
  worldGlow?: string;
  room?: SceneRoom;
  customSvg?: React.ReactNode;
}

export function SceneStillLayer({
  fixed = true,
  worldId = 'sanctuary',
  room = 'self',
  customSvg,
}: Readonly<SceneStillLayerProps>) {
  return (
    <WorldGroundSurface
      customSvg={customSvg}
      fixed={fixed}
      groundMode="still"
      room={room}
      worldId={worldId}
    />
  );
}
