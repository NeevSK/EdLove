'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GROUND_NOTE_TEXT,
  GROUND_OPTIONS,
  type GroundNote,
  groundControls,
} from '@repo/core/logic/workspace/groundPlan';
import type {
  FloorWallpaperConfig,
  GroundScope,
  SceneGroundMode,
  WorkspaceAppearanceMotion,
  WorkspaceAppearancePreset,
  WorkspaceWallpaper,
} from '@repo/core/types';
import { WorldPicker } from '@repo/ui/components/web';
import { WORLD_IDS, WORLDS, type WorldId } from '@repo/ui/theme';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  getBackdropsForWorld,
  hasOwnBackdrops,
  PRESET_WALLPAPERS,
} from '../../../lib/canvas/appearanceConstants';
import {
  deleteCustomWallpaper,
  loadCustomWallpapers,
  saveCustomWallpaper,
} from '../../../lib/storage/wallpaperIndexedDb';
import type { FloorAtmosphereKind } from './FloorAtmosphere';
import styles from './floor-studio.module.css';

export { PRESET_WALLPAPERS };

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
  currentWorld?: string;
  currentGroundMode?: SceneGroundMode;
  currentPreset: WorkspaceAppearancePreset;
  currentMotion: WorkspaceAppearanceMotion;
  currentAtmosphere: FloorAtmosphereKind;
  /** Why the drawn floor differs from the choices (from the floor engine's plan). */
  groundNotes?: readonly GroundNote[];
  wallpaperConfig?: FloorWallpaperConfig | null;
  activeWallpaper?: WorkspaceWallpaper | null;
  furnitureItems: readonly FurnitureDefinition[];
  groupOrder: string[];
  pinnedIds: string[];
  onSelectWorld?: (worldId: string) => void;
  onSelectGroundMode?: (mode: SceneGroundMode) => void;
  onSelectPreset: (preset: WorkspaceAppearancePreset) => void;
  onSelectMotion: (motion: WorkspaceAppearanceMotion) => void;
  onSelectAtmosphere: (kind: FloorAtmosphereKind) => void;
  onSelectWallpaper: (wallpaper: WorkspaceWallpaper | null) => void;
  onUpdateWallpaperConfig?: (config: FloorWallpaperConfig) => void;
  onReorderFurniture: (newOrder: string[]) => void;
  onTogglePinFurniture: (id: string) => void;
  onResetFloorDefaults: () => void;
  isArrangeMode?: boolean;
  onToggleArrange?: () => void;
  /** Whether a change to the look is for every room (the world's look) or just this room. */
  scope?: GroundScope;
  onChangeScope?: (scope: GroundScope) => void;
  /** This room keeps its own look instead of the world's. */
  roomHasOwnLook?: boolean;
  /** This room gives up its own look and follows the world again. */
  onFollowWorld?: () => void;
}

const GROUND_ICONS: Record<SceneGroundMode, string> = {
  live: '🌅',
  still: '🌄',
  image: '🖼️',
  quiet: '⚪',
};

const ROOM_NAMES: Record<string, string> = {
  self: 'Self',
  community: 'Community',
  library: 'Library',
  workspace: 'Work room',
  profile: 'Profile',
  settings: 'Settings',
  notifications: 'Notifications',
};

interface SortableFurnitureItemProps {
  item: FurnitureDefinition;
  isPinned: boolean;
  isFirst: boolean;
  isLast: boolean;
  onTogglePin: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}

function SortableFurnitureItem({
  item,
  isPinned,
  isFirst,
  isLast,
  onTogglePin,
  onMove,
}: SortableFurnitureItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.altKey && e.key === 'ArrowUp' && !isFirst) {
      e.preventDefault();
      onMove(item.id, 'up');
    } else if (e.altKey && e.key === 'ArrowDown' && !isLast) {
      e.preventDefault();
      onMove(item.id, 'down');
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`${styles.furnitureItem} ${isPinned ? styles.furnitureItemPinned : ''}`}
      data-dnd-id={item.id}
      data-dnd-lifted={isDragging}
      title="Hold or long-press to drag and reorder, or use Alt+Arrow keys"
    >
      <div className={styles.furnitureInfo}>
        <span aria-hidden="true">{item.icon ?? '🪑'}</span>
        <span className={styles.furnitureName}>{item.label}</span>
      </div>

      <div className={styles.furnitureActions}>
        <button
          aria-label={`Pin ${item.label}`}
          className={`${styles.furnitureBtn} ${isPinned ? styles.furnitureBtnActive : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(item.id);
          }}
          title={isPinned ? 'Unpin furniture' : 'Pin to top of floor'}
          type="button"
        >
          📌
        </button>
        <button
          aria-label={`Move ${item.label} up`}
          className={styles.furnitureBtn}
          disabled={isFirst}
          onClick={(e) => {
            e.stopPropagation();
            onMove(item.id, 'up');
          }}
          title="Move up"
          type="button"
        >
          ↑
        </button>
        <button
          aria-label={`Move ${item.label} down`}
          className={styles.furnitureBtn}
          disabled={isLast}
          onClick={(e) => {
            e.stopPropagation();
            onMove(item.id, 'down');
          }}
          title="Move down"
          type="button"
        >
          ↓
        </button>
      </div>
    </div>
  );
}

export function FloorStudioDrawer({
  isOpen,
  onClose,
  floorDomain,
  initialTab = 'atmosphere',
  currentWorld = 'sanctuary',
  currentGroundMode = 'live',
  currentPreset,
  currentAtmosphere,
  groundNotes = [],
  wallpaperConfig,
  activeWallpaper,
  furnitureItems,
  groupOrder,
  pinnedIds,
  onSelectWorld,
  onSelectGroundMode,
  onSelectPreset,
  onSelectAtmosphere,
  onSelectWallpaper,
  onUpdateWallpaperConfig,
  onReorderFurniture,
  onTogglePinFurniture,
  onResetFloorDefaults,
  isArrangeMode = false,
  onToggleArrange,
  scope = 'world',
  onChangeScope,
  roomHasOwnLook = false,
  onFollowWorld,
}: Readonly<FloorStudioDrawerProps>) {
  const roomName = ROOM_NAMES[floorDomain] ?? 'This room';
  const dndContextId = React.useId();
  const [activeTab, setActiveTab] = useState<'atmosphere' | 'furniture'>(initialTab);
  const [customWallpapers, setCustomWallpapers] = useState<WorkspaceWallpaper[]>([]);
  const [customHex, setCustomHex] = useState(wallpaperConfig?.customWashColor ?? '#a85022');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 400,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = groupOrder.indexOf(String(active.id));
      const newIndex = groupOrder.indexOf(String(over.id));
      if (oldIndex !== -1 && newIndex !== -1) {
        const nextOrder = arrayMove(groupOrder, oldIndex, newIndex);
        onReorderFurniture(nextOrder);
      }
    }
  };

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
  // Which settings mean something for this look: the floor engine decides, same as the phone.
  const controls = groundControls({
    preset: currentPreset,
    motion: 'off',
    groundMode: currentGroundMode,
    wallpaperConfig,
  });
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
    // A slideshow plays this world's photos and the uploads, not every world's.
    const allAvailable = [...getBackdropsForWorld(currentWorld), ...customWallpapers];
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
      items: wallpaperConfig?.items ?? [...getBackdropsForWorld(currentWorld), ...customWallpapers],
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

  return createPortal(
    <>
      <div aria-hidden="true" className={styles.drawerOverlay} onClick={onClose} />
      <aside aria-label="Floor Studio Configuration" className={styles.drawerPanel} role="dialog">
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
              {/* Cultural World Section */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>Cultural World (every room)</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                    {WORLDS[currentWorld as keyof typeof WORLDS]?.names.en ?? 'Kele'}
                  </span>
                </div>
                <WorldPicker
                  value={(currentWorld ?? 'kele') as WorldId}
                  onChange={(id) => onSelectWorld?.(id)}
                  mode="light"
                  label="Choose Cultural World"
                />
              </section>

              {/* Every room or just this one: asked before any change to the look */}
              {onChangeScope ? (
                <section className={styles.section} data-testid="look-scope">
                  <span className={styles.sectionTitle} id="look-scope-title">
                    Change the look of
                  </span>
                  <div
                    aria-labelledby="look-scope-title"
                    className={styles.gridTwo}
                    role="radiogroup"
                  >
                    <button
                      aria-checked={scope === 'world'}
                      className={`${styles.pillButton} ${scope === 'world' ? styles.pillButtonActive : ''}`}
                      onClick={() => onChangeScope('world')}
                      role="radio"
                      type="button"
                    >
                      Every room
                    </button>
                    <button
                      aria-checked={scope === 'room'}
                      className={`${styles.pillButton} ${scope === 'room' ? styles.pillButtonActive : ''}`}
                      onClick={() => onChangeScope('room')}
                      role="radio"
                      type="button"
                    >
                      Just {roomName}
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
                    {scope === 'world'
                      ? roomHasOwnLook
                        ? `Changes here go to every room, and ${roomName} will follow the world's look again.`
                        : 'Every room follows one look. Changes here go to all of them.'
                      : `Changes here stay in ${roomName}. Other rooms keep the world's look.`}
                  </p>
                  {roomHasOwnLook && onFollowWorld ? (
                    <button className={styles.resetBtn} onClick={onFollowWorld} type="button">
                      Use the world's look in {roomName}
                    </button>
                  ) : null}
                </section>
              ) : null}

              {/* Ground: the four ways a floor can stand */}
              <section className={styles.section}>
                <span className={styles.sectionTitle}>Ground</span>
                <div className={styles.gridFour}>
                  {GROUND_OPTIONS.ground.map((option) => (
                    <button
                      aria-pressed={currentGroundMode === option.id}
                      className={`${styles.pillButton} ${
                        currentGroundMode === option.id ? styles.pillButtonActive : ''
                      }`}
                      key={option.id}
                      onClick={() => onSelectGroundMode?.(option.id)}
                      title={option.hint}
                      type="button"
                    >
                      <span aria-hidden="true">{GROUND_ICONS[option.id]}</span> {option.label}
                    </button>
                  ))}
                </div>
                {groundNotes
                  .filter((note) => note !== 'texture-paused')
                  .map((note) => (
                    <p className={styles.drawerSubtitle} key={note} role="status">
                      {GROUND_NOTE_TEXT[note]}
                    </p>
                  ))}
              </section>

              {/* Photo settings: only mean something when the ground is a photo */}
              {controls.photoPicker ? (
                <>
                  <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                      <span className={styles.sectionTitle}>
                        {hasOwnBackdrops(currentWorld)
                          ? 'World Photo Gallery'
                          : 'Photos (this world has none yet; showing Sanctuary)'}
                      </span>
                      {activeWallpaper ? (
                        <button
                          className={styles.resetBtn}
                          onClick={() => onSelectWallpaper(null)}
                          type="button"
                        >
                          Back to living sky
                        </button>
                      ) : null}
                    </div>

                    <div className={styles.wallpaperList}>
                      {getBackdropsForWorld(currentWorld).map((preset) => (
                        <div
                          className={`${styles.wallpaperCard} ${
                            activeWallpaper?.publicId === preset.publicId
                              ? styles.wallpaperCardActive
                              : ''
                          }`}
                          key={preset.publicId}
                          onClick={() => onSelectWallpaper(preset)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onSelectWallpaper(preset);
                            }
                          }}
                          aria-pressed={activeWallpaper?.publicId === preset.publicId}
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
                            activeWallpaper?.publicId === custom.publicId
                              ? styles.wallpaperCardActive
                              : ''
                          }`}
                          key={custom.publicId}
                          onClick={() => onSelectWallpaper(custom)}
                          onKeyDown={(e) => {
                            if (e.target !== e.currentTarget) return;
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onSelectWallpaper(custom);
                            }
                          }}
                          aria-pressed={activeWallpaper?.publicId === custom.publicId}
                          role="button"
                          style={{ backgroundImage: `url("${custom.url}")` }}
                          tabIndex={0}
                        >
                          <span className={styles.wallpaperCardLabel}>
                            {custom.name || 'Custom'}
                          </span>
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
                    <label className={styles.dropzone} style={{ marginTop: '0.6rem' }}>
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
                      <span className={styles.dropzoneHint}>
                        PNG, JPEG, WebP (auto-scaled to 1920×1080)
                      </span>
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

                    {controls.cadence ? (
                      <div style={{ marginTop: '0.4rem' }}>
                        <span className={styles.sectionTitle}>Slideshow Cadence</span>
                        <div className={styles.gridThree} style={{ marginTop: '0.35rem' }}>
                          {GROUND_OPTIONS.cadence.map((cadence) => (
                            <button
                              className={`${styles.pillButton} ${
                                currentInterval === cadence.id ? styles.pillButtonActive : ''
                              }`}
                              key={cadence.id}
                              onClick={() => handleIntervalChange(cadence.id)}
                              type="button"
                            >
                              {cadence.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </section>
                </>
              ) : null}

              {/* Photo tint: a light wash over the photo (it cannot show on a sky or paper) */}
              {controls.tint ? (
                <section className={styles.section}>
                  <span className={styles.sectionTitle}>Photo tint</span>
                  <div className={styles.gridTwo}>
                    {GROUND_OPTIONS.tint.map((preset) => (
                      <button
                        className={`${styles.pillButton} ${
                          currentPreset === preset.id ? styles.pillButtonActive : ''
                        }`}
                        key={preset.id}
                        aria-pressed={currentPreset === preset.id}
                        onClick={() => onSelectPreset(preset.id)}
                        type="button"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {currentPreset !== 'none' ? (
                    <div className={styles.colorMixer} style={{ marginTop: '0.5rem' }}>
                      <input
                        aria-label="Custom color wash picker"
                        className={styles.colorInput}
                        onChange={(e) => {
                          setCustomHex(e.target.value);
                          if (onUpdateWallpaperConfig) {
                            onUpdateWallpaperConfig({
                              ...wallpaperConfig,
                              mode: currentMode,
                              activeId:
                                activeWallpaper?.publicId ?? wallpaperConfig?.activeId ?? null,
                              items: wallpaperConfig?.items ?? [
                                ...getBackdropsForWorld(currentWorld),
                                ...customWallpapers,
                              ],
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
                        Your own colour (kept light enough to read)
                      </span>
                    </div>
                  ) : null}
                </section>
              ) : null}

              {/* Texture laid over the ground */}
              <section className={styles.section}>
                <span className={styles.sectionTitle}>Texture</span>
                <div className={styles.gridTwo}>
                  {GROUND_OPTIONS.texture.map((fx) => (
                    <button
                      className={`${styles.pillButton} ${
                        currentAtmosphere === fx.id ? styles.pillButtonActive : ''
                      }`}
                      key={fx.id}
                      aria-pressed={currentAtmosphere === fx.id}
                      onClick={() => onSelectAtmosphere(fx.id)}
                      type="button"
                    >
                      {fx.label}
                    </button>
                  ))}
                </div>
                {groundNotes.includes('texture-paused') ? (
                  <p className={styles.drawerSubtitle} role="status">
                    {GROUND_NOTE_TEXT['texture-paused']}
                  </p>
                ) : null}
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

              {onToggleArrange ? (
                <div style={{ margin: '0.5rem 0' }}>
                  <button
                    type="button"
                    className={`${styles.pillButton} ${isArrangeMode ? styles.pillButtonActive : ''}`}
                    onClick={onToggleArrange}
                    aria-label={
                      isArrangeMode
                        ? 'Exit floor arranging mode'
                        : 'Arrange floor sections with drag and drop'
                    }
                    aria-pressed={isArrangeMode}
                  >
                    <span>{isArrangeMode ? '✓' : '⇅'}</span>
                    <span>
                      {isArrangeMode ? 'Done Canvas Arranging' : 'Arrange In-Place on Canvas'}
                    </span>
                  </button>
                </div>
              ) : null}

              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
                Reorder or pin spatial components on this floor. Hold down or long-press any card to
                drag and rearrange it. Pinned furniture stays anchored at the top of the room.
              </p>

              <DndContext
                id={dndContextId}
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={groupOrder} strategy={verticalListSortingStrategy}>
                  <div className={styles.furnitureList}>
                    {sortedFurniture.map((item, index) => {
                      const isPinned = pinnedIds.includes(item.id);
                      return (
                        <SortableFurnitureItem
                          key={item.id}
                          item={item}
                          isPinned={isPinned}
                          isFirst={index === 0}
                          isLast={index === sortedFurniture.length - 1}
                          onTogglePin={onTogglePinFurniture}
                          onMove={moveFurniture}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </section>
          )}
        </div>

        <footer className={styles.drawerFooter}>
          <button className={styles.resetBtn} onClick={onResetFloorDefaults} type="button">
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
    </>,
    document.body,
  );
}
