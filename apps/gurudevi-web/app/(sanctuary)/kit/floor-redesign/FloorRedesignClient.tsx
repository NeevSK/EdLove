'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  MoreHorizontal,
  SlidersHorizontal,
  Palette,
  Layers,
  Settings2,
  Clock,
  Sparkles,
  ArrowUpDown,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  Pin,
  RotateCcw,
  Sun,
  Moon,
  CloudSun,
  LayoutGrid,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { DateTimeCombo } from '@repo/ui/components/web';
import { Surface } from '@repo/ui/components/web';
import styles from './floor-redesign.module.css';

type ArchetypeKey = 'baseline' | 'capsule' | 'horizon' | 'hud' | 'zen' | 'dock' | 'angular';
type DrawerTab = 'atmosphere' | 'furniture' | 'preferences';
type PanelMode = 'drawer' | 'modal';

interface FurnitureItem {
  id: string;
  label: string;
  icon: string;
  pinned: boolean;
}

const INITIAL_FURNITURE: FurnitureItem[] = [
  { id: 'practices', label: 'Daily Sadhana & Practices', icon: '🧘', pinned: true },
  { id: 'rhythm', label: 'Energy & Circadian Rhythm', icon: '⚡', pinned: true },
  { id: 'journal', label: 'Warm Mirror & Reflect', icon: '🪞', pinned: false },
  { id: 'teaching', label: 'Teaching History & Timeline', icon: '📜', pinned: false },
  { id: 'decisions', label: 'Decision Journal Ledger', icon: '🧭', pinned: false },
];

const DOMAIN_SUBTASKS: Record<string, Array<{ id: string; label: string; icon: string }>> = {
  self: [
    { id: 'overview', label: 'Overview', icon: '🪷' },
    { id: 'rhythm', label: 'Daily Rhythm', icon: '⚡' },
    { id: 'reflect', label: 'Warm Mirror', icon: '🪞' },
  ],
  workspace: [
    { id: 'overview', label: 'Overview', icon: '🏫' },
    { id: 'gradebook', label: 'Gradebook', icon: '📋' },
    { id: 'attendance', label: 'Attendance', icon: '🧑‍🏫' },
    { id: 'lesson', label: 'Lesson Plan', icon: '📚' },
  ],
  community: [
    { id: 'overview', label: 'Overview', icon: '🌐' },
    { id: 'faculty', label: 'Faculty Circle', icon: '💬' },
    { id: 'mentorship', label: 'Mentorship', icon: '🤝' },
  ],
  library: [
    { id: 'overview', label: 'Overview', icon: '📚' },
    { id: 'archive', label: 'Palm-Leaf Archive', icon: '📖' },
    { id: 'audio', label: 'Audio Reader', icon: '🎧' },
  ],
};

export function FloorRedesignClient() {
  const [activeDate, setActiveDate] = useState<string>('2026-11-03');
  const [activeTime, setActiveTime] = useState<string>('15:23');

  // Redesign Laboratory State
  const [activeArchetype, setActiveArchetype] = useState<ArchetypeKey>('capsule');
  const [isArrangeMode, setIsArrangeMode] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [panelMode, setPanelMode] = useState<PanelMode>('drawer');
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('atmosphere');
  const [selectedWorld, setSelectedWorld] = useState<string>('sanctuary');
  const [selectedPreset, setSelectedPreset] = useState<string>('dawn');
  const [furnitureList, setFurnitureList] = useState<FurnitureItem[]>(INITIAL_FURNITURE);
  const [backdropTheme, setBackdropTheme] = useState<'mountain' | 'lotus' | 'plain'>('mountain');
  const [activeHudFilter, setActiveHudFilter] = useState<string>('all');
  const [activeBottomRealm, setActiveBottomRealm] = useState<'self' | 'workspace' | 'community' | 'library'>('self');
  const [isBottomSubtaskOpen, setIsBottomSubtaskOpen] = useState<boolean>(false);
  const [isDockHovered, setIsDockHovered] = useState<boolean>(false);
  const [isSubtaskPinned, setIsSubtaskPinned] = useState<boolean>(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Angular Precision State (Idea 6)
  const [selectedAngularDomain, setSelectedAngularDomain] = useState<string>('self');
  const [isAngularScrolledHidden, setIsAngularScrolledHidden] = useState<boolean>(false);
  const [angularActiveTaskKey, setAngularActiveTaskKey] = useState<string>('overview');
  const [angularTasksMap, setAngularTasksMap] = useState<Record<string, Array<{ id: string; label: string; icon: string }>>>(DOMAIN_SUBTASKS);

  function closeAngularTask(domain: string, taskId: string) {
    if (taskId === 'overview') return;
    setAngularTasksMap((prev) => ({
      ...prev,
      [domain]: (prev[domain] ?? []).filter((t) => t.id !== taskId),
    }));
    if (angularActiveTaskKey === taskId) {
      setAngularActiveTaskKey('overview');
    }
  }

  function handleDockMouseEnter() {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsDockHovered(true);
  }

  function handleDockMouseLeave() {
    if (isSubtaskPinned) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setIsDockHovered(false);
    }, 380); // 380ms grace period before auto-stowing
  }

  // Holistic Macro Co-Design State (Main Menu + Task Strip + Reception Bar)
  const [coDesignMode, setCoDesignMode] = useState<'stacked' | 'unified' | 'dock'>('dock');
  const [activeTaskKey, setActiveTaskKey] = useState<string>('overview');
  const [openTasks, setOpenTasks] = useState<Array<{ id: string; label: string; icon: string }>>([
    { id: 'overview', label: 'Overview', icon: '🪷' },
    { id: 'rhythm', label: 'Daily Rhythm', icon: '⚡' },
    { id: 'reflect', label: 'Warm Mirror', icon: '🪞' },
  ]);

  function closeTask(id: string) {
    if (id === 'overview') return; // Cannot close Overview
    const remaining = openTasks.filter((t) => t.id !== id);
    setOpenTasks(remaining);
    if (activeTaskKey === id) {
      setActiveTaskKey('overview');
    }
  }

  function togglePin(id: string) {
    setFurnitureList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, pinned: !item.pinned } : item))
    );
  }

  function moveItem(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= furnitureList.length) return;
    const updated = [...furnitureList];
    const [moved] = updated.splice(index, 1);
    if (moved) {
      updated.splice(targetIndex, 0, moved);
      setFurnitureList(updated);
    }
  }

  // Backdrop style helper
  const backdropBackground =
    backdropTheme === 'mountain'
      ? 'radial-gradient(ellipse at 50% 20%, rgba(220, 215, 200, 0.4) 0%, rgba(200, 195, 180, 0.7) 100%), #e8e4db'
      : backdropTheme === 'lotus'
        ? 'linear-gradient(135deg, #fce7f3 0%, #e0e7ff 100%)'
        : '#fdfbf7';

  // Real-time Ergonomics Metrics
  const metricsMap: Record<ArchetypeKey, { vsr: string; nodes: number; rating: string; ratingColor: string; description: string }> = {
    baseline: {
      vsr: '4.82%',
      nodes: 5,
      rating: 'Violates VSR (> 3.0%) · Appliance Scatter',
      ratingColor: '#b91c1c',
      description: '5 disconnected floating islands competing for user attention across the top horizon.',
    },
    capsule: {
      vsr: '0.88%',
      nodes: 1,
      rating: 'Optimal / Elegant (VSR ≤ 1.2%)',
      ratingColor: '#166534',
      description: 'Single floating liquid glass island uniting identity, glanceable time, and full floor controls.',
    },
    horizon: {
      vsr: '1.05%',
      nodes: 2,
      rating: 'Optimal / Elegant (VSR ≤ 1.2%)',
      ratingColor: '#166534',
      description: 'Dual-anchor split bar keeping the entire central skyline clear for scenic immersion.',
    },
    hud: {
      vsr: '1.28%',
      nodes: 1,
      rating: 'Optimal / Functional',
      ratingColor: '#0284c7',
      description: 'Linear/macOS style productivity HUD with inline section filter chips and command trigger.',
    },
    zen: {
      vsr: '0.98%',
      nodes: 1,
      rating: 'Optimal / Zen Poetic (VSR ≤ 1.2%)',
      ratingColor: '#166534',
      description: 'Hospitality reception metaphor pairing seasonal poetry, phase pulse, and slide-out ledger.',
    },
    dock: {
      vsr: '1.35%',
      nodes: 2,
      rating: 'Optimal / 1:1 Web & Mobile Parity (VSR ≤ 1.5%)',
      ratingColor: '#166534',
      description: 'Top Idea 2 Dual-Anchor keeps sky open. Floating Bottom Dock holds persistent Menu + expandable SubtaskStrip.',
    },
    angular: {
      vsr: '1.12%',
      nodes: 1,
      rating: 'Optimal / Architectural Precision (Angular, Zero Pills)',
      ratingColor: '#166534',
      description: 'Clean flat bars with 4px subtle radii. Auto-hides on scroll, springs open on top-edge mouse approach. Dynamic subtasks morph per active domain.',
    },
  };

  const currentMetrics = metricsMap[activeArchetype];

  return (
    <div className={styles.prototypeRoot} style={{ padding: '2rem 1.5rem', background: '#f8f6f0', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link href="/kit" style={{ color: '#131e27', fontWeight: 700, textDecoration: 'none' }}>
              🪷 Kit Hub
            </Link>
            <span style={{ color: '#a8a29e' }}>/</span>
            <span style={{ color: '#78716c', fontWeight: 600 }}>Floor Reception & Spatial Redesign Laboratory</span>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a85022', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            RFC: Ergonomic Reception & Three-Dots Consolidation
          </span>
        </div>

        {/* Title Header */}
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#131e27' }}>
            Floor Reception & Spatial Control Redesign
          </h1>
          <p style={{ color: '#57534e', margin: 0, fontSize: '0.975rem', maxWidth: '850px', lineHeight: 1.5 }}>
            Consolidating the scattered top header controls (Greeting, Time pill, Arrange Floor, Floor Studio, and Settings)
            into a unified, living spatial container with an expansive <strong>Three-Dots Side Panel / Modal</strong>.
          </p>
        </div>

        {/* ==================================================================== */}
        {/* LIVE INTERACTIVE STAGE & CONTROLS */}
        {/* ==================================================================== */}
        <Surface tone="raised" style={{ padding: '1.5rem', borderRadius: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* ARCHETYPE SELECTOR TOOLBAR */}
          <div className={styles.redesignToolbar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#131e27', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Design Archetype:
              </span>
              <div className={styles.archetypePills}>
                <button
                  type="button"
                  className={`${styles.archetypeButton} ${activeArchetype === 'baseline' ? styles.archetypeButtonActive : ''}`}
                  onClick={() => setActiveArchetype('baseline')}
                >
                  <span>⚠️ Current Baseline (Scattered)</span>
                </button>
                <button
                  type="button"
                  className={`${styles.archetypeButton} ${activeArchetype === 'capsule' ? styles.archetypeButtonActive : ''}`}
                  onClick={() => setActiveArchetype('capsule')}
                >
                  <span>✨ Idea 1: Dynamic Capsule</span>
                </button>
                <button
                  type="button"
                  className={`${styles.archetypeButton} ${activeArchetype === 'horizon' ? styles.archetypeButtonActive : ''}`}
                  onClick={() => setActiveArchetype('horizon')}
                >
                  <span>🌅 Idea 2: Horizon Split</span>
                </button>
                <button
                  type="button"
                  className={`${styles.archetypeButton} ${activeArchetype === 'hud' ? styles.archetypeButtonActive : ''}`}
                  onClick={() => setActiveArchetype('hud')}
                >
                  <span>⚡ Idea 3: Command HUD</span>
                </button>
                <button
                  type="button"
                  className={`${styles.archetypeButton} ${activeArchetype === 'zen' ? styles.archetypeButtonActive : ''}`}
                  onClick={() => setActiveArchetype('zen')}
                >
                  <span>🪷 Idea 4: Zen Reception Desk</span>
                </button>
                <button
                  type="button"
                  className={`${styles.archetypeButton} ${activeArchetype === 'dock' ? styles.archetypeButtonActive : ''}`}
                  onClick={() => setActiveArchetype('dock')}
                >
                  <span>🧭 Idea 5: Top Anchor + Bottom Dock</span>
                </button>
                <button
                  type="button"
                  className={`${styles.archetypeButton} ${activeArchetype === 'angular' ? styles.archetypeButtonActive : ''}`}
                  onClick={() => setActiveArchetype('angular')}
                >
                  <span>📐 Idea 6: Angular Precision Horizon</span>
                </button>
              </div>
            </div>

            {/* STAGE ENVIRONMENT TOGGLES */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#78716c' }}>
                <span>Scene:</span>
                <select
                  value={backdropTheme}
                  onChange={(e) => setBackdropTheme(e.target.value as any)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #d6d3d1',
                    background: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="mountain">Serene Mist Landscape</option>
                  <option value="lotus">Dawn Lotus Glow</option>
                  <option value="plain">Clean Studio Ground</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#78716c' }}>
                <span>Inspector:</span>
                <button
                  type="button"
                  onClick={() => setPanelMode((m) => (m === 'drawer' ? 'modal' : 'drawer'))}
                  style={{
                    padding: '0.25rem 0.6rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #d6d3d1',
                    background: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {panelMode === 'drawer' ? '👉 Side Drawer' : '🔲 Center Modal'}
                </button>
              </div>
            </div>
          </div>

          {/* REAL-TIME SPATIAL ERGONOMICS METRICS HUD */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
              padding: '0.85rem 1.25rem',
              borderRadius: '0.75rem',
              background: '#ffffff',
              border: '1px solid #e7e5e4',
            }}
          >
            <div>
              <span style={{ fontSize: '0.7rem', color: '#78716c', textTransform: 'uppercase', fontWeight: 700 }}>
                Viewport Surface Ratio (VSR)
              </span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: currentMetrics.ratingColor }}>
                {currentMetrics.vsr}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#78716c', textTransform: 'uppercase', fontWeight: 700 }}>
                Control Node Count
              </span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#131e27' }}>
                {currentMetrics.nodes} {currentMetrics.nodes === 1 ? 'Unified Island' : 'Dispersed Islands'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#78716c', textTransform: 'uppercase', fontWeight: 700 }}>
                Ergonomics Status
              </span>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: currentMetrics.ratingColor, marginTop: '0.2rem' }}>
                {currentMetrics.rating}
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* THE SIMULATED SANCTUARY CANVAS STAGE */}
          {/* ================================================================ */}
          <div
            className={styles.canvasStage}
            style={{
              background: backdropBackground,
            }}
          >
            <div className={styles.stageBackdropOverlay} />

            <div className={styles.stageContent}>
              
              {/* ------------------------------------------------------------ */}
              {/* 0. BASELINE (CURRENT SCATTERED APPLIANCE) */}
              {/* ------------------------------------------------------------ */}
              {activeArchetype === 'baseline' && (
                <div className={styles.scatteredBaseline}>
                  <div className={styles.baselineLeft}>
                    <h2 className={styles.baselineGreeting}>Good afternoon, Guest Explorer</h2>
                    <p className={styles.baselineBreadcrumb}>Self · Overview</p>
                  </div>

                  <div className={styles.baselineRightCluster}>
                    <div className={styles.baselineTimePill}>
                      <span style={{ fontWeight: 700 }}>🕒 {activeTime}</span>
                      <span style={{ fontSize: '0.7rem', color: '#78716c' }}>‹ ■ Tue, Nov 3 ›</span>
                    </div>

                    <button
                      type="button"
                      className={styles.baselineButton}
                      onClick={() => setIsArrangeMode(!isArrangeMode)}
                      style={{ background: isArrangeMode ? '#a85022' : undefined, color: isArrangeMode ? '#fff' : undefined }}
                    >
                      <ArrowUpDown size={14} />
                      <span>{isArrangeMode ? 'Done Arranging' : 'Arrange Floor'}</span>
                    </button>

                    <button
                      type="button"
                      className={styles.baselineButton}
                      onClick={() => {
                        setDrawerTab('atmosphere');
                        setIsDrawerOpen(true);
                      }}
                    >
                      <span>Floor Studio</span>
                    </button>

                    <button
                      type="button"
                      className={styles.baselineRoundBtn}
                      onClick={() => {
                        setDrawerTab('atmosphere');
                        setIsDrawerOpen(true);
                      }}
                      title="Page settings"
                    >
                      <Settings2 size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------ */}
              {/* 1. IDEA 1: UNIFIED DYNAMIC CAPSULE (DYNAMIC ISLAND) */}
              {/* ------------------------------------------------------------ */}
              {activeArchetype === 'capsule' && (
                <div className={`${styles.dynamicCapsule} ${isArrangeMode ? styles.dynamicCapsuleArranging : ''}`}>
                  {isArrangeMode ? (
                    <>
                      <div className={styles.capsuleLeft}>
                        <ArrowUpDown size={16} color="#a85022" />
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#a85022' }}>
                          Arranging Floor Sections (Drag or Reorder in Menu)
                        </span>
                      </div>
                      <div className={styles.capsuleRight}>
                        <button
                          type="button"
                          onClick={() => setIsArrangeMode(false)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.3rem 0.9rem',
                            background: '#a85022',
                            color: '#ffffff',
                            borderRadius: '999px',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Check size={14} />
                          <span>Done Arranging</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.capsuleLeft}>
                        <div className={styles.capsuleDot} title="Atmosphere: Living Synchronized" />
                        <span className={styles.capsuleGreeting}>Good afternoon, Guest Explorer</span>
                        <span className={styles.capsuleDivider}>·</span>
                        <span className={styles.capsuleDomain}>Self · Overview</span>
                      </div>

                      <div className={styles.capsuleRight}>
                        <button
                          type="button"
                          className={styles.capsuleTimePill}
                          onClick={() => {
                            setDrawerTab('preferences');
                            setIsDrawerOpen(true);
                          }}
                          title="Click to view time details"
                        >
                          <Clock size={13} />
                          <span>{activeTime}</span>
                          <span style={{ color: '#78716c', fontWeight: 500 }}>Tue, Nov 3</span>
                        </button>

                        <button
                          type="button"
                          className={styles.dotsTrigger}
                          onClick={() => setIsDrawerOpen(true)}
                          aria-label="Open comprehensive Floor Studio & Customization Panel"
                          title="Open Floor Studio (Atmosphere, Furniture, Preferences)"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------ */}
              {/* 2. IDEA 2 & 5: HORIZON SPLIT BAR (DUAL-ANCHOR MINIMALIST) */}
              {/* ------------------------------------------------------------ */}
              {(activeArchetype === 'horizon' || activeArchetype === 'dock') && (
                <div className={styles.horizonSplitBar}>
                  <div className={styles.horizonLeftAnchor}>
                    <span style={{ fontSize: '1rem' }}>🌅</span>
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', fontWeight: 500 }}>
                      Good afternoon, Guest Explorer
                    </span>
                    <span style={{ color: '#a8a29e' }}>·</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#131e27' }}>Self</span>
                  </div>

                  <div className={styles.horizonRightAnchor}>
                    <button
                      type="button"
                      className={styles.capsuleTimePill}
                      onClick={() => setIsDrawerOpen(true)}
                      style={{ border: 'none', background: 'transparent' }}
                    >
                      <Clock size={13} />
                      <span>{activeTime}</span>
                      <span style={{ color: '#78716c' }}>Nov 3</span>
                    </button>

                    <div style={{ width: '1px', height: '14px', background: 'rgba(0,0,0,0.1)' }} />

                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.3rem 0.75rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: '#131e27',
                      }}
                    >
                      <SlidersHorizontal size={14} />
                      <span>Customize</span>
                    </button>

                    <button
                      type="button"
                      className={styles.dotsTrigger}
                      onClick={() => setIsDrawerOpen(true)}
                      style={{ width: '1.85rem', height: '1.85rem' }}
                    >
                      <MoreHorizontal size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------ */}
              {/* 3. IDEA 3: COMMAND HUD BAR (LINEAR STYLE) */}
              {/* ------------------------------------------------------------ */}
              {activeArchetype === 'hud' && (
                <div className={styles.commandHudBar}>
                  <div className={styles.hudLeft}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.04em' }}>SELF</span>
                    <div className={styles.hudFilters}>
                      {['all', 'practices', 'rhythm', 'journal'].map((f) => (
                        <button
                          key={f}
                          type="button"
                          className={`${styles.hudFilterPill} ${activeHudFilter === f ? styles.hudFilterPillActive : ''}`}
                          onClick={() => setActiveHudFilter(f)}
                        >
                          {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#57534e' }}>
                      {activeTime} · Nov 3
                    </span>
                    <button
                      type="button"
                      className={styles.dotsTrigger}
                      onClick={() => setIsDrawerOpen(true)}
                      style={{ width: '1.9rem', height: '1.9rem' }}
                    >
                      <MoreHorizontal size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------ */}
              {/* 4. IDEA 4: ZEN RECEPTION DESK */}
              {/* ------------------------------------------------------------ */}
              {activeArchetype === 'zen' && (
                <div className={styles.zenReceptionBar}>
                  <div className={styles.zenLeft}>
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.05rem', fontWeight: 500 }}>
                      Sanctuary · Self Floor
                    </span>
                    <p className={styles.zenPoem}>
                      "A quiet afternoon holds steady ground for mindful work."
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#78716c' }}>
                      <CloudSun size={15} color="#a85022" />
                      <span>Midday Calm</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.35rem 0.9rem',
                        borderRadius: '999px',
                        background: '#ffffff',
                        border: '1px solid rgba(168,80,34,0.25)',
                        color: '#a85022',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <Sparkles size={14} />
                      <span>Floor Ledger & Studio</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------ */}
              {/* 6. IDEA 6: ANGULAR PRECISION HORIZON (FLAT BARS, AUTO-HIDE & ADAPTIVE TABS) */}
              {/* ------------------------------------------------------------ */}
              {activeArchetype === 'angular' && (
                <div className={styles.angularContainer}>
                  {/* TOP PROXIMITY SENSOR (CURSOR FLING REVEAL) */}
                  <div
                    className={styles.topEdgeProximitySensor}
                    onMouseEnter={() => setIsAngularScrolledHidden(false)}
                    title="Top edge sensor: Move mouse here to reveal bars"
                  />

                  {/* FLAT ANGULAR TOP BAR */}
                  <div
                    className={`${styles.angularTopBar} ${isAngularScrolledHidden ? styles.angularTopBarHidden : ''}`}
                  >
                    <div className={styles.angularBrandRow}>
                      <span className={styles.angularBrandLogo}>GURUDEVI</span>

                      {/* REALM SWITCHER TABS (CRISP ANGULAR) */}
                      <nav className={styles.angularRealmTabs} aria-label="Sanctuary Realms">
                        {[
                          { id: 'self', label: 'Self', icon: '🪷' },
                          { id: 'workspace', label: 'Workspace', icon: '🏫' },
                          { id: 'community', label: 'Community', icon: '🌐' },
                          { id: 'library', label: 'Library', icon: '📚' },
                        ].map((realm) => (
                          <button
                            key={realm.id}
                            type="button"
                            className={`${styles.angularRealmTab} ${selectedAngularDomain === realm.id ? styles.angularRealmTabActive : ''}`}
                            onClick={() => {
                              setSelectedAngularDomain(realm.id);
                              setAngularActiveTaskKey('overview');
                            }}
                          >
                            <span>{realm.icon}</span>
                            <span>{realm.label}</span>
                          </button>
                        ))}
                      </nav>
                    </div>

                    <div className={styles.angularControlsRow}>
                      <span className={styles.angularTimeBadge}>
                        <Clock size={12} />
                        <span>{activeTime}</span>
                      </span>

                      <button
                        type="button"
                        className={styles.angularStudioBtn}
                        onClick={() => {
                          setDrawerTab('preferences');
                          setIsDrawerOpen(true);
                        }}
                      >
                        <SlidersHorizontal size={13} />
                        <span>Studio (···)</span>
                      </button>
                    </div>
                  </div>

                  {/* ANGULAR SUBTASK STRIP BLADE (DYNAMICALLY BELONGS TO ACTIVE REALM) */}
                  <div
                    className={`${styles.angularSubtaskBlade} ${isAngularScrolledHidden ? styles.angularSubtaskBladeHidden : ''}`}
                  >
                    <div className={styles.angularSubtaskList}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#a85022', letterSpacing: '0.06em', marginRight: '0.4rem' }}>
                        {selectedAngularDomain.toUpperCase()} TABS:
                      </span>
                      {(angularTasksMap[selectedAngularDomain] ?? []).map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          className={`${styles.angularSubtaskTab} ${angularActiveTaskKey === task.id ? styles.angularSubtaskTabActive : ''}`}
                          onClick={() => setAngularActiveTaskKey(task.id)}
                        >
                          <span>{task.icon}</span>
                          <span>{task.label}</span>
                          {task.id !== 'overview' && (
                            <span
                              className={styles.angularSubtaskClose}
                              onClick={(e) => {
                                e.stopPropagation();
                                closeAngularTask(selectedAngularDomain, task.id);
                              }}
                              title="Close tab"
                            >
                              ✕
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <span style={{ fontSize: '0.72rem', color: '#78716c', fontStyle: 'italic' }}>
                      {isAngularScrolledHidden ? 'Hidden on scroll' : 'Auto-hides on scroll down'}
                    </span>
                  </div>

                  {/* SCROLL SENSOR TEST BAR */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.2rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#78716c' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: '#131e27' }}>Scroll & Proximity Test:</span>
                      <button
                        type="button"
                        onClick={() => setIsAngularScrolledHidden(!isAngularScrolledHidden)}
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          border: '1px solid #d6d3d1',
                          background: isAngularScrolledHidden ? '#131e27' : '#ffffff',
                          color: isAngularScrolledHidden ? '#ffffff' : '#131e27',
                          fontWeight: 600,
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                        }}
                      >
                        {isAngularScrolledHidden ? '⬆️ Move Mouse Near Top Edge (Reveal)' : '⬇️ Scroll Down Canvas (Auto-Hide Bars)'}
                      </button>
                    </div>

                    <span style={{ color: '#166534', fontWeight: 600 }}>
                      ✦ Flat Slender Bars (38px + 34px) · Zero Curvy Bubbles · Crisp 4px Radii
                    </span>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------ */}
              {/* SAMPLE FLOOR CONTENT CARDS */}
              {/* ------------------------------------------------------------ */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716c' }}>
                    Active Floor Sections
                  </span>
                  {isArrangeMode && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a85022' }}>
                      ⇄ Hold & Drag cards to reorganize
                    </span>
                  )}
                </div>

                <div className={styles.sampleCardsGrid}>
                  {furnitureList.map((item, idx) => (
                    <div
                      key={item.id}
                      className={styles.sampleCard}
                      style={{
                        border: isArrangeMode ? '2px dashed #a85022' : undefined,
                        cursor: isArrangeMode ? 'grab' : 'default',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                          <h3 className={styles.sampleCardTitle}>{item.label}</h3>
                        </div>
                        {item.pinned && <Pin size={12} color="#a85022" />}
                      </div>
                      <p className={styles.sampleCardBody}>
                        Card state active. Rendered within the canvas ground with dynamic glass reflections.
                      </p>
                      {isArrangeMode && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => moveItem(idx, 'up')}
                            disabled={idx === 0}
                            style={{ padding: '0.2rem 0.5rem', borderRadius: '0.4rem', border: '1px solid #d6d3d1', cursor: 'pointer' }}
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(idx, 'down')}
                            disabled={idx === furnitureList.length - 1}
                            style={{ padding: '0.2rem 0.5rem', borderRadius: '0.4rem', border: '1px solid #d6d3d1', cursor: 'pointer' }}
                          >
                            <ChevronDown size={12} />
                          </button>
                          <span style={{ fontSize: '0.75rem', color: '#78716c' }}>Position #{idx + 1}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* IDEA 5: DYNAMIC BOTTOM DOCK (MENU + PROXIMITY-PEEK SUBTASK STRIP) */}
              {/* ------------------------------------------------------------ */}
              {activeArchetype === 'dock' && (
                <div
                  className={styles.bottomDockWrapper}
                  onMouseEnter={handleDockMouseEnter}
                  onMouseLeave={handleDockMouseLeave}
                >
                  {/* EXPANDABLE PROXIMITY-PEEK SUBTASK FLYOUT */}
                  {(isSubtaskPinned || isDockHovered || isBottomSubtaskOpen) && (
                    <div className={styles.subtaskFlyout}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a85022', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 0.4rem' }}>
                        Tasks:
                      </span>
                      {openTasks.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setActiveTaskKey(t.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '0.45rem',
                            border: '1px solid',
                            borderColor: activeTaskKey === t.id ? '#a85022' : 'transparent',
                            background: activeTaskKey === t.id ? '#ffffff' : 'transparent',
                            color: activeTaskKey === t.id ? '#a85022' : '#57534e',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                          }}
                        >
                          <span>{t.icon}</span>
                          <span>{t.label}</span>
                          {t.id !== 'overview' && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                closeTask(t.id);
                              }}
                              style={{ opacity: 0.6, marginLeft: '0.2rem' }}
                            >
                              ✕
                            </span>
                          )}
                        </button>
                      ))}

                      {/* PIN / AUTO-STOW TOGGLE */}
                      <button
                        type="button"
                        className={`${styles.pinToggleBtn} ${isSubtaskPinned ? styles.pinToggleBtnActive : ''}`}
                        onClick={() => setIsSubtaskPinned(!isSubtaskPinned)}
                        title={isSubtaskPinned ? "Pinned permanently open. Click to enable Auto-Peek on hover." : "Auto-stowing on idle. Click to pin open."}
                      >
                        <Pin size={11} />
                        <span>{isSubtaskPinned ? 'Pinned' : 'Auto-Peek'}</span>
                      </button>
                    </div>
                  )}

                  {/* FLOATING PERSISTENT BOTTOM DOCK */}
                  <div className={styles.bottomDock}>
                    {[
                      { id: 'self', label: 'Self', icon: '🪷' },
                      { id: 'workspace', label: 'Workspace', icon: '🏫' },
                      { id: 'community', label: 'Community', icon: '🌐' },
                      { id: 'library', label: 'Library', icon: '📚' },
                    ].map((realm) => (
                      <button
                        key={realm.id}
                        type="button"
                        className={`${styles.bottomDockItem} ${activeBottomRealm === realm.id ? styles.bottomDockItemActive : ''}`}
                        onClick={() => setActiveBottomRealm(realm.id as any)}
                      >
                        <span>{realm.icon}</span>
                        <span>{realm.label}</span>
                      </button>
                    ))}

                    <div className={styles.bottomDockDivider} />

                    <button
                      type="button"
                      className={styles.subtaskExpanderBtn}
                      onClick={() => setIsBottomSubtaskOpen(!isBottomSubtaskOpen)}
                      title={isBottomSubtaskOpen ? 'Click to collapse tasks' : 'Click to peek tasks (or hover over dock)'}
                    >
                      <span>{(isSubtaskPinned || isDockHovered || isBottomSubtaskOpen) ? '▼' : '▲'}</span>
                      <span>{openTasks.length} {openTasks.length === 1 ? 'Task' : 'Tasks'}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </Surface>

        {/* ==================================================================== */}
        {/* THE THREE-DOTS SIDE PANEL DRAWER / MODAL COMPONENT */}
        {/* ==================================================================== */}
        {isDrawerOpen && (
          <div
            className={panelMode === 'drawer' ? styles.drawerBackdrop : styles.modalBackdrop}
            onClick={() => setIsDrawerOpen(false)}
          >
            <div
              className={panelMode === 'drawer' ? styles.sideDrawerPanel : styles.modalPanel}
              onClick={(e) => e.stopPropagation()}
            >
              {/* DRAWER HEADER */}
              <div className={styles.drawerHeader}>
                <div>
                  <h2 className={styles.drawerTitle}>Floor Studio & Customization</h2>
                  <p className={styles.drawerSubtitle}>
                    All floor appearance, arrangement, and spatial settings consolidated in one place.
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={() => setIsDrawerOpen(false)}
                  aria-label="Close Floor Studio"
                >
                  <X size={16} />
                </button>
              </div>

              {/* DRAWER NAVIGATION TABS */}
              <div className={styles.drawerNavTabs}>
                <button
                  type="button"
                  className={`${styles.drawerTabBtn} ${drawerTab === 'atmosphere' ? styles.drawerTabBtnActive : ''}`}
                  onClick={() => setDrawerTab('atmosphere')}
                >
                  <Palette size={14} />
                  <span>Atmosphere & Scene</span>
                </button>
                <button
                  type="button"
                  className={`${styles.drawerTabBtn} ${drawerTab === 'furniture' ? styles.drawerTabBtnActive : ''}`}
                  onClick={() => setDrawerTab('furniture')}
                >
                  <Layers size={14} />
                  <span>Layout & Sections</span>
                </button>
                <button
                  type="button"
                  className={`${styles.drawerTabBtn} ${drawerTab === 'preferences' ? styles.drawerTabBtnActive : ''}`}
                  onClick={() => setDrawerTab('preferences')}
                >
                  <Settings2 size={14} />
                  <span>Preferences</span>
                </button>
              </div>

              {/* DRAWER BODY CONTENT */}
              <div className={styles.drawerBody}>
                {/* TAB 1: ATMOSPHERE & SCENE */}
                {drawerTab === 'atmosphere' && (
                  <>
                    <div className={styles.drawerSection}>
                      <h4 className={styles.drawerSectionHeading}>Sanctuary World</h4>
                      <div className={styles.itemGrid}>
                        {[
                          { id: 'sanctuary', name: 'Sanctuary', desc: 'Serene temple grounds' },
                          { id: 'wewa', name: 'Wewa Lake', desc: 'Reflective water horizon' },
                          { id: 'kandyan', name: 'Kandyan Hills', desc: 'Misty highlands & terrace' },
                          { id: 'kele', name: 'Kele Rainforest', desc: 'Deep canopy wilderness' },
                        ].map((w) => (
                          <button
                            key={w.id}
                            type="button"
                            className={`${styles.optionCard} ${selectedWorld === w.id ? styles.optionCardActive : ''}`}
                            onClick={() => setSelectedWorld(w.id)}
                          >
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{w.name}</span>
                            <span style={{ fontSize: '0.75rem', color: '#78716c' }}>{w.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={styles.drawerSection}>
                      <h4 className={styles.drawerSectionHeading}>Sky & Lighting Preset</h4>
                      <div className={styles.itemGrid}>
                        {[
                          { id: 'dawn', label: 'Dawn Mist', icon: '🌅' },
                          { id: 'day', label: 'Solar Zenith', icon: '☀️' },
                          { id: 'dusk', label: 'Amber Twilight', icon: '🌇' },
                          { id: 'night', label: 'Starlit Silence', icon: '🌙' },
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className={`${styles.optionCard} ${selectedPreset === p.id ? styles.optionCardActive : ''}`}
                            onClick={() => setSelectedPreset(p.id)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span>{p.icon}</span>
                              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{p.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 2: FURNITURE & LAYOUT */}
                {drawerTab === 'furniture' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#131e27' }}>
                        In-Place Drag Mode
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsArrangeMode(!isArrangeMode);
                          setIsDrawerOpen(false);
                        }}
                        style={{
                          padding: '0.35rem 0.85rem',
                          borderRadius: '999px',
                          border: '1px solid #a85022',
                          background: isArrangeMode ? '#a85022' : '#ffffff',
                          color: isArrangeMode ? '#ffffff' : '#a85022',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        {isArrangeMode ? 'Exit Drag Mode' : 'Toggle Drag Mode on Canvas'}
                      </button>
                    </div>

                    <div className={styles.drawerSection}>
                      <h4 className={styles.drawerSectionHeading}>Floor Sections & Visibility</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {furnitureList.map((item, idx) => (
                          <div key={item.id} className={styles.furnitureListItem}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>{item.icon}</span>
                              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.label}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <button
                                type="button"
                                onClick={() => togglePin(item.id)}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  padding: '0.2rem',
                                  color: item.pinned ? '#a85022' : '#a8a29e',
                                }}
                                title={item.pinned ? 'Pinned to top' : 'Unpinned'}
                              >
                                <Pin size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveItem(idx, 'up')}
                                disabled={idx === 0}
                                style={{
                                  padding: '0.2rem 0.4rem',
                                  borderRadius: '0.3rem',
                                  border: '1px solid #d6d3d1',
                                  background: '#fff',
                                  cursor: 'pointer',
                                }}
                              >
                                <ChevronUp size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveItem(idx, 'down')}
                                disabled={idx === furnitureList.length - 1}
                                style={{
                                  padding: '0.2rem 0.4rem',
                                  borderRadius: '0.3rem',
                                  border: '1px solid #d6d3d1',
                                  background: '#fff',
                                  cursor: 'pointer',
                                }}
                              >
                                <ChevronDown size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 3: SPATIAL PREFERENCES */}
                {drawerTab === 'preferences' && (
                  <div className={styles.drawerSection}>
                    <h4 className={styles.drawerSectionHeading}>Spatial Ergonomics Defaults</h4>
                    <p style={{ fontSize: '0.8125rem', color: '#57534e', margin: 0, lineHeight: 1.4 }}>
                      Enforcing a maximum VSR of 1.2% ensures your floor tools never overshadow your primary content.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <div className={styles.furnitureListItem}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Clock Dial Display</span>
                        <select
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.4rem',
                            border: '1px solid #d6d3d1',
                            fontSize: '0.8rem',
                          }}
                        >
                          <option>Horizontal Glanceable (Nano)</option>
                          <option>Two-Row Stepper (Compact)</option>
                          <option>Hidden (Reveal on hover)</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFurnitureList(INITIAL_FURNITURE);
                          setIsArrangeMode(false);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          padding: '0.65rem 1rem',
                          borderRadius: '0.75rem',
                          border: '1px solid #e7e5e4',
                          background: '#ffffff',
                          color: '#b91c1c',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                          marginTop: '1rem',
                        }}
                      >
                        <RotateCcw size={14} />
                        <span>Reset Floor Layout to Default</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MACRO SPATIAL CO-DESIGN: MAIN MENU + TASK STRIP + RECEPTION BAR */}
        {/* ==================================================================== */}
        <Surface tone="raised" style={{ padding: '1.75rem', borderRadius: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a85022', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Macro Spatial Architecture
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0.2rem 0 0.4rem 0', color: '#131e27' }}>
                Co-Designing Main Menu + Task Strip + Reception Bar
              </h2>
              <p style={{ color: '#57534e', margin: 0, fontSize: '0.9rem', maxWidth: '780px', lineHeight: 1.5 }}>
                Instead of treating the Reception Bar as an isolated layer beneath a separate Main Menu and a separate Task Strip,
                co-designing them into a single dynamic horizon saves over <strong>130px of vertical space</strong> and prevents "Layer Cake Header Bloat".
              </p>
            </div>

            {/* CO-DESIGN MODE TOGGLE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f5f5f4', padding: '0.3rem', borderRadius: '999px' }}>
              <button
                type="button"
                onClick={() => setCoDesignMode('stacked')}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  border: 'none',
                  background: coDesignMode === 'stacked' ? '#131e27' : 'transparent',
                  color: coDesignMode === 'stacked' ? '#ffffff' : '#78716c',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                ⚠️ 3-Tier Stacked (~185px)
              </button>
              <button
                type="button"
                onClick={() => setCoDesignMode('unified')}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  border: 'none',
                  background: coDesignMode === 'unified' ? '#131e27' : 'transparent',
                  color: coDesignMode === 'unified' ? '#ffffff' : '#78716c',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                ✨ Top Horizon (48px)
              </button>
              <button
                type="button"
                onClick={() => setCoDesignMode('dock')}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  border: 'none',
                  background: coDesignMode === 'dock' ? '#a85022' : 'transparent',
                  color: coDesignMode === 'dock' ? '#ffffff' : '#78716c',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                🧭 Top Anchor + Bottom Dock (Proximity Peek)
              </button>
            </div>
          </div>

          {/* SIMULATED STACK OR UNIFIED DEMO */}
          {coDesignMode === 'stacked' ? (
            <div className={styles.layerStackBox}>
              <span className={styles.layerBadge}>Combined Height ~185px · Stacked Clutter</span>

              {/* TIER 1: MAIN NAVIGATION */}
              <div className={styles.tierBar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: 800, color: '#131e27' }}>GURUDEVI</span>
                  <div style={{ display: 'flex', gap: '0.5rem', color: '#78716c', fontWeight: 600, fontSize: '0.8rem' }}>
                    <span style={{ color: '#131e27', fontWeight: 700 }}>🪷 Self</span>
                    <span>🏫 Workspace</span>
                    <span>🌐 Community</span>
                    <span>📚 Library</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#a8a29e' }}>Tier 1: Global Menu Bar (48px)</span>
              </div>

              {/* TIER 2: TASK STRIP */}
              <div className={styles.tierBar} style={{ background: '#fafaf9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {openTasks.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTaskKey(t.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.3rem 0.65rem',
                        borderRadius: '0.4rem',
                        border: '1px solid',
                        borderColor: activeTaskKey === t.id ? '#a85022' : '#e7e5e4',
                        background: activeTaskKey === t.id ? '#fff' : 'transparent',
                        color: activeTaskKey === t.id ? '#a85022' : '#57534e',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                      {t.id !== 'overview' && (
                        <span onClick={(e) => { e.stopPropagation(); closeTask(t.id); }} style={{ opacity: 0.6 }}>✕</span>
                      )}
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#a8a29e' }}>Tier 2: Local Task Strip (42px)</span>
              </div>

              {/* TIER 3: FLOOR RECEPTION BAR */}
              <div className={styles.tierBar} style={{ background: '#ffffff', minHeight: '52px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#131e27' }}>
                    Good afternoon, Guest Explorer
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>🕒 15:23</span>
                  <button type="button" style={{ padding: '0.2rem 0.5rem', borderRadius: '999px', border: '1px solid #d6d3d1', fontSize: '0.75rem' }}>
                    Arrange Floor
                  </button>
                  <button type="button" style={{ padding: '0.2rem 0.5rem', borderRadius: '999px', border: '1px solid #d6d3d1', fontSize: '0.75rem' }}>
                    Floor Studio
                  </button>
                  <span style={{ fontSize: '0.72rem', color: '#a8a29e' }}>Tier 3: Floor Header (55px)</span>
                </div>
              </div>
            </div>
          ) : coDesignMode === 'unified' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className={styles.unifiedSingleHorizon}>
                {/* LEFT: REALM SELECTOR PILL */}
                <div className={styles.unifiedLeftSection}>
                  <button type="button" className={styles.realmDropdownPill} title="Switch active realm">
                    <span>🪷 Self</span>
                    <span style={{ fontSize: '0.65rem' }}>▾</span>
                  </button>

                  {/* CENTER: DYNAMIC TASK TABS */}
                  <div className={styles.unifiedTaskTabs}>
                    {openTasks.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        className={`${styles.unifiedTaskTab} ${activeTaskKey === task.id ? styles.unifiedTaskTabActive : ''}`}
                        onClick={() => setActiveTaskKey(task.id)}
                      >
                        <span>{task.icon}</span>
                        <span>{task.label}</span>
                        {task.id !== 'overview' && (
                          <span
                            className={styles.unifiedTaskClose}
                            onClick={(e) => {
                              e.stopPropagation();
                              closeTask(task.id);
                            }}
                            title="Close tab"
                          >
                            ✕
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* RIGHT: CONTEXTUAL RECEPTION GLANCE + THREE-DOTS STUDIO */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {activeTaskKey === 'overview' && (
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.825rem', color: '#57534e', fontStyle: 'italic', display: 'none' /* hidden on small */ }}>
                      "Steady mindful steps"
                    </span>
                  )}

                  <button
                    type="button"
                    className={styles.capsuleTimePill}
                    onClick={() => {
                      setDrawerTab('preferences');
                      setIsDrawerOpen(true);
                    }}
                  >
                    <Clock size={12} />
                    <span>{activeTime}</span>
                  </button>

                  <button
                    type="button"
                    className={styles.dotsTrigger}
                    onClick={() => setIsDrawerOpen(true)}
                    style={{ width: '2rem', height: '2rem' }}
                    title="Open comprehensive Floor Studio & Customization Drawer"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem', fontSize: '0.75rem', color: '#78716c' }}>
                <span>
                  ✦ <strong>Single 48px Horizon</strong>: Global navigation, local task tabs, and floor studio merged seamlessly.
                </span>
                <span style={{ color: '#166534', fontWeight: 700 }}>
                  Saves 137px vertical screen real estate (74% reduction)
                </span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#faf8f5', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #e7e5e4' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e7e5e4', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a85022', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Top Anchor (Horizon Sky) + Bottom Proximity Dock (Ergonomic)
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534' }}>
                  Technical Term: Progressive Proximity Disclosure (Spring-Loaded Auto-Stow)
                </span>
              </div>

              {/* TOP ANCHOR PREVIEW */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.8rem', background: '#ffffff', borderRadius: '0.75rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.875rem' }}>
                  🌅 Good afternoon, Guest Explorer · Self
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>🕒 15:23</span>
                  <button type="button" style={{ padding: '0.2rem 0.5rem', borderRadius: '999px', border: '1px solid #d6d3d1', fontSize: '0.75rem' }}>
                    ···
                  </button>
                </div>
              </div>

              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#a8a29e', fontSize: '0.8125rem', border: '1px dashed #d6d3d1', borderRadius: '0.75rem' }}>
                ✦ 100% Uninterrupted Floor Canvas & Scenic Artwork (Zero Top Ceiling) ✦
              </div>

              {/* BOTTOM DOCK PREVIEW */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.6rem', borderRadius: '0.5rem', background: '#ffffff', border: '1px solid #e7e5e4', fontSize: '0.75rem' }}>
                  <span style={{ color: '#a85022', fontWeight: 700 }}>Proximity Peek:</span>
                  <span>[ 🪷 Overview ] [ ⚡ Rhythm ✕ ] [ 🪞 Reflect ✕ ]</span>
                  <span style={{ color: '#78716c', fontSize: '0.68rem' }}>(Auto-stows on idle · reveals on hover)</span>
                </div>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.85rem', borderRadius: '999px', background: '#131e27', color: '#fff', fontSize: '0.8125rem', fontWeight: 600 }}>
                  <span>🪷 Self</span>
                  <span>🏫 Workspace</span>
                  <span>🌐 Community</span>
                  <span>📚 Library</span>
                  <span style={{ opacity: 0.4 }}>|</span>
                  <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>▲ 2 Tasks</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#57534e', borderTop: '1px solid #e7e5e4', paddingTop: '0.5rem' }}>
                <span>
                  ✦ <strong>Zero Ceiling</strong>: Natural eye rest at top horizon; physical action in bottom thumb/dock zone.
                </span>
                <span style={{ color: '#166534', fontWeight: 700 }}>
                  1:1 Mental Model Parity with Mobile Bottom Navigation
                </span>
              </div>
            </div>
          )}
        </Surface>

        {/* ==================================================================== */}
        {/* STANDALONE TEMPORAL TIERS LAB (PRESERVED UNDER DELETION VETO) */}
        {/* ==================================================================== */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid #e7e5e4', paddingTop: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#131e27' }}>
            Standalone Temporal Instruments Reference
          </h2>
          <p style={{ color: '#57534e', margin: '0 0 1.5rem 0', fontSize: '0.9rem' }}>
            Reference gauges from the spatial ergonomics specification for individual scalar time instruments.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* AUTO ADAPTIVE CONTAINER QUERY HARNESS */}
            <Surface tone="raised" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Auto · Container Query Adaptive
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.2rem 0 0 0', color: '#131e27' }}>
                    formFactor="auto" (Nano below 360px · Compact above 360px)
                  </h3>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.6rem', borderRadius: '999px', background: '#e0f2fe', color: '#0369a1' }}>
                  Zero JS Hydration Lag
                </span>
              </div>

              <div style={{ padding: '2rem', background: '#ffffff', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #d6d3d1' }}>
                <DateTimeCombo
                  date={activeDate}
                  time={activeTime}
                  onSelectDate={setActiveDate}
                  onTimeChange={setActiveTime}
                  formFactor="auto"
                  allowDismiss={false}
                />
              </div>
            </Surface>

            {/* STANDALONE NANO TIER */}
            <Surface tone="raised" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a85022', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Tier 0 · Standalone
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.2rem 0 0 0', color: '#131e27' }}>
                    Nano Pill (Horizontal: Clock on Left + Day/Date on Right)
                  </h3>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.6rem', borderRadius: '999px', background: '#dcfce7', color: '#166534' }}>
                  Micro Footprint ~0.35%
                </span>
              </div>

              <div style={{ padding: '2rem', background: '#ffffff', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #d6d3d1' }}>
                <DateTimeCombo
                  date={activeDate}
                  time={activeTime}
                  onSelectDate={setActiveDate}
                  onTimeChange={setActiveTime}
                  formFactor="nano"
                  allowDismiss={false}
                />
              </div>
            </Surface>
          </div>
        </div>

      </div>
    </div>
  );
}
