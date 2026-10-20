'use client';

import type {
  FloorWallpaperConfig,
  WorkspaceAppearanceMotion,
  WorkspaceAppearancePreset,
  WorkspaceWallpaper,
} from '@repo/core/types';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  deleteCustomWallpaper,
  loadCustomWallpapers,
  saveCustomWallpaper,
} from '../../../lib/storage/wallpaperIndexedDb';
import type { FloorAtmosphereKind } from './FloorAtmosphere';
import styles from './floor-studio.module.css';

export interface FurnitureDefinition {
  id: string;
  label: string;
  icon?: string;
}

export interface FloorStudioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  floorDomain: string;
  initialTab?: 'atmosphere' | 'furniture';
  currentPreset: WorkspaceAppearancePreset;
  currentMotion: WorkspaceAppearanceMotion;
  currentAtmosphere: FloorAtmosphereKind;
  wallpaperConfig?: FloorWallpaperConfig | null;
  activeWallpaper?: WorkspaceWallpaper | null;
  furnitureItems: readonly FurnitureDefinition[];
  groupOrder: string[];
  pinnedIds: string[];
  onSelectPreset: (preset: WorkspaceAppearancePreset) => void;
  onSelectMotion: (motion: WorkspaceAppearanceMotion) => void;
  onSelectAtmosphere: (kind: FloorAtmosphereKind) => void;
  onSelectWallpaper: (wallpaper: WorkspaceWallpaper | null) => void;
  onUpdateWallpaperConfig?: (config: FloorWallpaperConfig) => void;
  onReorderFurniture: (newOrder: string[]) => void;
  onTogglePinFurniture: (id: string) => void;
  onResetFloorDefaults: () => void;
}

export const PRESET_WALLPAPERS: ReadonlyArray<WorkspaceWallpaper> = [
  {
    provider: 'preset',
    url: '/wallpapers/sanctuary-dawn-lotus.jpg',
    publicId: 'preset:dawn-lotus',
    width: 1920,
    height: 1080,
    name: 'Dawn Lotus',
  },
  {
    provider: 'preset',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
    publicId: 'preset:bamboo',
    width: 1920,
    height: 1080,
    name: 'Bamboo Grove',
  },
  {
    provider: 'preset',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80',
    publicId: 'preset:peaks',
    width: 1920,
    height: 1080,
    name: 'Misty Peaks',
  },
  {
    provider: 'preset',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    publicId: 'preset:cosmos',
    width: 1920,
    height: 1080,
    name: 'Night Cosmos',
  },
];

export function FloorStudioDrawer({
  isOpen,
  onClose,
  floorDomain,
  initialTab = 'atmosphere',
  currentPreset,
  currentAtmosphere,
  wallpaperConfig,
  activeWallpaper,
  furnitureItems,
  groupOrder,
  pinnedIds,
  onSelectPreset,
  onSelectAtmosphere,
  onSelectWallpaper,
  onUpdateWallpaperConfig,
  onReorderFurniture,
  onTogglePinFurniture,
  onResetFloorDefaults,
}: Readonly<FloorStudioDrawerProps>) {
  const [activeTab, setActiveTab] = useState<'atmosphere' | 'furniture'>(initialTab);
  const [customWallpapers, setCustomWallpapers] = useState<WorkspaceWallpaper[]>([]);
  const [customHex, setCustomHex] = useState(wallpaperConfig?.customWashColor ?? '#a85022');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user custom wallpapers from IndexedDB
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      loadCustomWallpapers()
        .then(setCustomWallpapers)
        .catch(() => {});
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const currentMode = wallpaperConfig?.mode ?? (activeWallpaper ? 'single' : 'off');
  const currentInterval = wallpaperConfig?.slideshowIntervalSeconds ?? 300;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const saved = await saveCustomWallpaper(file);
      setCustomWallpapers((prev) => [saved, ...prev]);
      onSelectWallpaper(saved);
    } catch {
      // Failed to save wallpaper
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDeleteCustomWallpaper(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    try {
      await deleteCustomWallpaper(id);
      setCustomWallpapers((prev) => prev.filter((w) => w.publicId !== id));
      if (activeWallpaper?.publicId === id) {
        onSelectWallpaper(null);
      }
    } catch {
      // Delete error handled gracefully
    }
  }

  function toggleSlideshowMode() {
    if (!onUpdateWallpaperConfig) return;
    const nextMode = currentMode === 'slideshow' ? 'single' : 'slideshow';
    const allAvailable = [...PRESET_WALLPAPERS, ...customWallpapers];
    onUpdateWallpaperConfig({
      mode: nextMode,
      activeId: activeWallpaper?.publicId ?? allAvailable[0]?.publicId ?? null,
      items: allAvailable,
      slideshowIntervalSeconds: currentInterval,
      customWashColor: customHex,
    });
  }

  function handleIntervalChange(seconds: number) {
    if (!onUpdateWallpaperConfig) return;
    onUpdateWallpaperConfig({
      mode: currentMode,
      activeId: activeWallpaper?.publicId ?? null,
      items: wallpaperConfig?.items ?? [...PRESET_WALLPAPERS, ...customWallpapers],
      slideshowIntervalSeconds: seconds,
      customWashColor: customHex,
    });
  }

  function moveFurniture(id: string, direction: 'up' | 'down') {
    const index = groupOrder.indexOf(id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= groupOrder.length) return;

    const nextOrder = [...groupOrder];
    const temp = nextOrder[index];
    const targetItem = nextOrder[targetIndex];
    if (temp !== undefined && targetItem !== undefined) {
      nextOrder[index] = targetItem;
      nextOrder[targetIndex] = temp;
      onReorderFurniture(nextOrder);
    }
  }

  // Sorted furniture list based on groupOrder
  const sortedFurniture = groupOrder
    .map((id) => furnitureItems.find((f) => f.id === id))
    .filter((f): f is FurnitureDefinition => f !== undefined);

  return createPortal((
    <>
      <div
        aria-hidden="true"
        className={styles.drawerOverlay}
        onClick={onClose}
      />
      <aside
        aria-label="Floor Studio Configuration"
        className={styles.drawerPanel}
        role="dialog"
      >
        <header className={styles.drawerHeader}>
          <div className={styles.drawerTitleGroup}>
            <span aria-hidden="true">⚙️</span>
            <div>
              <h2 className={styles.drawerTitle}>Floor Studio</h2>
              <p className={styles.drawerSubtitle}>{floorDomain} floor customization</p>
            </div>
          </div>
          <button
            aria-label="Close Floor Studio"
            className={styles.closeButton}
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </header>

        <nav aria-label="Floor Studio Tabs" className={styles.tabNav} role="tablist">
          <button
            aria-selected={activeTab === 'atmosphere'}
            className={`${styles.tabButton} ${activeTab === 'atmosphere' ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab('atmosphere')}
            role="tab"
            type="button"
          >
            <span>✨</span> Atmosphere & Art
          </button>
          <button
            aria-selected={activeTab === 'furniture'}
            className={`${styles.tabButton} ${activeTab === 'furniture' ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab('furniture')}
            role="tab"
            type="button"
          >
            <span>🪑</span> Furniture Staging
          </button>
        </nav>

        <div className={styles.drawerBody}>
          {activeTab === 'atmosphere' ? (
            <>
              {/* Wallpaper Section */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>Sanctuary Wallpaper</span>
                  {activeWallpaper ? (
                    <button
                      className={styles.resetBtn}
                      onClick={() => onSelectWallpaper(null)}
                      type="button"
                    >
                      Clear Wallpaper
                    </button>
                  ) : null}
                </div>

                <div className={styles.wallpaperList}>
                  {PRESET_WALLPAPERS.map((preset) => (
                    <div
                      className={`${styles.wallpaperCard} ${
                        activeWallpaper?.publicId === preset.publicId ? styles.wallpaperCardActive : ''
                      }`}
                      key={preset.publicId}
                      onClick={() => onSelectWallpaper(preset)}
                      role="button"
                      style={{ backgroundImage: `url("${preset.url}")` }}
                      tabIndex={0}
                    >
                      <span className={styles.wallpaperCardLabel}>{preset.name}</span>
                    </div>
                  ))}

                  {customWallpapers.map((custom) => (
                    <div
                      className={`${styles.wallpaperCard} ${
                        activeWallpaper?.publicId === custom.publicId ? styles.wallpaperCardActive : ''
                      }`}
                      key={custom.publicId}
                      onClick={() => onSelectWallpaper(custom)}
                      role="button"
                      style={{ backgroundImage: `url("${custom.url}")` }}
                      tabIndex={0}
                    >
                      <span className={styles.wallpaperCardLabel}>{custom.name || 'Custom'}</span>
                      <button
                        aria-label={`Delete custom wallpaper ${custom.name}`}
                        className={styles.wallpaperDeleteBtn}
                        onClick={(e) => handleDeleteCustomWallpaper(e, custom.publicId)}
                        title="Delete wallpaper"
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Upload Custom Dropzone */}
                <label className={styles.dropzone}>
                  <input
                    accept="image/png,image/jpeg,image/webp"
                    className={styles.fileInputHidden}
                    disabled={isUploading}
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    type="file"
                  />
                  <span aria-hidden="true">{isUploading ? '⏳' : '📤'}</span>
                  <span className={styles.dropzoneText}>
                    {isUploading ? 'Downsampling & Saving...' : 'Upload Custom Wallpaper'}
                  </span>
                  <span className={styles.dropzoneHint}>PNG, JPEG, WebP (auto-scaled to 1920×1080)</span>
                </label>
              </section>

              {/* Slideshow Mode Switcher */}
              <section className={styles.section}>
                <span className={styles.sectionTitle}>Wallpaper Playback Mode</span>
                <div className={styles.gridTwo}>
                  <button
                    className={`${styles.pillButton} ${
                      currentMode !== 'slideshow' ? styles.pillButtonActive : ''
                    }`}
                    onClick={() => {
                      if (currentMode === 'slideshow') toggleSlideshowMode();
                    }}
                    type="button"
                  >
                    <span>🖼️</span> Static Image
                  </button>
                  <button
                    className={`${styles.pillButton} ${
                      currentMode === 'slideshow' ? styles.pillButtonActive : ''
                    }`}
                    onClick={toggleSlideshowMode}
                    type="button"
                  >
                    <span>🔄</span> Slideshow
                  </button>
                </div>

                {currentMode === 'slideshow' ? (
                  <div style={{ marginTop: '0.4rem' }}>
                    <span className={styles.sectionTitle}>Slideshow Cadence</span>
                    <div className={styles.gridThree} style={{ marginTop: '0.35rem' }}>
                      {[
                        { sec: 180, label: '3 min' },
                        { sec: 300, label: '5 min' },
                        { sec: 900, label: '15 min' },
                      ].map((cadence) => (
                        <button
                          className={`${styles.pillButton} ${
                            currentInterval === cadence.sec ? styles.pillButtonActive : ''
                          }`}
                          key={cadence.sec}
                          onClick={() => handleIntervalChange(cadence.sec)}
                          type="button"
                        >
                          {cadence.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>

              {/* Background Color Wash Palette */}
              <section className={styles.section}>
                <span className={styles.sectionTitle}>Diurnal Color Wash</span>
                <div className={styles.gridTwo}>
                  {[
                    { id: 'default', label: '☀️ Sandstone' },
                    { id: 'dawn', label: '🌅 Dawn Coral' },
                    { id: 'garden', label: '🌿 Verdant' },
                    { id: 'night', label: '🌌 Night Twilight' },
                    { id: 'none', label: '⚪ Off (Clear)' },
                  ].map((preset) => (
                    <button
                      className={`${styles.pillButton} ${
                        currentPreset === preset.id ? styles.pillButtonActive : ''
                      }`}
                      key={preset.id}
                      onClick={() => onSelectPreset(preset.id as WorkspaceAppearancePreset)}
                      type="button"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className={styles.colorMixer} style={{ marginTop: '0.5rem' }}>
                  <input
                    aria-label="Custom color wash picker"
                    className={styles.colorInput}
                    onChange={(e) => {
                      setCustomHex(e.target.value);
                      if (onUpdateWallpaperConfig) {
                        onUpdateWallpaperConfig({
                          mode: currentMode,
                          items: wallpaperConfig?.items ?? [...PRESET_WALLPAPERS, ...customWallpapers],
                          slideshowIntervalSeconds: currentInterval,
                          customWashColor: e.target.value,
                        });
                      }
                    }}
                    type="color"
                    value={customHex}
                  />
                  <span className={styles.colorHexText}>{customHex}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft, #706b63)' }}>
                    Custom tint
                  </span>
                </div>
              </section>

              {/* Atmospheric Shaders */}
              <section className={styles.section}>
                <span className={styles.sectionTitle}>Tactile Shader FX</span>
                <div className={styles.gridTwo}>
                  {[
                    { id: 'none', label: 'Plain' },
                    { id: 'washi-grain', label: 'Washi Paper' },
                    { id: 'aurora-mesh', label: 'Aurora Mesh' },
                    { id: 'celestial-embers', label: 'Embers' },
                  ].map((fx) => (
                    <button
                      className={`${styles.pillButton} ${
                        currentAtmosphere === fx.id ? styles.pillButtonActive : ''
                      }`}
                      key={fx.id}
                      onClick={() => onSelectAtmosphere(fx.id as FloorAtmosphereKind)}
                      type="button"
                    >
                      {fx.label}
                    </button>
                  ))}
                </div>
              </section>
            </>
          ) : (
            /* Furniture Staging Tab */
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Floor Furniture Order</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>
                  {sortedFurniture.length} modules staged
                </span>
              </div>

              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
                Reorder or pin spatial components on this floor. Pinned furniture stays anchored at the top of the room.
              </p>

              <div className={styles.furnitureList}>
                {sortedFurniture.map((item, index) => {
                  const isPinned = pinnedIds.includes(item.id);
                  return (
                    <div
                      className={`${styles.furnitureItem} ${isPinned ? styles.furnitureItemPinned : ''}`}
                      key={item.id}
                    >
                      <div className={styles.furnitureInfo}>
                        <span aria-hidden="true">{item.icon ?? '🪑'}</span>
                        <span className={styles.furnitureName}>{item.label}</span>
                      </div>

                      <div className={styles.furnitureActions}>
                        <button
                          aria-label={`Pin ${item.label}`}
                          className={`${styles.furnitureBtn} ${isPinned ? styles.furnitureBtnActive : ''}`}
                          onClick={() => onTogglePinFurniture(item.id)}
                          title={isPinned ? 'Unpin furniture' : 'Pin to top of floor'}
                          type="button"
                        >
                          📌
                        </button>
                        <button
                          aria-label={`Move ${item.label} up`}
                          className={styles.furnitureBtn}
                          disabled={index === 0}
                          onClick={() => moveFurniture(item.id, 'up')}
                          title="Move up"
                          type="button"
                        >
                          ↑
                        </button>
                        <button
                          aria-label={`Move ${item.label} down`}
                          className={styles.furnitureBtn}
                          disabled={index === sortedFurniture.length - 1}
                          onClick={() => moveFurniture(item.id, 'down')}
                          title="Move down"
                          type="button"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <footer className={styles.drawerFooter}>
          <button
            className={styles.resetBtn}
            onClick={onResetFloorDefaults}
            type="button"
          >
            Reset Floor Defaults
          </button>
          <button
            className={styles.pillButton}
            onClick={onClose}
            style={{ fontWeight: 600 }}
            type="button"
          >
            Done
          </button>
        </footer>
      </aside>
    </>
  ), document.body);
}
