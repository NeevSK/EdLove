'use client';

import {
  followWorldGround,
  groundModePatch,
  resolveRoomGround,
  wallpaperConfigPatch,
  wallpaperPatch,
  writeGround,
} from '@repo/core/logic/workspace/ground';
import {
  groundAllowanceOf,
  NOTHING_ALLOWED,
  planGround,
} from '@repo/core/logic/workspace/groundPlan';
import type { GroundScope, SceneGroundMode, WorkspaceAppearance } from '@repo/core/types';
import { isWorldId } from '@repo/ui/theme';
import React, { useEffect, useMemo, useState } from 'react';
import { getBackdropsForWorld, groundDefaultsFor } from '../../../lib/canvas/appearanceConstants';
import { useBrowserWorkspaceAppearance } from '../../../lib/canvas/useBrowserWorkspaceAppearance';
import { THIS_BROWSER, useWorldLook, worldLookStore } from '../../../lib/canvas/worldLookStore';
import { useGroundPolicy } from '../../../lib/runtime/useGroundPolicy';
import { useGurudeviView } from '../../../lib/runtime/useGurudeviView';
import { useWorldTheme } from '../../../lib/theme/useWorldTheme';
import floorStyles from '../self/self-floor.module.css';
import type { FloorAtmosphereKind } from './FloorAtmosphere';
import { FloorErrorBoundary } from './FloorErrorBoundary';
import { FloorReception } from './FloorReception';
import { FloorStudioDrawer, type FurnitureDefinition } from './FloorStudioDrawer';
import { GroundLayers, sceneRoomOf } from './GroundLayers';
import { WorkspaceLayoutRecoveryControl } from './WorkspaceLayoutRecoveryControl';

export type SanctuaryFloorCanvasRenderProps = {
  isModuleVisible: (id: string) => boolean;
  stagedItems: readonly FurnitureDefinition[];
  isArrangeMode: boolean;
  toggleArrangeMode: () => void;
};

export type FloorStudioTab = 'atmosphere' | 'furniture';

export type FloorHeaderActions = Readonly<{
  studioOpen: boolean;
  openWallpaperPicker: () => void;
  openOrganizer: () => void;
}>;

export interface SanctuaryFloorCanvasProps {
  domain: string;
  titleId?: string;
  className?: string;
  dataMode?: string;
  worldId?: string;
  onSelectWorld?: (world: string) => void;
  /** The room's look as its page knows it (with defaults filled in). */
  appearance?: WorkspaceAppearance;
  /** What the room has actually saved (null: nothing, so it follows the world's look). */
  storedAppearance?: WorkspaceAppearance | null;
  setAppearance?: (next: WorkspaceAppearance) => void;
  /** Whose looks these are; without it the looks stay on this browser only. */
  accountId?: string;
  furnitureItems?: readonly FurnitureDefinition[];
  groupOrder?: string[];
  pinnedIds?: string[];
  onReorderFurniture?: (newOrder: string[]) => void;
  onTogglePinFurniture?: (id: string) => void;
  onResetFloorDefaults?: () => void;
  layoutSyncStatus?: 'loading' | 'ready' | 'saving' | 'saved' | 'offline' | 'conflict' | 'error';
  onReapplyLayoutChanges?: () => Promise<void>;
  showPageActions?: boolean;
  topControls?: React.ReactNode | ((actions: FloorHeaderActions) => React.ReactNode);
  greeting?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  timeControl?: React.ReactNode;
  renderExtra?: () => React.ReactNode;
  customScene?: React.ReactNode;
  customSvg?: React.ReactNode;
  children: React.ReactNode | ((props: SanctuaryFloorCanvasRenderProps) => React.ReactNode);
}

export function SanctuaryFloorCanvas({
  domain,
  titleId,
  className,
  dataMode,
  worldId,
  onSelectWorld,
  appearance,
  storedAppearance,
  setAppearance,
  accountId,
  furnitureItems = [],
  groupOrder = [],
  pinnedIds = [],
  onReorderFurniture = () => {},
  onTogglePinFurniture = () => {},
  onResetFloorDefaults = () => {},
  layoutSyncStatus,
  onReapplyLayoutChanges,
  topControls,
  greeting,
  breadcrumb,
  timeControl,
  renderExtra,
  showPageActions = true,
  customScene,
  customSvg,
  children,
}: Readonly<SanctuaryFloorCanvasProps>) {
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioTab, setStudioTab] = useState<FloorStudioTab>('atmosphere');
  const [isArrangeMode, setIsArrangeMode] = useState(false);

  useEffect(() => {
    if (!showPageActions) setIsStudioOpen(false);
  }, [showPageActions]);

  const { world: reactiveWorld, setWorld: setReactiveWorld } = useWorldTheme();

  // One look is shared by every room (the world's); a room may keep its own. Both are saved
  // looks: the world's beside the rooms', and the room's in its page's saved layout (or, for
  // floors whose page keeps none, in this browser).
  const isExplore = dataMode === 'explore';
  // Until someone picks a photo, Photo shows the active world's own photos (the stock defaults
  // name Sanctuary's, which looked wrong in every other world).
  const activeWorld = worldId ?? reactiveWorld;
  const groundDefaults = useMemo(
    () => groundDefaultsFor(activeWorld, isExplore),
    [isExplore, activeWorld],
  );
  const lookOwner = accountId ?? (isExplore ? 'explore' : THIS_BROWSER);
  // The world's look is one store for the whole app: every screen reads and changes the same one.
  const worldLook = useWorldLook();
  useEffect(() => {
    worldLookStore.useOwner(lookOwner);
  }, [lookOwner]);
  const browserRoomLook = useBrowserWorkspaceAppearance({
    accountId: lookOwner,
    workspaceId: `floor-${domain}`,
    enableRemoteSync: false,
    defaultAppearance: groundDefaults,
  });
  const pageKeepsLook = Boolean(setAppearance);
  const roomSaved = pageKeepsLook ? (storedAppearance ?? null) : browserRoomLook.stored;
  const saveRoomLook = setAppearance ?? browserRoomLook.setAppearance;
  const resolvedGround = resolveRoomGround(groundDefaults, worldLook.look, roomSaved);
  // Motion and wash still come from the page where it keeps them (Profile's own controls).
  const activeAppearance: WorkspaceAppearance = {
    ...resolvedGround.appearance,
    motion: appearance?.motion ?? resolvedGround.appearance.motion,
  };
  const roomHasOwnLook = resolvedGround.source === 'room';

  // "Just this room or every room?" Asked in the studio; it starts on whichever this room uses.
  const [scope, setScope] = useState<GroundScope>(roomHasOwnLook ? 'room' : 'world');

  const openStudio = (tab: FloorStudioTab) => {
    setStudioTab(tab);
    setScope(roomHasOwnLook ? 'room' : 'world');
    setIsStudioOpen(true);
  };

  const changeLook = (patch: Partial<WorkspaceAppearance>) => {
    const write = writeGround(activeAppearance, patch, scope);
    if (write.world) worldLookStore.set(write.world);
    if (write.room) void saveRoomLook(write.room);
  };

  const followWorld = () => {
    void saveRoomLook(followWorldGround(roomSaved, groundDefaults));
    setScope('world');
  };

  // Sanctuary world is universal: every floor inherits the active world from the environment.

  const handleSelectWorld = (newWorld: string) => {
    if (isWorldId(newWorld)) {
      setReactiveWorld(newWorld);
    }
    if (onSelectWorld) onSelectWorld(newWorld);
  };

  const groundMode: SceneGroundMode =
    activeAppearance.groundMode ?? (activeAppearance.wallpaper ? 'image' : 'live');

  // One change, one save: before, the studio sent two saves from one tap (mode, then photo),
  // the second built from the stale look, so leaving Photo for Live Sky never stuck.
  const handleSelectGroundMode = (mode: SceneGroundMode) => {
    changeLook(groundModePatch(activeAppearance, mode, getBackdropsForWorld(activeWorld)));
  };

  const defaultFurnitureIds = furnitureItems.map((item) => item.id);
  const defaultFurnitureKey = defaultFurnitureIds.join('|');

  const [internalGroupOrder, setInternalGroupOrder] = useState<string[]>(defaultFurnitureIds);

  useEffect(() => {
    const defaults = defaultFurnitureKey ? defaultFurnitureKey.split('|') : [];
    try {
      const stored = window.localStorage.getItem(`sanctuary-furniture:${domain}`);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed.every((id): id is string => typeof id === 'string')
        ) {
          const valid = parsed.filter((id) => defaults.includes(id));
          if (valid.length > 0) {
            const missing = defaults.filter((id) => !valid.includes(id));
            setInternalGroupOrder([...valid, ...missing]);
            return;
          }
        }
      }
    } catch {
      setInternalGroupOrder(defaults);
      return;
    }
    setInternalGroupOrder(defaults);
  }, [domain, defaultFurnitureKey]);

  const configuredOrder = groupOrder.length > 0 ? groupOrder : internalGroupOrder;
  const activeGroupOrder = [
    ...configuredOrder.filter((id) => furnitureItems.some((item) => item.id === id)),
    ...furnitureItems.filter((item) => !configuredOrder.includes(item.id)).map((item) => item.id),
  ];

  const handleReorder = (order: string[]) => {
    setInternalGroupOrder(order);
    try {
      window.localStorage.setItem(`sanctuary-furniture:${domain}`, JSON.stringify(order));
    } catch {}
    onReorderFurniture(order);
  };

  // Older floors kept the texture per browser; it is now part of the look, read here until saved.
  const [legacyAtmosphere, setLegacyAtmosphere] = useState<FloorAtmosphereKind>('washi-grain');

  useEffect(() => {
    try {
      const stored =
        window.localStorage.getItem(`sanctuary-atmosphere:${domain}`) ||
        window.localStorage.getItem('sanctuary-atmosphere:universal');
      if (isAtmosphere(stored)) setLegacyAtmosphere(stored);
    } catch {
      return;
    }
  }, [domain]);

  // The floor engine's one plan for this look on this device (shared with the phone).
  const view = useGurudeviView();
  const allowance = useMemo(
    () => (view ? groundAllowanceOf(view.experience, view.reading) : NOTHING_ALLOWED),
    [view],
  );
  const worldPhotos = getBackdropsForWorld(activeWorld);
  const groundPolicy = useGroundPolicy();
  const plan = planGround(
    activeAppearance,
    worldPhotos,
    allowance,
    legacyAtmosphere,
    'room',
    groundPolicy,
  );
  const atmosphere: FloorAtmosphereKind = isAtmosphere(activeAppearance.atmosphere)
    ? activeAppearance.atmosphere
    : legacyAtmosphere;

  // The app shell already draws the world's look behind every screen; a room draws its own
  // ground only when it keeps its own look (or when no shell is around, as in tests and labs).
  const drawsOwnGround =
    !worldLook.shellGround || roomHasOwnLook || Boolean(customScene || customSvg);

  return (
    <article
      aria-labelledby={titleId}
      className={`${floorStyles.floor} ${className ?? ''}`}
      data-appearance={activeAppearance.preset}
      data-atmosphere={atmosphere}
      data-domain={domain}
      data-ground-mode={groundMode}
      data-ground-source={resolvedGround.source}
      data-ground-drawn={plan.surface}
      data-ground-host={drawsOwnGround ? 'floor' : 'shell'}
      data-has-wallpaper={plan.surface === 'photo'}
      data-mode={dataMode}
      data-motion={plan.breathe ? 'subtle' : 'off'}
      data-world={activeWorld}
    >
      {drawsOwnGround ? (
        <GroundLayers
          customScene={customScene}
          customSvg={customSvg}
          plan={plan}
          room={sceneRoomOf(domain)}
          worldId={activeWorld}
        />
      ) : null}

      {/* Unified Floor Reception Bar (Idea 2 Dual-Anchor Horizon Split) */}
      <FloorReception
        domain={domain}
        titleId={titleId}
        greeting={greeting}
        breadcrumb={breadcrumb}
        timeControl={timeControl}
        renderExtra={renderExtra}
        isArrangeMode={isArrangeMode}
        onToggleArrange={() => setIsArrangeMode((prev) => !prev)}
        isStudioOpen={isStudioOpen}
        onOpenStudio={(tab) => openStudio(tab ?? 'atmosphere')}
      >
        {typeof topControls === 'function'
          ? topControls({
              studioOpen: isStudioOpen,
              openWallpaperPicker: () => openStudio('atmosphere'),
              openOrganizer: () => openStudio('furniture'),
            })
          : topControls}
      </FloorReception>

      {layoutSyncStatus && onReapplyLayoutChanges && (
        <WorkspaceLayoutRecoveryControl
          hasConflict={layoutSyncStatus === 'conflict'}
          status={layoutSyncStatus}
          reapplyLocalChanges={onReapplyLayoutChanges}
        />
      )}

      <FloorErrorBoundary
        fallbackTitle={`${domain.charAt(0).toUpperCase() + domain.slice(1)} Floor Experience Temporarily Paused`}
      >
        {typeof children === 'function'
          ? (children as (props: SanctuaryFloorCanvasRenderProps) => React.ReactNode)({
              isModuleVisible: (id: string) => {
                if (furnitureItems.length === 0) return true;
                return activeGroupOrder.length === 0 || activeGroupOrder.includes(id);
              },
              stagedItems: furnitureItems,
              isArrangeMode,
              toggleArrangeMode: () => setIsArrangeMode((prev) => !prev),
            })
          : children}
      </FloorErrorBoundary>

      <FloorStudioDrawer
        activeWallpaper={plan.photo}
        currentAtmosphere={atmosphere}
        groundNotes={plan.notes}
        currentGroundMode={groundMode}
        currentMotion={activeAppearance.motion}
        currentPreset={activeAppearance.preset}
        currentWorld={activeWorld}
        floorDomain={domain}
        scope={scope}
        onChangeScope={setScope}
        roomHasOwnLook={roomHasOwnLook}
        onFollowWorld={followWorld}
        furnitureItems={furnitureItems}
        groupOrder={activeGroupOrder}
        initialTab={studioTab}
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onReorderFurniture={handleReorder}
        onResetFloorDefaults={() => {
          if (!pageKeepsLook) void browserRoomLook.resetAppearance();
          onResetFloorDefaults();
        }}
        onSelectAtmosphere={(kind) => changeLook({ atmosphere: kind })}
        onSelectGroundMode={handleSelectGroundMode}
        onSelectMotion={(motion) => changeLook({ motion })}
        onSelectPreset={(preset) => changeLook({ preset })}
        onSelectWallpaper={(wallpaper) => changeLook(wallpaperPatch(activeAppearance, wallpaper))}
        onSelectWorld={handleSelectWorld}
        onTogglePinFurniture={onTogglePinFurniture}
        onUpdateWallpaperConfig={(wallpaperConfig) =>
          changeLook(wallpaperConfigPatch(activeAppearance, wallpaperConfig))
        }
        pinnedIds={pinnedIds}
        isArrangeMode={isArrangeMode}
        onToggleArrange={() => setIsArrangeMode((prev) => !prev)}
        wallpaperConfig={activeAppearance.wallpaperConfig}
      />
    </article>
  );
}

function isAtmosphere(value: unknown): value is FloorAtmosphereKind {
  return (
    value === 'none' ||
    value === 'washi-grain' ||
    value === 'aurora-mesh' ||
    value === 'celestial-embers'
  );
}
