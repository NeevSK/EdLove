'use client';

import type {
  FloorWallpaperConfig,
  SceneGroundMode,
  WorkspaceAppearance,
  WorkspaceAppearanceMotion,
  WorkspaceAppearancePreset,
  WorkspaceWallpaper,
} from '@repo/core/types';
import { isWorldId } from '@repo/ui/theme';
import React, { useEffect, useState } from 'react';
import {
  EXPLORE_DEFAULT_APPEARANCE,
  getBackdropsForWorld,
} from '../../../lib/canvas/appearanceConstants';
import { useFloorSlideshow } from '../../../lib/canvas/useFloorSlideshow';
import { useWorldTheme } from '../../../lib/theme/useWorldTheme';
import floorStyles from '../self/self-floor.module.css';
import { FloorAtmosphere, type FloorAtmosphereKind } from './FloorAtmosphere';
import { FloorErrorBoundary } from './FloorErrorBoundary';
import { FloorPageActions } from './FloorPageActions';
import { FloorStudioDrawer, type FurnitureDefinition } from './FloorStudioDrawer';
import studioStyles from './floor-studio.module.css';
import { WorkspaceLayoutRecoveryControl } from './WorkspaceLayoutRecoveryControl';
import { WorkspaceWallpaperLayer } from './WorkspaceWallpaperLayer';
import { WorldGroundSurface } from './WorldGroundSurface';

export type SanctuaryFloorCanvasRenderProps = {
  isModuleVisible: (id: string) => boolean;
  stagedItems: readonly FurnitureDefinition[];
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
  appearance?: WorkspaceAppearance;
  setAppearance?: (next: WorkspaceAppearance) => void;
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
  setAppearance,
  furnitureItems = [],
  groupOrder = [],
  pinnedIds = [],
  onReorderFurniture = () => {},
  onTogglePinFurniture = () => {},
  onResetFloorDefaults = () => {},
  layoutSyncStatus,
  onReapplyLayoutChanges,
  topControls,
  showPageActions = true,
  customScene,
  customSvg,
  children,
}: Readonly<SanctuaryFloorCanvasProps>) {
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioTab, setStudioTab] = useState<FloorStudioTab>('atmosphere');
  const hasPageActions =
    showPageActions && ['self', 'workspace', 'community', 'library'].includes(domain);

  useEffect(() => {
    if (!showPageActions) setIsStudioOpen(false);
  }, [showPageActions]);

  const openStudio = (tab: FloorStudioTab) => {
    setStudioTab(tab);
    setIsStudioOpen(true);
  };

  const [internalAppearance, setInternalAppearance] = useState<WorkspaceAppearance>(() =>
    dataMode === 'explore'
      ? EXPLORE_DEFAULT_APPEARANCE
      : { preset: 'default', motion: 'off', groundMode: 'live', worldId: 'sanctuary' },
  );
  const activeAppearance = appearance ?? internalAppearance;
  const updateAppearance = setAppearance ?? setInternalAppearance;

  const { world: reactiveWorld, setWorld: setReactiveWorld } = useWorldTheme();
  const activeWorld = worldId ?? activeAppearance.worldId ?? reactiveWorld;

  const handleSelectWorld = (newWorld: string) => {
    if (isWorldId(newWorld)) {
      setReactiveWorld(newWorld);
    }
    updateAppearance({
      ...activeAppearance,
      worldId: newWorld,
    });
    if (onSelectWorld) onSelectWorld(newWorld);
  };

  const groundMode: SceneGroundMode =
    activeAppearance.groundMode ?? (activeAppearance.wallpaper ? 'image' : 'live');

  const handleSelectGroundMode = (mode: SceneGroundMode) => {
    updateAppearance({
      ...activeAppearance,
      groundMode: mode,
    });
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
          setInternalGroupOrder(parsed);
          return;
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

  const [atmosphere, setAtmosphereState] = useState<FloorAtmosphereKind>('washi-grain');

  useEffect(() => {
    try {
      const stored =
        window.localStorage.getItem(`sanctuary-atmosphere:${domain}`) ||
        window.localStorage.getItem('sanctuary-atmosphere:universal');
      if (
        stored === 'none' ||
        stored === 'washi-grain' ||
        stored === 'aurora-mesh' ||
        stored === 'celestial-embers'
      ) {
        setAtmosphereState(stored);
        return;
      }
    } catch {
      return;
    }
  }, [domain]);

  const setAtmosphere = (kind: FloorAtmosphereKind) => {
    setAtmosphereState(kind);
    try {
      window.localStorage.setItem(`sanctuary-atmosphere:${domain}`, kind);
      window.localStorage.setItem('sanctuary-atmosphere:universal', kind);
    } catch {}
  };

  const { activeWallpaper, nextWallpaper, isCrossFading } = useFloorSlideshow(
    activeAppearance.wallpaperConfig,
    activeAppearance.wallpaper,
  );

  const isImageGround = groundMode === 'image';
  const effectiveWallpaper = isImageGround
    ? (activeWallpaper ??
      (dataMode === 'explore'
        ? EXPLORE_DEFAULT_APPEARANCE.wallpaper
        : (getBackdropsForWorld(activeWorld)[0] ?? null)))
    : null;

  const customWash = activeAppearance.wallpaperConfig?.customWashColor;
  const customWashStyle =
    customWash && activeAppearance.preset !== 'none'
      ? {
          backgroundImage: `radial-gradient(circle at 88% 6%, ${customWash}26, transparent 30rem), radial-gradient(circle at 10% 90%, ${customWash}18, transparent 32rem)`,
        }
      : undefined;

  return (
    <article
      aria-labelledby={titleId}
      className={`${floorStyles.floor} ${className ?? ''}`}
      data-appearance={activeAppearance.preset}
      data-atmosphere={atmosphere}
      data-domain={domain}
      data-ground-mode={groundMode}
      data-has-wallpaper={Boolean(effectiveWallpaper?.url)}
      data-mode={dataMode}
      data-motion={activeAppearance.motion}
      data-world={activeWorld}
      style={customWashStyle}
    >
      <WorldGroundSurface
        customScene={customScene}
        customSvg={customSvg}
        fixed
        groundMode={groundMode}
        isCrossFading={isCrossFading}
        nextWallpaper={nextWallpaper}
        pure={activeAppearance.preset === 'none'}
        room={
          domain === 'workspace'
            ? 'classroom'
            : domain === 'self' || domain === 'community' || domain === 'library'
              ? domain
              : 'self'
        }
        wallpaper={effectiveWallpaper}
        worldId={activeWorld}
      />

      <FloorAtmosphere
        kind={atmosphere}
        preset={activeAppearance.preset === 'none' ? 'default' : activeAppearance.preset}
      />

      {/* Top Controls & Discreet Top-Right Floor Studio Trigger */}
      <div className={studioStyles.floorHeaderBar}>
        <div className={studioStyles.topControlsGroup}>
          {typeof topControls === 'function'
            ? topControls({
                studioOpen: isStudioOpen,
                openWallpaperPicker: () => openStudio('atmosphere'),
                openOrganizer: () => openStudio('furniture'),
              })
            : topControls}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            aria-expanded={isStudioOpen}
            aria-label={`Open ${domain} Floor Studio — customize this ${domain} floor`}
            className={`${studioStyles.studioTrigger} ${isStudioOpen ? studioStyles.studioTriggerActive : ''}`}
            onClick={() => openStudio('atmosphere')}
            title={`Open ${domain} Floor Studio — customize this ${domain} floor`}
            type="button"
          >
            <span>Floor Studio</span>
          </button>
          {hasPageActions ? (
            <FloorPageActions
              domain={domain}
              onChangeWallpaper={() => openStudio('atmosphere')}
              onOrganize={() => openStudio('furniture')}
            />
          ) : null}
        </div>
      </div>

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
            })
          : children}
      </FloorErrorBoundary>

      <FloorStudioDrawer
        activeWallpaper={activeWallpaper}
        currentAtmosphere={atmosphere}
        currentGroundMode={groundMode}
        currentMotion={activeAppearance.motion}
        currentPreset={activeAppearance.preset}
        currentWorld={activeWorld}
        floorDomain={domain}
        furnitureItems={furnitureItems}
        groupOrder={activeGroupOrder}
        initialTab={studioTab}
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onReorderFurniture={handleReorder}
        onResetFloorDefaults={onResetFloorDefaults}
        onSelectAtmosphere={setAtmosphere}
        onSelectGroundMode={handleSelectGroundMode}
        onSelectMotion={(motion) => updateAppearance({ ...activeAppearance, motion })}
        onSelectPreset={(preset) => updateAppearance({ ...activeAppearance, preset })}
        onSelectWallpaper={(wallpaper) =>
          updateAppearance({
            ...activeAppearance,
            wallpaper,
            groundMode: wallpaper ? 'image' : groundMode,
          })
        }
        onSelectWorld={handleSelectWorld}
        onTogglePinFurniture={onTogglePinFurniture}
        onUpdateWallpaperConfig={(wallpaperConfig) =>
          updateAppearance({ ...activeAppearance, wallpaperConfig })
        }
        pinnedIds={pinnedIds}
        wallpaperConfig={activeAppearance.wallpaperConfig}
      />
    </article>
  );
}
