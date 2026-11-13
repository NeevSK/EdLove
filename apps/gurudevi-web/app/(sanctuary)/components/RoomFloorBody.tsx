'use client';

import {
  type FloorNode,
  type FloorSettings,
  floorControlsOf,
  layoutRoomFloor,
  type RoomFloorArgs,
  type RoomPlan,
} from '@repo/core/logic/floor';
import type { FeaturePresentationMode } from '@repo/core/logic/permissions/featurePresentation';
import { FloorView, type PatternWords } from '@repo/ui/components/web';
import { floorFitOf, isWorldId, type KitPiece, worldFloorBias } from '@repo/ui/theme';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useGurudeviView } from '../../../lib/runtime/useGurudeviView';

/** What a room hands its frame to be drawn by the floor engine instead of its own layout. */
export interface RoomFloorProps {
  /** The room's plan: areas, groups and pieces (one list per room). */
  plan: RoomPlan;
  /** The person's saved arrangement for this room and bond (order, pins, own floor settings). */
  layout?: RoomFloorArgs['layout'];
  /** The every-room floor settings, when the person changed every room at once. */
  everyRoom?: FloorSettings | null;
  /** SanctuaryFeature's decision per piece; missing means available. */
  presentationOf?: (pieceId: string) => FeaturePresentationMode;
  renderPiece: (piece: FloorNode) => ReactNode;
  onSeeAll?: (groupId: string) => void;
  words?: Partial<PatternWords>;
}

/** The shell bars around a web room; the engine gives way from these when space is short. */
const WEB_CHROME = [{ id: 'reception', height: 72, giveWayRank: 2 }] as const;

/**
 * The web room frame's floor: the same engine door the phone frame uses, with
 * the active world's character, verger's dials and the space this floor is
 * given. It decides nothing itself; what goes where is in the tree.
 */
export function RoomFloorBody({
  worldId,
  plan,
  layout,
  everyRoom,
  presentationOf,
  renderPiece,
  onSeeAll,
  words,
}: RoomFloorProps & { worldId: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [space, setSpace] = useState({ width: 0, height: 0, fontScale: 1 });
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const root = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    const fontScale = Number.isFinite(root) && root > 0 ? root / 16 : 1;
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setSpace({
        width: Math.round(entry.contentRect.width),
        height: window.innerHeight,
        fontScale,
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const view = useGurudeviView();
  const floor = useMemo(() => {
    if (space.width === 0) return null;
    return layoutRoomFloor({
      plan,
      layout,
      everyRoom,
      presentationOf,
      fitOf: (kit) => floorFitOf(kit as KitPiece, 'web'),
      space: { ...space, chrome: WEB_CHROME },
      controls: floorControlsOf(view?.experience),
      world: isWorldId(worldId) ? worldFloorBias(worldId) : undefined,
    });
  }, [plan, layout, everyRoom, presentationOf, space, view?.experience, worldId]);

  return (
    <div ref={ref} data-floor-source={floor?.settings.source} data-floor-tier={floor?.tree.tier}>
      {floor ? (
        <FloorView tree={floor.tree} renderPiece={renderPiece} onSeeAll={onSeeAll} words={words} />
      ) : null}
    </div>
  );
}
