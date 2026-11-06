'use client';

import { useState, useMemo } from 'react';
import * as webKit from '@repo/ui/components/web';
import { WorldScope } from '@repo/ui/theme/web';
import { WORLD_IDS, WORLDS } from '@repo/ui/theme';
import type { WorldId, Phase, WorldMode, BadgeTone } from '@repo/ui/theme';
import type { ChatPrivacy, ScrollAreaVariant } from '@repo/ui/theme/contracts';
import { ScrollArea } from '@repo/ui/components/web';
import { Date, Time, DateTimeCombo } from '@repo/ui/components/web';
import { KitTableOfContents } from './components/KitTableOfContents';
import { PracticeCardCandidates } from './components/PracticeCardCandidates';
import { LanguageExhibition } from './components/LanguageExhibition';

const PHASES: Phase[] = ['predawn', 'dawn', 'morning', 'afternoon', 'dusk', 'night'];
const VIEWPORT_WIDTHS = [
  { label: 'Full', value: '100%' },
  { label: '320px (Narrow)', value: '320px' },
  { label: '360px (Standard)', value: '360px' },
  { label: '430px (Max)', value: '430px' },
  { label: '768px (Tablet)', value: '768px' },
  { label: '1280px (Desktop)', value: '1280px' },
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'si', label: 'à·ƒà·’à¶‚à·„à¶½ (Sinhala)' },
  { code: 'ta', label: 'à®¤à®®à®¿à®´à¯ (Tamil)' },
] as const;

type LangCode = (typeof LANGUAGES)[number]['code'];

export function KitGalleryClient() {
  // Theme Controls
  const [world, setWorld] = useState<WorldId>('sanctuary');
  const [phase, setPhase] = useState<Phase>('morning');
  const [mode, setMode] = useState<WorldMode>('light');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedTransparency, setReducedTransparency] = useState(false);
  const [lang, setLang] = useState<LangCode>('en');
  const [viewportWidth, setViewportWidth] = useState('100%');

  // Interactive component states
  const [btnLoading, setBtnLoading] = useState(false);
  const [checkVal, setCheckVal] = useState(true);
  const [switchVal, setSwitchVal] = useState(true);
  const [textInput, setTextInput] = useState('Typing in the world');
  const [richText, setRichText] = useState('## Notes\nMarkdown text rendered here.');
  const [scaleVal, setScaleVal] = useState(4);
  const [choiceVal, setChoiceVal] = useState<string[]>(['opt1']);
  const [activeTab, setActiveTab] = useState('tab1');
  const [taskTabs, setTaskTabs] = useState([
    { id: 'task-1', title: 'Analysis' },
    { id: 'task-2', title: 'Refactor Plan' },
    { id: 'task-3', title: 'Evidence' },
  ]);
  const [activeTaskId, setActiveTaskId] = useState('task-1');
  const [fabOpen, setFabOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [privacyMode, setPrivacyMode] = useState<ChatPrivacy>('saved');

  // Agent interactive states
  const [approvalState, setApprovalState] = useState<'pending' | 'submitting' | 'accepted' | 'discarded' | 'expired'>('pending');
  const [toolState, setToolState] = useState<'running' | 'done' | 'failed'>('running');
  const [composerText, setComposerText] = useState('');
  const [composerBusy, setComposerBusy] = useState(false);

  // Stress bench state
  const [stressCount, setStressCount] = useState(500);
  const [isBenchStreaming, setIsBenchStreaming] = useState(false);
  const [galleryDate, setGalleryDate] = useState('2026-11-01');

  // ScrollArea interactive demo state
  const [scrollVariant, setScrollVariant] = useState<ScrollAreaVariant>('sovereign');
  const [scrollVisibility, setScrollVisibility] = useState<'always' | 'hover'>('always');
  const [scrollTone, setScrollTone] = useState<'lamp' | 'quiet' | 'signal'>('lamp');
  const [scrollOrientation, setScrollOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [selectedScrollCard, setSelectedScrollCard] = useState<number | null>(null);
  const [scrollLastAction, setScrollLastAction] = useState<string>('Ready: scroll with wheel or drag canvas');

  // Mock messages for MessageList
  const mockMessages = useMemo(() => {
    return Array.from({ length: stressCount }, (_, i) => ({
      id: `msg-${i}`,
      author: i % 2 === 0 ? ('self' as const) : ('assistant' as const),
      content: `Message ${i + 1}: ${
        i % 2 === 0
          ? 'Requesting verified telemetry ledger update.'
          : 'Telemetry check passed: G4 browser environment validated with zero dropped frames.'
      }`,
      time: '12:00 PM',
      state: (i === stressCount - 1 && isBenchStreaming ? 'streaming' : 'complete') as 'streaming' | 'complete',
    }));
  }, [stressCount, isBenchStreaming]);

  // Mock items for Carousel and Rail
  const showcaseItems = useMemo(
    () => [
      { id: '1', title: 'First Artifact', subtitle: 'Verified at G1' },
      { id: '2', title: 'Second Artifact', subtitle: 'Verified at G4' },
      { id: '3', title: 'Third Artifact', subtitle: 'Verified at G5' },
    ],
    [],
  );

  return (
    <WorldScope
      world={world}
      mode={mode}
      phase={phase}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        background: 'var(--w-ground, #0e1117)',
        color: 'var(--w-ink, #e6edf3)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Dev Gallery Sticky Control Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          padding: '12px 20px',
          background: 'rgba(17, 24, 39, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #374151',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px 20px',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        <div>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#60a5fa' }}>UI Kit Gallery</span>
          <span
            style={{
              marginLeft: '8px',
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '4px',
              background: '#065f46',
              color: '#34d399',
              fontWeight: 600,
            }}
          >
            DEV MODE (G4)
          </span>
        </div>

        {/* World Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label htmlFor="world-select" style={{ fontSize: '12px', color: '#9ca3af' }}>
            World:
          </label>
          <select
            id="world-select"
            value={world}
            onChange={(e) => setWorld(e.target.value as WorldId)}
            style={{
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '13px',
            }}
          >
            {WORLD_IDS.map((id) => (
              <option key={id} value={id}>
                {WORLDS[id].names[lang] || id} ({id})
              </option>
            ))}
          </select>
        </div>

        {/* Phase Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label htmlFor="phase-select" style={{ fontSize: '12px', color: '#9ca3af' }}>
            Phase:
          </label>
          <select
            id="phase-select"
            value={phase}
            onChange={(e) => setPhase(e.target.value as Phase)}
            style={{
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '13px',
            }}
          >
            {PHASES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label htmlFor="mode-select" style={{ fontSize: '12px', color: '#9ca3af' }}>
            Mode:
          </label>
          <select
            id="mode-select"
            value={mode}
            onChange={(e) => setMode(e.target.value as WorldMode)}
            style={{
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '13px',
            }}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        {/* Language Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label htmlFor="lang-select" style={{ fontSize: '12px', color: '#9ca3af' }}>
            Lang:
          </label>
          <select
            id="lang-select"
            value={lang}
            onChange={(e) => setLang(e.target.value as LangCode)}
            style={{
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '13px',
            }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Viewport Simulation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label htmlFor="viewport-select" style={{ fontSize: '12px', color: '#9ca3af' }}>
            Viewport:
          </label>
          <select
            id="viewport-select"
            value={viewportWidth}
            onChange={(e) => setViewportWidth(e.target.value)}
            style={{
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '13px',
            }}
          >
            {VIEWPORT_WIDTHS.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {/* Accessibility Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
            />
            Contrast: More
          </label>
          <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={reducedTransparency}
              onChange={(e) => setReducedTransparency(e.target.checked)}
            />
            Transparency: Reduced
          </label>
        </div>
      </header>

      {/* Main Viewport Container with Sidebar TOC */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, height: 'calc(100vh - 65px)', maxHeight: 'calc(100vh - 65px)', overflow: 'hidden' }}>
        {/* Living TOC Sidebar on Main /kit route */}
        <aside
          style={{
            width: '280px',
            flexShrink: 0,
            borderRight: '1px solid var(--w-line)',
            background: 'var(--w-ground)',
            height: '100%',
            maxHeight: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <KitTableOfContents />
        </aside>

        {/* Main Content Viewport */}
        <main
          id="kit-main-scroll"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxHeight: '100%',
            minHeight: 0,
            minWidth: 0,
            background: 'var(--w-ground)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <ScrollArea
            orientation="vertical"
            variant="sovereign"
            tone="lamp"
            scrollbarVisibility="always"
            label="UI Kit Gallery Scroll Area"
            style={{ height: '100%', width: '100%' }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: '24px 24px',
              }}
            >
              <div
                style={{
                  width: viewportWidth,
                  maxWidth: '100%',
                  transition: 'width 0.25s ease-in-out',
                  boxShadow: viewportWidth !== '100%' ? '0 0 24px rgba(0,0,0,0.6)' : undefined,
                  borderRadius: viewportWidth !== '100%' ? '12px' : 0,
                  overflow: 'hidden',
                }}
              >
          <div
            style={{
              padding: '32px 24px',
              minHeight: '100%',
              ...(highContrast ? { filter: 'contrast(1.25)' } : {}),
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              
              {/* SECTION: App Shell & Headers */}
              <section>
                <webKit.Text kind="title">
                  App Shell & Navigation
                </webKit.Text>
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div id="app-header">
                    <webKit.AppHeader
                    title="Sanctuary Dev Dashboard"
                    actions={[
                      {
                        key: 'search',
                        label: 'Search ledger',
                        icon: () => <span>ðŸ”</span>,
                        onPress: () => alert('Search clicked'),
                      },
                      {
                        key: 'settings',
                        label: 'Settings',
                        icon: () => <span>âš™ï¸</span>,
                        onPress: () => alert('Settings clicked'),
                      },
                    ]}
                  />
                  </div>

                  <div id="task-tabs">
                  <webKit.TaskTabs
                    label="Active Tasks"
                    home={{ label: 'Overview', selected: activeTaskId === 'home', onPress: () => setActiveTaskId('home') }}
                    tabs={taskTabs}
                    activeId={activeTaskId}
                    onSelect={(id) => setActiveTaskId(id)}
                    onClose={(id) => setTaskTabs((t) => t.filter((x) => x.id !== id))}
                    onReorder={(id, to) => {
                      const copy = [...taskTabs];
                      const from = copy.findIndex((t) => t.id === id);
                      if (from >= 0) {
                        const [moved] = copy.splice(from, 1);
                        if (moved) {
                          copy.splice(to, 0, moved);
                          setTaskTabs(copy);
                        }
                      }
                    }}
                  />
                  </div>

                  <div id="breadcrumb">
                  <webKit.Breadcrumb
                    items={[
                      { label: 'Sanctuary', href: '#' },
                      { label: 'Dev Kit', href: '#' },
                      { label: 'Showcase' },
                    ]}
                  />
                  </div>
                </div>
              </section>

              {/* SECTION: Temporal Horizon & Phase Architecture (DateTime / Past-Future) */}
              <section id="temporal" style={{ border: '1px solid rgba(226, 195, 122, 0.35)', padding: '24px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.02)' }}>
                <webKit.Inline gap="between" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap' }}>
                  <div>
                    <webKit.Text kind="title">
                      Temporal Horizon & Phase Architecture (DateTime / Pastâ€“Future)
                    </webKit.Text>
                    <webKit.Text kind="caption">
                      Adaptive DateTime & Phase components: Minimal Compact Pill, Full Floor Bar, and In-Situ Expandable Calendar Tray.
                    </webKit.Text>
                  </div>
                  <webKit.Badge label={`Selected: ${galleryDate}`} tone="lamp" />
                </webKit.Inline>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  {/* Master Combo: Date + Time Unified */}
                  <div id="date-time-combo">
                    <webKit.Text kind="label" style={{ marginBottom: '8px', display: 'block', color: 'var(--w-lamp, #e2c37a)' }}>
                      ✦ DateTimeCombo (Unified Date + Time with Decoupled Toggles)
                    </webKit.Text>
                    <DateTimeCombo
                      formFactor="compact"
                      date={galleryDate}
                      today="2026-11-01"
                      onSelectDate={setGalleryDate}
                      allowDismiss={true}
                    />
                  </div>

                  {/* Standalone Minimalist Time */}
                  <div id="time">
                    <webKit.Text kind="label" style={{ marginBottom: '8px', display: 'block' }}>
                      ✦ Time (Minimalist Ticking Clock + 12h/24h Toggle)
                    </webKit.Text>
                    <Time live={true} format="24h" />
                  </div>

                  {/* 0. Nano Degradation Tier */}
                  <div id="date">
                    <webKit.Text kind="label" style={{ marginBottom: '8px', display: 'block', color: 'var(--w-lamp, #e2c37a)' }}>
                      0. Nano Form Factor (Degrades Gracefully to Day Tile & Clock When Space Is Extremely Constrained)
                    </webKit.Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>Date Nano:</span>
                        <Date
                          formFactor="nano"
                          date={galleryDate}
                          today="2026-11-01"
                          onSelectDate={setGalleryDate}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>Combo Nano (Date + Live Clock):</span>
                        <DateTimeCombo
                          formFactor="nano"
                          date={galleryDate}
                          today="2026-11-01"
                          onSelectDate={setGalleryDate}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1. Micro Compact Pill */}
                  <div>
                    <webKit.Text kind="label" style={{ marginBottom: '8px', display: 'block' }}>
                      1. Ultra-Compact Micro Pill (Zero-Slop, Hugs Content Width Strictly)
                    </webKit.Text>
                    <Date
                      formFactor="compact"
                      date={galleryDate}
                      today="2026-11-01"
                      onSelectDate={setGalleryDate}
                    />
                  </div>

                  {/* 1.5. Medium Window Bar */}
                  <div>
                    <webKit.Text kind="label" style={{ marginBottom: '8px', display: 'block' }}>
                      2. Medium Window Bar (Single-Row Adaptive Bar for Narrow & Minimized Panes)
                    </webKit.Text>
                    <Date
                      formFactor="medium"
                      date={galleryDate}
                      today="2026-11-01"
                      onSelectDate={setGalleryDate}
                    />
                  </div>

                  {/* 2. Full Floor Bar */}
                  <div>
                    <webKit.Text kind="label" style={{ marginBottom: '8px', display: 'block' }}>
                      3. Full Floor Bar (Inverted Hierarchy, Calendar on Right, Pencil Date Picker)
                    </webKit.Text>
                    <Date
                      formFactor="full"
                      date={galleryDate}
                      today="2026-11-01"
                      onSelectDate={setGalleryDate}
                    />
                  </div>

                  {/* Owned Scrollbar Demo */}
                  <div id="scroll-area" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <webKit.Text kind="label" style={{ color: 'var(--w-lamp)' }}>
                        ✦ Sovereign ScrollArea · Multi-World Living Instrument
                      </webKit.Text>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <span style={{ color: 'var(--w-ink-faint)' }}>Status:</span>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'color-mix(in srgb, var(--w-surface) 80%, transparent)', border: '1px solid var(--w-line)', color: 'var(--w-ink)', fontWeight: 600 }}>
                          {scrollLastAction}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Showcase Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px 14px', borderRadius: '8px', background: 'color-mix(in srgb, var(--w-ground) 60%, transparent)', border: '1px solid var(--w-line)' }}>
                      {/* OS Variant Archetypes Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--w-ink-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Instrument Archetype:</span>
                        {([
                          { id: 'sovereign', label: '✦ Sovereign (Living Light)' },
                          { id: 'mechanical', label: '⚙ Mechanical (3D Vernier)' },
                          { id: 'fluid', label: '💧 Wewa (Capillary Droplet)' },
                          { id: 'circadian', label: '☀️ Astral (Sundial Azimuth)' },
                          { id: 'ratna', label: '💎 Ratna (Faceted Sapphire)' },
                          { id: 'perahera', label: '🔥 Perahera (Torchlight Ember)' },
                          { id: 'leaf', label: '🍃 Bo Leaf (Sacred Botanical)' },
                          { id: 'perimeter', label: '🔲 Perimeter (Frame Ribbon)' },
                          { id: 'macos', label: ' macOS (Floating Pill)' },
                          { id: 'fluent', label: '⊞ Fluent (Win 11 Rail)' },
                          { id: 'classic', label: '🗔 Win Classic (Steppers)' },
                          { id: 'native', label: '🌐 Native OS (Browser)' },
                        ] as const).map(({ id, label }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              setScrollVariant(id);
                              setScrollLastAction(`Switched to instrument: ${id}`);
                            }}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--w-toggle-radius, 6px)',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              border: scrollVariant === id ? '1px solid var(--w-lamp)' : '1px solid var(--w-line)',
                              background: scrollVariant === id ? 'color-mix(in srgb, var(--w-lamp) 20%, transparent)' : 'transparent',
                              color: scrollVariant === id ? 'var(--w-lamp)' : 'var(--w-ink-soft)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* Orientation, Tone & Visibility Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', borderTop: '1px solid color-mix(in srgb, var(--w-line) 40%, transparent)', paddingTop: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--w-ink-soft)' }}>Orientation:</span>
                          {(['horizontal', 'vertical'] as const).map((o) => (
                            <button
                              key={o}
                              type="button"
                              onClick={() => {
                                setScrollOrientation(o);
                                setScrollLastAction(`Switched to ${o} orientation`);
                              }}
                              style={{
                                padding: '3px 10px',
                                borderRadius: 'var(--w-toggle-radius, 6px)',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                border: scrollOrientation === o ? '1px solid var(--w-lamp)' : '1px solid var(--w-line)',
                                background: scrollOrientation === o ? 'color-mix(in srgb, var(--w-lamp) 18%, transparent)' : 'transparent',
                                color: scrollOrientation === o ? 'var(--w-lamp)' : 'var(--w-ink-soft)',
                              }}
                            >
                              {o.charAt(0).toUpperCase() + o.slice(1)}
                            </button>
                          ))}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--w-ink-soft)' }}>Visibility:</span>
                          {(['always', 'hover'] as const).map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => {
                                setScrollVisibility(v);
                                setScrollLastAction(`Scrollbar visibility: ${v}`);
                              }}
                              style={{
                                padding: '3px 10px',
                                borderRadius: 'var(--w-toggle-radius, 6px)',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                border: scrollVisibility === v ? '1px solid var(--w-lamp)' : '1px solid var(--w-line)',
                                background: scrollVisibility === v ? 'color-mix(in srgb, var(--w-lamp) 18%, transparent)' : 'transparent',
                                color: scrollVisibility === v ? 'var(--w-lamp)' : 'var(--w-ink-soft)',
                              }}
                            >
                              {v.charAt(0).toUpperCase() + v.slice(1)}
                            </button>
                          ))}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--w-ink-soft)' }}>Tone:</span>
                          {(['lamp', 'quiet', 'signal'] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                setScrollTone(t);
                                setScrollLastAction(`Switched to '${t}' tone`);
                              }}
                              style={{
                                padding: '3px 10px',
                                borderRadius: 'var(--w-toggle-radius, 6px)',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                border: scrollTone === t ? '1px solid var(--w-lamp)' : '1px solid var(--w-line)',
                                background: scrollTone === t ? 'color-mix(in srgb, var(--w-lamp) 18%, transparent)' : 'transparent',
                                color: scrollTone === t ? 'var(--w-lamp)' : 'var(--w-ink-soft)',
                              }}
                            >
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Staged Interactive ScrollArea Viewport */}
                    <div
                      style={{
                        width: '100%',
                        maxWidth: scrollOrientation === 'horizontal' ? '680px' : '420px',
                        height: scrollOrientation === 'horizontal' ? '80px' : '260px',
                        border: '1px solid var(--w-line)',
                        padding: '12px',
                        borderRadius: 'var(--w-toggle-radius, 12px)',
                        background: 'color-mix(in srgb, var(--w-ground) 40%, transparent)',
                        position: 'relative',
                      }}
                    >
                      <ScrollArea
                        variant={scrollVariant}
                        orientation={scrollOrientation}
                        tone={scrollTone}
                        scrollbarVisibility={scrollVisibility}
                        showEdgeGradients={true}
                        dragToScroll={true}
                        kineticMomentum={true}
                        pips={[
                          { id: 'pip-1', label: 'Habitat 1: Dawn Awakening', offsetPct: 15 },
                          { id: 'pip-2', label: 'Habitat 5: High Noon Reflection', offsetPct: 50 },
                          { id: 'pip-3', label: 'Habitat 10: Dusk Sandhyā', offsetPct: 85 },
                        ]}
                        hudLabel={`Card #${selectedScrollCard !== null ? selectedScrollCard + 1 : 1}`}
                        label="Kit Gallery Interactive Scroll Area"
                        style={{ height: '100%', width: '100%' }}
                      >
                        {Array.from({ length: 14 }).map((_, i) => {
                          const isSelected = selectedScrollCard === i;
                          return (
                            <div
                              key={i}
                              role="button"
                              tabIndex={0}
                              onClick={() => {
                                setSelectedScrollCard(i);
                                setScrollLastAction(`Card #${i + 1} clicked cleanly (drag was not triggered)`);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  setSelectedScrollCard(i);
                                  setScrollLastAction(`Card #${i + 1} selected via keyboard`);
                                }
                              }}
                              style={{
                                padding: scrollOrientation === 'horizontal' ? '12px 18px' : '10px 14px',
                                marginBottom: scrollOrientation === 'vertical' ? '8px' : 0,
                                borderRadius: 'var(--w-toggle-radius, 8px)',
                                background: isSelected
                                  ? 'color-mix(in srgb, var(--w-lamp) 15%, var(--w-ground))'
                                  : 'color-mix(in srgb, var(--w-surface) 90%, transparent)',
                                border: isSelected
                                  ? '1px solid var(--w-lamp)'
                                  : '1px solid var(--w-line)',
                                color: isSelected ? 'var(--w-lamp)' : 'var(--w-ink)',
                                fontSize: '13px',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                cursor: 'pointer',
                                transition: 'all calc(var(--w-settle, 0.2s) * var(--gd-tempo, 1))',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              <span style={{ opacity: 0.6, fontSize: '11px' }}>#{i + 1}</span>
                              <span>{scrollOrientation === 'horizontal' ? `Habitat Sanctuary Spot` : `Diurnal Practice Record`}</span>
                              {isSelected && <span style={{ fontSize: '11px', color: 'var(--w-lamp)' }}>✓</span>}
                            </div>
                          );
                        })}
                      </ScrollArea>
                    </div>

                    {/* All 5 OS Archetypes Side-by-Side Comparison Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                      <webKit.Text kind="label" style={{ color: 'var(--w-ink)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.02em' }}>
                        ⚖️ All 9 Living Scrollbar Archetypes & OS Controls (Side-by-Side Live Comparison)
                      </webKit.Text>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                          gap: '12px',
                          width: '100%',
                        }}
                      >
                        {([
                          { variant: 'sovereign' as const, title: '✦ Sovereign', note: 'World-tuned living lamp glow' },
                          { variant: 'mechanical' as const, title: '⚙ Mechanical', note: '3D trench with knurled louvers' },
                          { variant: 'fluid' as const, title: '💧 Wewa Fluid', note: 'Lotus ripple capillary tube' },
                          { variant: 'circadian' as const, title: '☀️ Astral Sundial', note: 'Azimuth degrees & diurnal solar ray' },
                          { variant: 'ratna' as const, title: '💎 Ratna Sapphire', note: 'Faceted polygon & star glint (✦)' },
                          { variant: 'perahera' as const, title: '🔥 Perahera Ember', note: 'Charcoal flume & live fire cinder' },
                          { variant: 'leaf' as const, title: '🍃 Sacred Bo Leaf', note: 'Botanical vein structure talisman' },
                          { variant: 'perimeter' as const, title: '🔲 Perimeter', note: 'Continuous border ribbon' },
                          { variant: 'macos' as const, title: ' macOS', note: 'Floating translucent inset pill' },
                          { variant: 'fluent' as const, title: '⊞ Win 11 Fluent', note: '4px rail expands to 10px on hover' },
                          { variant: 'classic' as const, title: '🗔 Win Classic', note: '16px bevel with ▲/▼ steppers' },
                          { variant: 'native' as const, title: '🌐 Native OS', note: 'Standard unstyled browser default' },
                        ]).map((spec) => (
                          <div
                            key={spec.variant}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              border: scrollVariant === spec.variant ? '1px solid var(--w-lamp)' : '1px solid var(--w-line)',
                              borderRadius: '8px',
                              background: 'color-mix(in srgb, var(--w-ground) 70%, transparent)',
                              overflow: 'hidden',
                              height: '220px',
                            }}
                          >
                            <div
                              style={{
                                padding: '6px 10px',
                                background: scrollVariant === spec.variant ? 'color-mix(in srgb, var(--w-lamp) 15%, transparent)' : 'color-mix(in srgb, var(--w-surface) 60%, transparent)',
                                borderBottom: '1px solid var(--w-line)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                              }}
                            >
                              <span style={{ fontSize: '11px', fontWeight: 700, color: scrollVariant === spec.variant ? 'var(--w-lamp)' : 'var(--w-ink)' }}>
                                {spec.title}
                              </span>
                              <span style={{ fontSize: '9px', color: 'var(--w-ink-faint)' }}>
                                {spec.note}
                              </span>
                            </div>
                            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                              <ScrollArea
                                variant={spec.variant}
                                orientation="vertical"
                                tone={scrollTone}
                                scrollbarVisibility="always"
                                label={`${spec.title} comparison pane`}
                                style={{ height: '100%', width: '100%' }}
                              >
                                <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {Array.from({ length: 9 }).map((_, idx) => (
                                    <div
                                      key={idx}
                                      style={{
                                        padding: '6px 8px',
                                        borderRadius: '4px',
                                        background: 'color-mix(in srgb, var(--w-surface) 80%, transparent)',
                                        border: '1px solid color-mix(in srgb, var(--w-line) 40%, transparent)',
                                        fontSize: '11px',
                                        color: 'var(--w-ink-soft)',
                                      }}
                                    >
                                      Item #{idx + 1}
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. In-Situ Expandable Calendar Tray */}
                  <div>
                    <webKit.Text kind="label" style={{ marginBottom: '8px', display: 'block' }}>
                      4. In-Situ Expandable Calendar Tray (Unfolded without Disruptive Dialogs)
                    </webKit.Text>
                    <Date
                      formFactor="expandable"
                      date={galleryDate}
                      today="2026-11-01"
                      onSelectDate={setGalleryDate}
                    />
                  </div>
                </div>
              </section>

              {/* SECTION: Buttons & Actions */}
              <section>
                <webKit.Text kind="title">
                  Buttons & Interactive Actions
                </webKit.Text>
                <webKit.Inline gap="between" style={{ marginTop: '16px', flexWrap: 'wrap' }}>
                  <div id="button" style={{ display: 'inline-flex', gap: '8px', flexWrap: 'wrap' }}>
                    <webKit.Button label="Primary Button" variant="primary" />
                  <webKit.Button label="Secondary Button" variant="secondary" />
                  <webKit.Button label="Quiet Button" variant="quiet" />
                  <webKit.Button label="Danger Button" variant="danger" />
                  <webKit.Button
                    label={btnLoading ? 'Processing...' : 'Loading Toggle'}
                    loading={btnLoading}
                    onClick={() => setBtnLoading(!btnLoading)}
                  />
                  <webKit.Button label="Disabled Button" disabled />
                  </div>
                  <div id="icon-button">
                    <webKit.IconButton
                    label="Refresh"
                    icon={() => <span>ðŸ”„</span>}
                    onClick={() => alert('Icon action')}
                  />
                  </div>
                </webKit.Inline>
              </section>

              {/* SECTION: Form & Value Controls */}
              <section>
                <webKit.Text kind="title">
                  Forms, Inputs & Switches
                </webKit.Text>
                <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <webKit.Surface tone="raised" style={{ padding: '20px', borderRadius: '8px' }}>
                    <webKit.Stack gap="between">
                      <div id="text-field">
                        <webKit.TextField
                          label="Standard Text Input"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          hint="Supports live bidirectional state"
                        />
                      </div>

                      <div id="switch-row">
                        <webKit.SwitchRow
                          label="Notifications Enabled"
                          hint="Broadcast events on state change"
                          value={switchVal}
                          onChange={setSwitchVal}
                        />
                      </div>

                      <webKit.Checkbox
                        label="Agreement to dev ledger terms"
                        checked={checkVal}
                        onChange={setCheckVal}
                      />

                      <webKit.Scale
                        label="Rating Agreement Scale"
                        value={scaleVal}
                        onChange={setScaleVal}
                        ends={{ low: 'Disagree', high: 'Strongly Agree' }}
                      />
                    </webKit.Stack>
                  </webKit.Surface>

                  <webKit.Surface tone="raised" style={{ padding: '20px', borderRadius: '8px' }}>
                    <webKit.Stack gap="between">
                      <webKit.ChoiceQuestion
                        prompt="Select Verification Level"
                        value={choiceVal}
                        onChange={setChoiceVal}
                        options={[
                          { value: 'opt1', label: 'G1: Unit Vitest Harness' },
                          { value: 'opt2', label: 'G4: Real Browser Automation' },
                          { value: 'opt3', label: 'G5: Real Physical Hardware' },
                        ]}
                      />

                      <webKit.PrivacyState
                        mode={privacyMode}
                        onChange={(m) => setPrivacyMode(m)}
                      />

                      <webKit.PrivacyNote
                        identity="pseudonymous"
                        audience="Your study circle mentors"
                      />
                    </webKit.Stack>
                  </webKit.Surface>
                </div>
              </section>

              {/* SECTION: Agent Cards & Workflows */}
              <section>
                <webKit.Text kind="title">
                  Agent Cards & Workflow States
                </webKit.Text>
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <webKit.Button
                      label="Pending"
                      variant="quiet"
                      size="sm"
                      onClick={() => setApprovalState('pending')}
                    />
                    <webKit.Button
                      label="Submitting"
                      variant="quiet"
                      size="sm"
                      onClick={() => setApprovalState('submitting')}
                    />
                    <webKit.Button
                      label="Accepted"
                      variant="quiet"
                      size="sm"
                      onClick={() => setApprovalState('accepted')}
                    />
                    <webKit.Button
                      label="Expired"
                      variant="quiet"
                      size="sm"
                      onClick={() => setApprovalState('expired')}
                    />
                  </div>

                  <webKit.ApprovalCard
                    title="Schema Migration Verification"
                    target="apps/gurudevi-web/app/(sanctuary)/kit"
                    changes="```diff\n+ export const DevHarness = true;\n```"
                    state={approvalState}
                    onAccept={() => setApprovalState('accepted')}
                    onDiscard={() => setApprovalState('discarded')}
                  />

                  <webKit.ToolCallCard
                    title="Execute Playwright G4 E2E Test"
                    state={toolState}
                    detail="Running Chromium headless browser check..."
                    result="38/38 barrel exports successfully rendered and inspected."
                    onRetry={() => setToolState('running')}
                  />

                  <webKit.ThinkingTrace
                    state="done"
                    seconds={3.2}
                    content="Analyzed barrel naming parity between `@repo/ui/components/native` and `@repo/ui/components/web`."
                  />

                  <webKit.RunStatus
                    steps={[
                      { label: 'Check TypeScript types', state: 'done' },
                      { label: 'Run Vitest naming tests', state: 'done' },
                      { label: 'Compile Next.js route', state: 'running' },
                    ]}
                    elapsed="4.5s"
                  />

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <webKit.ArtifactCard
                      title="Architecture Guide"
                      kind="markdown"
                      summary="Full UI Kit gallery guidance and specifications."
                      onOpen={() => alert('Artifact opened')}
                    />
                    <webKit.Citation
                      index={1}
                      title="ui-kit-gallery-guide.md"
                      source="C:\x\docs\architecture\ui-kit-gallery-guide.md"
                      onOpen={() => alert('Citation opened')}
                    />
                  </div>
                </div>
              </section>

              {/* SECTION: Media & Documents */}
              <section>
                <webKit.Text kind="title">
                  Media & Document Display
                </webKit.Text>
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <webKit.RichTextEditor
                    label="Rich Text Editor"
                    value={richText}
                    onChange={setRichText}
                  />

                  <webKit.FileField
                    label="Attachment Upload"
                    hint="Drag and drop or select files"
                    files={[
                      {
                        name: 'evidence-G4.json',
                        uri: 'blob:fake-uri-1',
                        size: 1024 * 12,
                        mime: 'application/json',
                      },
                    ]}
                    onAdd={(files) => alert(`Added ${files.length} files`)}
                    onRemove={(file) => alert(`Removed ${file.name}`)}
                  />

                  <webKit.ImageCapture
                    label="Camera Capture Proof"
                    value={undefined}
                    onCaptured={(f) => alert(`Captured photo: ${f.name}`)}
                  />

                  <webKit.AudioRecord
                    label="Audio Voice Note"
                    value={undefined}
                    onRecorded={(f) => alert(`Audio recorded: ${f.name}`)}
                  />
                </div>
              </section>

              {/* SECTION: Lists, Grids, Rails & Carousels */}
              <section>
                <webKit.Text kind="title">
                  Collections, Rails & Virtualized Layouts
                </webKit.Text>
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <webKit.Rail
                    label="Featured Components Rail"
                    items={showcaseItems}
                    keyOf={(item) => item.id}
                    renderItem={(item) => (
                      <div style={{ padding: '16px' }}>
                        <webKit.Card
                          title={item.title}
                          meta={item.subtitle}
                          shape="tile"
                        />
                      </div>
                    )}
                  />

                  <webKit.Carousel
                    label="Interactive Carousel"
                    items={showcaseItems}
                    keyOf={(item) => item.id}
                    renderItem={(item) => (
                      <div
                        style={{
                          height: '140px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: '8px',
                        }}
                      >
                        <webKit.Text kind="label">{item.title}</webKit.Text>
                        <webKit.Text kind="caption">{item.subtitle}</webKit.Text>
                      </div>
                    )}
                  />

                  <webKit.Grid min="md" gap="between">
                    <webKit.Surface tone="raised" style={{ padding: '16px', borderRadius: '8px' }}>
                      <webKit.Text kind="label">Adaptive Column 1</webKit.Text>
                    </webKit.Surface>
                    <webKit.Surface tone="raised" style={{ padding: '16px', borderRadius: '8px' }}>
                      <webKit.Text kind="label">Adaptive Column 2</webKit.Text>
                    </webKit.Surface>
                    <webKit.Surface tone="raised" style={{ padding: '16px', borderRadius: '8px' }}>
                      <webKit.Text kind="label">Adaptive Column 3</webKit.Text>
                    </webKit.Surface>
                  </webKit.Grid>
                </div>
              </section>

              {/* SECTION: Practice & Feature Card Architectural Candidates */}
              <section id="practice-cards" style={{ marginTop: '36px' }}>
                <PracticeCardCandidates />
              </section>

              {/* SECTION: Notifications & Status */}
              <section>
                <webKit.Text kind="title">
                  Notifications & Status Badges
                </webKit.Text>
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <webKit.NotificationItem
                    title="Circadian Phase Shift"
                    body="Sanctuary world transitioned from morning to noon."
                    time="Just now"
                    unread
                  />
                  <webKit.NotificationItem
                    title="Security Audit Completed"
                    body="Zero vulnerability flags recorded in recent run."
                    time="10m ago"
                    unread={false}
                  />

                  <webKit.Inline gap="inside" style={{ alignItems: 'center' }}>
                    <webKit.Badge label="Neutral" tone="neutral" />
                    <webKit.Badge label="Lamp" tone="lamp" />
                    <webKit.Badge label="Success" tone="success" />
                    <webKit.Badge label="Danger" tone="danger" />
                    <webKit.Avatar name="Naveen" size="md" />
                  </webKit.Inline>
                </div>
              </section>

              {/* SECTION: Adversarial Stress Benchmark */}
              <section style={{ border: '2px dashed #f59e0b', padding: '20px', borderRadius: '12px' }}>
                <webKit.Inline gap="between" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <webKit.Text kind="title">
                      Adversarial Stress Benchmark: MessageList Virtualization
                    </webKit.Text>
                    <webKit.Text kind="caption">
                      Rendering {stressCount} messages on LegendList engine with streaming append.
                    </webKit.Text>
                  </div>
                  <webKit.Inline gap="inside">
                    <webKit.Button
                      label={isBenchStreaming ? 'Stop Stream' : 'Simulate Streaming'}
                      variant={isBenchStreaming ? 'danger' : 'primary'}
                      onClick={() => setIsBenchStreaming(!isBenchStreaming)}
                    />
                    <webKit.Button
                      label="Scale 500"
                      variant="quiet"
                      size="sm"
                      onClick={() => setStressCount(500)}
                    />
                    <webKit.Button
                      label="Scale 1000"
                      variant="quiet"
                      size="sm"
                      onClick={() => setStressCount(1000)}
                    />
                  </webKit.Inline>
                </webKit.Inline>

                <div
                  style={{
                    height: '350px',
                    marginTop: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <webKit.MessageList
                    items={mockMessages}
                    keyOf={(m) => m.id}
                    label="Stress Test Message List"
                    renderItem={(item) => (
                      <webKit.MessageBubble
                        author={item.author}
                        content={item.content}
                        time={item.time}
                        state={item.state}
                      />
                    )}
                  />
                </div>

                <div style={{ marginTop: '16px' }}>
                  <webKit.Composer
                    value={composerText}
                    onChange={setComposerText}
                    onSend={() => {
                      alert(`Message Sent: ${composerText}`);
                      setComposerText('');
                    }}
                    placeholder="Type an interactive message..."
                    busy={composerBusy}
                    onStop={() => setComposerBusy(false)}
                    label="Gallery Composer"
                  />
                </div>
              </section>

              {/* Modals & Overlays Controls */}
              <section>
                <webKit.Inline gap="between">
                  <div id="dialog">
                    <webKit.Button label="Open Dialog" onClick={() => setDialogOpen(true)} />
                  </div>
                  <div id="sheet">
                    <webKit.Button label="Open Sheet" onClick={() => setSheetOpen(true)} />
                  </div>
                  <webKit.Button label="Open Fab Menu" onClick={() => setFabOpen(true)} />
                </webKit.Inline>

                <webKit.Dialog
                  open={dialogOpen}
                  onClose={() => setDialogOpen(false)}
                  title="Sanctuary Modal Verification"
                >
                  <webKit.Text>
                    Dialog rendered in current world ({world}) and mode ({mode}). Esc key closes.
                  </webKit.Text>
                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <webKit.Button label="Close" onClick={() => setDialogOpen(false)} />
                  </div>
                </webKit.Dialog>

                <webKit.Sheet
                  open={sheetOpen}
                  onClose={() => setSheetOpen(false)}
                  title="Sanctuary Bottom Sheet"
                >
                  <webKit.Text>Sheet content verified under responsive constraints.</webKit.Text>
                </webKit.Sheet>

                <webKit.FabMenu
                  open={fabOpen}
                  onClose={() => setFabOpen(false)}
                  label="Quick Actions"
                  actions={[
                    {
                      key: 'act1',
                      label: 'Create Artifact',
                      onPress: () => alert('Artifact created'),
                    },
                    {
                      key: 'act2',
                      label: 'Purge Temporary Buffer',
                      tone: 'danger',
                      onPress: () => alert('Purged'),
                    },
                  ]}
                />

                <webKit.ActionFab
                  label="Quick Action"
                  onPress={() => setFabOpen(true)}
                />
              </section>

              {/* Language Selection Exhibition & Comparative Arena */}
              <section id="language">
                <LanguageExhibition
                  currentLang={lang}
                  onSelectLang={(code) => setLang(code as LangCode)}
                />
              </section>

            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  </main>
    </div>
  </WorldScope>
  );
}

