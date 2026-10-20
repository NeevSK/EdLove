'use client';

import type {
  FloorWallpaperConfig,
  WorkspaceAppearance,
  WorkspaceAppearanceMotion,
  WorkspaceAppearancePreset,
  WorkspaceWallpaper,
} from '@repo/core/types';
import React, { useEffect, useState } from 'react';
import { useFloorSlideshow } from '../../../lib/canvas/useFloorSlideshow';
import { FloorAtmosphere, type FloorAtmosphereKind } from './FloorAtmosphere';
import {
  FloorStudioDrawer,
  type FurnitureDefinition,
} from './FloorStudioDrawer';
import { FloorPageActions } from './FloorPageActions';
import { FloorErrorBoundary } from './FloorErrorBoundary';
import { WorkspaceWallpaperLayer } from './WorkspaceWallpaperLayer';
import { WorkspaceLayoutRecoveryControl } from './WorkspaceLayoutRecoveryControl';
import studioStyles from './floor-studio.module.css';
import floorStyles from '../self/self-floor.module.css';

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
  children: React.ReactNode | ((props: SanctuaryFloorCanvasRenderProps) => React.ReactNode);
}


export function SanctuaryFloorCanvas({
  domain,
  titleId,
  className,
  dataMode,
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
  children,
}: Readonly<SanctuaryFloorCanvasProps>) {
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioTab, setStudioTab] = useState<FloorStudioTab>('furniture');
  const hasPageActions = showPageActions && ['self', 'workspace', 'community', 'library'].includes(domain);

  useEffect(() => {
    if (!showPageActions) setIsStudioOpen(false);
  }, [showPageActions]);

  const openStudio = (tab: FloorStudioTab) => {
    setStudioTab(tab);
    setIsStudioOpen(true);
  };

  const [internalAppearance, setInternalAppearance] = useState<WorkspaceAppearance>(() => ({
    preset: 'default',
    motion: 'off',
  }));
  const activeAppearance = appearance ?? internalAppearance;
  const updateAppearance = setAppearance ?? setInternalAppearance;
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
    ...furnitureItems
      .filter((item) => !configuredOrder.includes(item.id))
      .map((item) => item.id),
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
      data-has-wallpaper={Boolean(activeWallpaper?.url)}
      data-mode={dataMode}
      data-motion={activeAppearance.motion}
      style={customWashStyle}
    >
      <WorkspaceWallpaperLayer
        fixed
        isCrossFading={isCrossFading}
        nextWallpaper={nextWallpaper}
        pure={activeAppearance.preset === 'none'}
        wallpaper={activeWallpaper}
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

        {hasPageActions ? (
          <FloorPageActions
            domain={domain}
            onChangeWallpaper={() => openStudio('atmosphere')}
            onOrganize={() => openStudio('furniture')}
          />
        ) : typeof topControls === 'function' ? null : (
          <button
            aria-expanded={isStudioOpen}
            aria-label={`Organize ${domain} home`}
            className={`${studioStyles.studioTrigger} ${isStudioOpen ? studioStyles.studioTriggerActive : ''}`}
            onClick={() => openStudio('furniture')}
            title={`Organize ${domain} home and customize its appearance`}
            type="button"
          >
            <span>Organize home</span>
          </button>
        )}
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
        currentMotion={activeAppearance.motion}
        currentPreset={activeAppearance.preset}
        initialTab={studioTab}
        floorDomain={domain}
        furnitureItems={furnitureItems}
        groupOrder={activeGroupOrder}
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onReorderFurniture={handleReorder}
        onResetFloorDefaults={onResetFloorDefaults}
        onSelectAtmosphere={setAtmosphere}
        onSelectMotion={(motion) => updateAppearance({ ...activeAppearance, motion })}
        onSelectPreset={(preset) => updateAppearance({ ...activeAppearance, preset })}
        onSelectWallpaper={(wallpaper) => updateAppearance({ ...activeAppearance, wallpaper })}
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
