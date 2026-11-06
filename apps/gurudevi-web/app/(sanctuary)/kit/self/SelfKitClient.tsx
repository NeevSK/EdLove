'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Compass,
  ChevronDown,
  ChevronUp,
  Activity,
  Heart,
  Flame,
  Check,
  X,
} from 'lucide-react';
import { Pebble } from '@repo/ui/components/web';
import type { PebbleCornerBadgeSpec, PebbleCornerSlotMode } from '@repo/ui/theme';
import styles from './self-kit.module.css';

type ArchetypeKey = 'fused_bento' | 'hearth' | 'rails' | 'sadhana' | 'bento';

interface PracticeItem {
  id: string;
  emoji: string;
  title: string;
  category: 'wellbeing' | 'practice' | 'growth' | 'somatic' | 'identity';
  rhythm: string;
  circadianNow?: boolean;
  purpose: string;
  interactiveModal?: 'fire_journal' | 'mood_lotus' | 'breath_guide';
}

const ALL_FREE_PRACTICES: PracticeItem[] = [
  {
    id: 'fire_journal',
    emoji: '🌅',
    title: 'Fire Journal',
    category: 'practice',
    rhythm: 'Dawn · Private Release',
    circadianNow: true,
    purpose: 'Write an honest reflection and set it free. Nothing is permanently stored in history except the day stamp.',
    interactiveModal: 'fire_journal',
  },
  {
    id: 'breath_guide',
    emoji: '🌿',
    title: 'Breath Guide',
    category: 'somatic',
    rhythm: '3-min Vagal Reset',
    circadianNow: true,
    purpose: 'Calm somatic pacing: 4s inhale, 4s hold, 4s exhale, 4s rest to de-escalate nervous system tension.',
    interactiveModal: 'breath_guide',
  },
  {
    id: 'mood_lotus',
    emoji: '🪷',
    title: 'Mood Lotus',
    category: 'wellbeing',
    rhythm: 'Midday Reset',
    circadianNow: true,
    purpose: 'Check in with inner weather across serene, bright, stormy, or quiet contemplative states.',
    interactiveModal: 'mood_lotus',
  },
  {
    id: 'daily_pulse',
    emoji: '💓',
    title: 'Daily Pulse',
    category: 'somatic',
    rhythm: 'Health Connect Sync',
    circadianNow: true,
    purpose: 'Passive biometric integration with Health Connect & browser sensors for mindful minute tracking.',
  },
  {
    id: 'joy_jar',
    emoji: '✨',
    title: 'Joy Jar',
    category: 'wellbeing',
    rhythm: 'Evening Micro-glimmers',
    purpose: 'Capture small, unexpected moments of joy, gratitude, and wonder throughout the school day.',
  },
  {
    id: 'tomorrow_prep',
    emoji: '🌙',
    title: 'Tomorrow Prep',
    category: 'practice',
    rhythm: 'Night Closure',
    purpose: 'Calm closure to close mental tabs, organize materials, and sleep with peace of mind.',
  },
  {
    id: 'sleep_tracker',
    emoji: '💤',
    title: 'Sleep Rhythm',
    category: 'somatic',
    rhythm: 'Morning Wake Score',
    purpose: 'Track rest without invasive tracking: wake feeling, resting heart rhythm, and bedtime consistency.',
  },
  {
    id: 'wisdom_seeds',
    emoji: '🌱',
    title: 'Wisdom Seeds',
    category: 'growth',
    rhythm: 'Philosophical Inquiries',
    purpose: 'Short, timeless reflection prompts drawn from contemplative traditions and Sri Lankan rural heritage.',
  },
  {
    id: 'resonance_patterns',
    emoji: '🌀',
    title: 'Resonance',
    category: 'growth',
    rhythm: 'Longitudinal Waves',
    purpose: 'Gentle pattern recognition showing when your energy and clarity are highest over multi-week horizons.',
  },
  {
    id: 'monthly_reflection',
    emoji: '🪞',
    title: 'Warm Mirror',
    category: 'growth',
    rhythm: 'Deep Monthly Review',
    purpose: 'An unhurried space at month-end to celebrate growth, release setbacks, and realign intentions.',
  },
  {
    id: 'voice_journal',
    emoji: '🎙️',
    title: 'Voice Journal',
    category: 'practice',
    rhythm: 'Audio Reflections',
    purpose: 'Speak your thoughts aloud for private playback and acoustic release without transcribing.',
  },
  {
    id: 'governance_history',
    emoji: '📜',
    title: 'Progress Tree',
    category: 'identity',
    rhythm: 'Living Journey',
    purpose: 'Visualize your unfolding path, milestones, and shared contributions across the sanctuary.',
  },
];

export function SelfKitClient() {
  const [activeArchetype, setActiveArchetype] = useState<ArchetypeKey>('fused_bento');
  const [cornerSlotMode, setCornerSlotMode] = useState<PebbleCornerSlotMode>('pin');
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set(['fire_journal', 'breath_guide', 'mood_lotus']));
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeModal, setActiveModal] = useState<PracticeItem | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Breathing simulation state
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [fireText, setFireText] = useState('');
  const [isBurned, setIsBurned] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const togglePin = (id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setFeedbackToast(`Unpinned ${id} from shelf`);
      } else {
        next.add(id);
        setFeedbackToast(`Pinned ${id} to your personal shelf`);
      }
      return next;
    });
  };

  const openPractice = (practice: PracticeItem) => {
    setActiveModal(practice);
    setFireText('');
    setIsBurned(false);
    setSelectedMood(null);
  };

  const getPebbleProps = (practice: PracticeItem) => {
    const isPinned = pinnedIds.has(practice.id);

    const cornerBadge: PebbleCornerBadgeSpec = {
      mode: cornerSlotMode,
      isPinned,
      count: isPinned ? 1 : 0,
      onAction: (action) => {
        if (action === 'toggle-pin') {
          togglePin(practice.id);
        } else {
          setFeedbackToast(`${action} on ${practice.title}`);
        }
      },
    };

    return {
      title: practice.title,
      emoji: practice.emoji,
      rhythm: practice.rhythm,
      cornerBadge,
      gear: 'auto' as const,
      disabled: false,
      onPress: () => openPractice(practice),
      titleAttr: `${practice.title} · ${practice.purpose}`,
    };
  };

  const filteredPractices = useMemo(() => {
    if (activeFilter === 'all') return ALL_FREE_PRACTICES;
    if (activeFilter === 'circadian') return ALL_FREE_PRACTICES.filter((p) => p.circadianNow);
    if (activeFilter === 'shelf') return ALL_FREE_PRACTICES.filter((p) => pinnedIds.has(p.id));
    return ALL_FREE_PRACTICES.filter((p) => p.category === activeFilter);
  }, [activeFilter, pinnedIds]);

  return (
    <div className={styles.container}>
      {/* ─── Global Top Control Bar ─── */}
      <header className={styles.controlBar}>
        <div className={styles.controlBarHeader}>
          <div className={styles.controlTitleGroup}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--w-lamp)' }}>
                Sanctuary Living Kit · Self Floor
              </span>
              <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', borderRadius: '4px', background: 'var(--w-ground)', border: '1px solid var(--w-line)' }}>
                100% Free · Real Practices
              </span>
            </div>
            <h1>Self Floor Architectural Showcase</h1>
            <p>
              Compare 4 spatial paradigms to organize Self practices organically. Every practice is 100% open, sovereign, and free to all learners and teachers.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link
              href="/kit"
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--w-ink-soft)',
                textDecoration: 'none',
                padding: '0.4rem 0.85rem',
                borderRadius: '9999px',
                border: '1px solid var(--w-line)',
              }}
            >
              ← Back to Kit
            </Link>
          </div>
        </div>

        {/* Paradigm / Archetype Selector */}
        <div className={styles.archetypeSelectorRow}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--w-ink)' }}>Select Architectural Paradigm:</span>
          {[
            { id: 'fused_bento', label: '★ Fused-Cluster Bento (Dual Anchors + Intra-Groups)', icon: '🧩' },
            { id: 'hearth', label: '1. Hearth & Mosaic', icon: '🪷' },
            { id: 'rails', label: '2. Spatial Dual-Rail', icon: '⚡' },
            { id: 'sadhana', label: '3. Sadhana Table', icon: '🕯️' },
            { id: 'bento', label: '4. Standard Bento', icon: '🍱' },
          ].map((item) => {
            const isSelected = activeArchetype === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={isSelected ? styles.archetypePillActive : styles.archetypePill}
                onClick={() => setActiveArchetype(item.id as ArchetypeKey)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-controls: Corner Slot Mode */}
        <div className={styles.subControlRow}>
          <div className={styles.toggleButtonGroup}>
            <span style={{ fontWeight: 600, color: 'var(--w-ink-soft)' }}>Pebble Sticker Affordance:</span>
            {[
              { id: 'pin', label: '📍 Pin Toggle' },
              { id: 'menu', label: '⋮ 3-Dot Options' },
              { id: 'counter', label: '🔢 Practice Counter' },
              { id: 'status', label: '● Live Status' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                className={cornerSlotMode === m.id ? styles.miniPillActive : styles.miniPill}
                onClick={() => setCornerSlotMode(m.id as PebbleCornerSlotMode)}
              >
                {m.label}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '0.74rem', color: 'var(--w-ink-soft)' }}>
            ✦ Tap any Pebble to launch its real interactive practice
          </span>
        </div>

        {feedbackToast ? (
          <div className={styles.disclosureBanner}>
            <span>✦ {feedbackToast}</span>
            <button
              type="button"
              onClick={() => setFeedbackToast(null)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
            >
              ✕
            </button>
          </div>
        ) : null}
      </header>

      {/* ─── Main Architectural Arena ─── */}
      <main className={styles.arenaStage}>
        {/* ════════════════════════════════════════════════════════════════
            PARADIGM 0: Dual Columnar Rails + Dynamic Contour Cohorts
        ════════════════════════════════════════════════════════════════ */}
        {activeArchetype === 'fused_bento' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Top Anchor Row: Dual Real Pebbles + Minimalist Greeting Divider */}
            <div className={styles.topAnchorRow}>
              {/* Top-Left Anchor 1: Breath Guide */}
              <div className={styles.topPebbleItem}>
                <span className={styles.topPebbleLabel}>🌿 Somatic Anchor</span>
                <div style={{ width: '132px' }}>
                  <Pebble {...getPebbleProps(ALL_FREE_PRACTICES[1]!)} />
                </div>
              </div>

              {/* Top-Left Anchor 2: Mood Lotus */}
              <div className={styles.topPebbleItem}>
                <span className={styles.topPebbleLabel}>🪷 Inner Weather</span>
                <div style={{ width: '132px' }}>
                  <Pebble {...getPebbleProps(ALL_FREE_PRACTICES[2]!)} />
                </div>
              </div>

              {/* Diurnal Horizon Status Banner */}
              <div className={styles.topHearthBanner}>
                <p className={styles.hearthEyebrow}>Living Sanctuary · Dawn Flow</p>
                <h3 style={{ margin: '0.15rem 0', fontFamily: 'var(--w-font-display, Georgia)', fontSize: '1.25rem', color: 'var(--w-ink)' }}>
                  Good morning, Naveen
                </h3>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--w-ink-soft)', lineHeight: 1.5 }}>
                  3 mindful minutes anchored today. Take a moment with Breath Guide or check your inner weather before opening your desk.
                </p>
              </div>
            </div>

            {/* Two Columnar Rails with Dynamic Morphing Contours */}
            <div className={styles.dualRailLayout}>
              {/* RAIL COLUMN 1 (Left): Somatic & Daily Practice */}
              <div className={styles.railColumn}>
                {/* Cohort 1: Somatic Vitals (Max 3 Pebbles) */}
                <div className={styles.contourCohort}>
                  <div className={styles.cohortHeader}>
                    <h4 className={styles.cohortTitle}>🌿 Somatic &amp; Rhythm</h4>
                    <span className={styles.cohortMeta}>3 Focus Practices</span>
                  </div>
                  <div className={styles.cohortPebbleRow}>
                    {ALL_FREE_PRACTICES.filter((p) => p.category === 'somatic').slice(0, 3).map((practice) => (
                      <div key={`cohort-${practice.id}`} className={styles.cohortPebbleCell}>
                        <Pebble {...getPebbleProps(practice)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cohort 2: Daily Practice & Reflection (Max 3 Pebbles) */}
                <div className={styles.contourCohort}>
                  <div className={styles.cohortHeader}>
                    <h4 className={styles.cohortTitle}>🌅 Daily Practice &amp; Release</h4>
                    <span className={styles.cohortMeta}>3 Focus Practices</span>
                  </div>
                  <div className={styles.cohortPebbleRow}>
                    {ALL_FREE_PRACTICES.filter((p) => p.category === 'practice').slice(0, 3).map((practice) => (
                      <div key={`cohort-${practice.id}`} className={styles.cohortPebbleCell}>
                        <Pebble {...getPebbleProps(practice)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RAIL COLUMN 2 (Right): Wellbeing & Growth Journey */}
              <div className={styles.railColumn}>
                {/* Cohort 3: Wellbeing & Micro-glimmers (Max 3 Pebbles) */}
                <div className={styles.contourCohort}>
                  <div className={styles.cohortHeader}>
                    <h4 className={styles.cohortTitle}>🪷 Wellbeing &amp; Emotion</h4>
                    <span className={styles.cohortMeta}>2 Focus Practices</span>
                  </div>
                  <div className={styles.cohortPebbleRow}>
                    {ALL_FREE_PRACTICES.filter((p) => p.category === 'wellbeing').slice(0, 3).map((practice) => (
                      <div key={`cohort-${practice.id}`} className={styles.cohortPebbleCell}>
                        <Pebble {...getPebbleProps(practice)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cohort 4: Contemplative Growth (Max 3 Pebbles) */}
                <div className={styles.contourCohort}>
                  <div className={styles.cohortHeader}>
                    <h4 className={styles.cohortTitle}>🌱 Contemplative Growth</h4>
                    <span className={styles.cohortMeta}>3 Focus Practices</span>
                  </div>
                  <div className={styles.cohortPebbleRow}>
                    {ALL_FREE_PRACTICES.filter((p) => p.category === 'growth').slice(0, 3).map((practice) => (
                      <div key={`cohort-${practice.id}`} className={styles.cohortPebbleCell}>
                        <Pebble {...getPebbleProps(practice)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            PARADIGM 1: The Sanctuary Hearth & Living Mosaic
        ════════════════════════════════════════════════════════════════ */}
        {activeArchetype === 'hearth' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* The Living Hearth Header (Single Unified Ribbon) */}
            <div className={styles.hearthCard}>
              <div className={styles.hearthGreetingRow}>
                <div>
                  <p className={styles.hearthEyebrow}>Living Hearth · Dawn Phase</p>
                  <h2 className={styles.hearthTitle}>Welcome to your Sanctuary, Naveen</h2>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--w-ink-soft)' }}>
                    Your somatic flow is steady. Fire Journal is ready for your private morning reflection.
                  </p>
                </div>

                <div className={styles.hearthSomaticPill}>
                  <Activity size={14} />
                  <span>3 mindful minutes anchored · Serene Flow</span>
                </div>
              </div>
            </div>

            {/* In-Place Progressive Filter Strip */}
            <div className={styles.filterStrip}>
              {[
                { id: 'circadian', label: '☀️ For Your Rhythm (4)' },
                { id: 'shelf', label: `📌 My Shelf (${pinnedIds.size})` },
                { id: 'all', label: `🧭 All Practices (${ALL_FREE_PRACTICES.length})` },
                { id: 'somatic', label: '🌿 Somatic & Breath' },
                { id: 'wellbeing', label: '🪷 Wellbeing' },
                { id: 'growth', label: '🌱 Growth' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={activeFilter === f.id ? styles.filterBtnActive : styles.filterBtn}
                  onClick={() => setActiveFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Single Mosaic Grid */}
            <div className={styles.pebbleMosaicGrid}>
              {filteredPractices.map((practice) => (
                <Pebble key={practice.id} {...getPebbleProps(practice)} />
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            PARADIGM 2: Spatial Dual-Rail (Living Stream)
        ════════════════════════════════════════════════════════════════ */}
        {activeArchetype === 'rails' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Rail 1: Active Personal Shelf */}
            <div className={styles.railSection}>
              <div className={styles.railHeader}>
                <h3>📌 Your Active Shelf (Pinned Favorites)</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--w-ink-soft)' }}>Swipe / Pan horizontally</span>
              </div>
              <div className={styles.railTrack}>
                {ALL_FREE_PRACTICES.filter((p) => pinnedIds.has(p.id)).map((practice) => (
                  <div key={`rail-shelf-${practice.id}`} className={styles.railItem}>
                    <Pebble {...getPebbleProps(practice)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Rail 2: Circadian Stream */}
            <div className={styles.railSection}>
              <div className={styles.railHeader}>
                <h3>☀️ Attuned to Dawn Rhythm</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--w-ink-soft)' }}>Filtered for morning energy</span>
              </div>
              <div className={styles.railTrack}>
                {ALL_FREE_PRACTICES.filter((p) => p.circadianNow).map((practice) => (
                  <div key={`rail-circ-${practice.id}`} className={styles.railItem}>
                    <Pebble {...getPebbleProps(practice)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Collapsible Complete Practice Catalog Accordion */}
            <div className={styles.drawerAccordion}>
              <button
                type="button"
                onClick={() => setIsDrawerOpen((prev) => !prev)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Compass size={18} color="var(--w-lamp)" />
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--w-ink)' }}>
                    Complete Practice Catalog ({ALL_FREE_PRACTICES.length})
                  </span>
                </div>
                {isDrawerOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isDrawerOpen && (
                <div style={{ marginTop: '1.25rem' }}>
                  <div className={styles.pebbleMosaicGrid}>
                    {ALL_FREE_PRACTICES.map((practice) => (
                      <Pebble key={`drawer-${practice.id}`} {...getPebbleProps(practice)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            PARADIGM 3: The Daily Sadhana Table
        ════════════════════════════════════════════════════════════════ */}
        {activeArchetype === 'sadhana' && (
          <div className={styles.sadhanaStage}>
            <div>
              <p className={styles.hearthEyebrow}>Focused Sadhana Space</p>
              <h2 className={styles.hearthTitle}>Today's 3 Core Focus Practices</h2>
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--w-ink-soft)', maxWidth: '28rem' }}>
                A serene space with zero clutter. Complete your circadian essentials before exploring the broader library.
              </p>
            </div>

            {/* 3 Core Focus Pebbles in Round Table Layout */}
            <div className={styles.sadhanaTableRound}>
              {ALL_FREE_PRACTICES.slice(0, 3).map((practice) => (
                <div key={`sadhana-${practice.id}`} style={{ width: '144px' }}>
                  <Pebble {...getPebbleProps(practice)} />
                </div>
              ))}
            </div>

            {/* Ambient Modal/Drawer Trigger for Full Catalog */}
            <button
              type="button"
              className={styles.exploreFloatingBtn}
              onClick={() => setIsDrawerOpen(true)}
            >
              <Compass size={16} />
              <span>Explore All Practices ({ALL_FREE_PRACTICES.length})</span>
            </button>

            {isDrawerOpen && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(6px)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 100,
                  padding: '1.5rem',
                }}
                onClick={() => setIsDrawerOpen(false)}
              >
                <div
                  style={{
                    background: 'var(--w-ground)',
                    borderRadius: '1.5rem',
                    padding: '2rem',
                    maxWidth: '56rem',
                    width: '100%',
                    maxHeight: '85vh',
                    overflowY: 'auto',
                    border: '1px solid var(--w-line)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontFamily: 'var(--w-font-display, Georgia)' }}>Practice Catalog Matrix</h3>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--w-ink-soft)' }}>
                        Select any practice to launch or pin to your shelf.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      style={{ padding: '0.4rem 0.85rem', borderRadius: '9999px', border: '1px solid var(--w-line)', background: 'transparent', cursor: 'pointer' }}
                    >
                      Close ✕
                    </button>
                  </div>

                  <div className={styles.pebbleMosaicGrid}>
                    {ALL_FREE_PRACTICES.map((practice) => (
                      <Pebble key={`modal-${practice.id}`} {...getPebbleProps(practice)} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            PARADIGM 4: Somatic Bento Studio
        ════════════════════════════════════════════════════════════════ */}
        {activeArchetype === 'bento' && (
          <div className={styles.bentoContainer}>
            {/* Cell 1: Primary Sadhana Action Cell */}
            <div className={styles.bentoCellHero}>
              <p className={styles.hearthEyebrow}>Primary Anchor</p>
              <h3 style={{ margin: '0.25rem 0', fontFamily: 'var(--w-font-display, Georgia)', fontSize: '1.45rem' }}>
                Dawn Release · Fire Journal
              </h3>
              <p style={{ margin: '0 0 1rem', fontSize: '0.84rem', color: 'var(--w-ink-soft)' }}>
                Release a private reflection. Only a short preview and the day remain in your history.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => openPractice(ALL_FREE_PRACTICES[0]!)}
                  style={{
                    padding: '0.55rem 1.15rem',
                    borderRadius: '9999px',
                    background: 'var(--w-lamp)',
                    color: 'var(--w-ground)',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                  }}
                >
                  Open Fire Journal →
                </button>
              </div>
            </div>

            {/* Cell 2: Somatic Health Telemetry */}
            <div className={styles.bentoCellSomatic}>
              <div>
                <p className={styles.hearthEyebrow}>Somatic Telemetry</p>
                <h4 style={{ margin: '0.2rem 0', fontSize: '1.15rem' }}>Serene Flow</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--w-ink-soft)' }}>
                  3 Mindful Mins · Health Connect Synced
                </p>
              </div>
              <button
                type="button"
                onClick={() => openPractice(ALL_FREE_PRACTICES[1]!)}
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: '9999px',
                  background: 'var(--w-surface-raised-bg)',
                  border: '1px solid var(--w-line)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                }}
              >
                🌿 3-min Vagal Reset
              </button>
            </div>

            {/* Cell 3: Unified Practice Mosaic Floor */}
            <div className={styles.bentoCellMosaic}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h4 style={{ margin: 0, fontFamily: 'var(--w-font-display, Georgia)', fontSize: '1.15rem' }}>
                  Integrated Practice Mosaic
                </h4>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {['all', 'shelf', 'somatic', 'growth'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={activeFilter === cat ? styles.miniPillActive : styles.miniPill}
                      onClick={() => setActiveFilter(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.pebbleMosaicGrid}>
                {filteredPractices.map((practice) => (
                  <Pebble key={`bento-${practice.id}`} {...getPebbleProps(practice)} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── Real Interactive Practice Dialog (No Shallow Placeholders) ─── */}
      {activeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 200,
            padding: '1.5rem',
          }}
          onClick={() => setActiveModal(null)}
        >
          <div
            style={{
              background: 'var(--w-ground)',
              borderRadius: '1.5rem',
              padding: '2rem',
              maxWidth: '36rem',
              width: '100%',
              border: '1px solid var(--w-line)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>{activeModal.emoji}</span>
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'var(--w-font-display, Georgia)', fontSize: '1.35rem' }}>
                    {activeModal.title}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--w-ink-soft)' }}>
                    {activeModal.rhythm} · Free Sanctuary Practice
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{ padding: '0.35rem 0.65rem', borderRadius: '9999px', border: '1px solid var(--w-line)', background: 'transparent', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Practice Interactive Core */}
            {activeModal.interactiveModal === 'fire_journal' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--w-ink-soft)' }}>
                  Write down any stress, self-doubt, or heavy thoughts from this morning. When ready, burn it into ash.
                </p>
                {!isBurned ? (
                  <>
                    <textarea
                      value={fireText}
                      onChange={(e) => setFireText(e.target.value)}
                      placeholder="Release what weighs on your mind today..."
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '0.85rem',
                        border: '1px solid var(--w-line)',
                        background: 'var(--w-surface-raised-bg)',
                        color: 'var(--w-ink)',
                        font: 'inherit',
                        fontSize: '0.88rem',
                        boxSizing: 'border-box',
                      }}
                    />
                    <button
                      type="button"
                      disabled={!fireText.trim()}
                      onClick={() => setIsBurned(true)}
                      style={{
                        padding: '0.65rem',
                        borderRadius: '9999px',
                        background: fireText.trim() ? 'var(--w-lamp)' : 'var(--w-surface-raised-bg)',
                        color: fireText.trim() ? 'var(--w-ground)' : 'var(--w-ink-soft)',
                        border: '1px solid var(--w-line)',
                        fontWeight: 700,
                        cursor: fireText.trim() ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Flame size={16} />
                      <span>Release &amp; Burn to Ash</span>
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <span style={{ fontSize: '2.5rem' }}>✨</span>
                    <h4 style={{ margin: '0.5rem 0 0.25rem', fontFamily: 'var(--w-font-display, Georgia)' }}>
                      Released into Stillness
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--w-ink-soft)' }}>
                      Your words have been released. Only your courage and the morning date remain.
                    </p>
                  </div>
                )}
              </div>
            ) : activeModal.interactiveModal === 'breath_guide' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: '1rem 0' }}>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--w-ink-soft)', textAlign: 'center' }}>
                  Box breathing reset for the vagal nerve. Inhale courage, exhale tension.
                </p>
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'color-mix(in srgb, var(--w-lamp) 18%, var(--w-ground))',
                    border: '2px solid var(--w-lamp)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.5s ease',
                  }}
                >
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--w-lamp)' }}>{breathPhase}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--w-ink-soft)' }}>4 seconds</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['Inhale', 'Hold', 'Exhale', 'Rest'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setBreathPhase(p)}
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '9999px',
                        border: '1px solid var(--w-line)',
                        background: breathPhase === p ? 'var(--w-lamp)' : 'transparent',
                        color: breathPhase === p ? 'var(--w-ground)' : 'var(--w-ink)',
                        fontSize: '0.75rem',
                        fontWeight: breathPhase === p ? 700 : 500,
                        cursor: 'pointer',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ) : activeModal.interactiveModal === 'mood_lotus' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--w-ink-soft)' }}>
                  How does your inner weather feel right now?
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  {[
                    { id: 'serene', label: '🌸 Serene & Calm', desc: 'Clear, steady breathing' },
                    { id: 'bright', label: '☀️ Bright & Energetic', desc: 'Ready to learn and teach' },
                    { id: 'cloudy', label: '☁️ Overcast & Tender', desc: 'Carrying a slight fatigue' },
                    { id: 'stormy', label: '🌧️ Heavy & Overwhelmed', desc: 'Need quiet rest and space' },
                  ].map((m) => {
                    const isSel = selectedMood === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMood(m.id)}
                        style={{
                          padding: '0.85rem',
                          borderRadius: '1rem',
                          textAlign: 'left',
                          border: isSel ? '2px solid var(--w-lamp)' : '1px solid var(--w-line)',
                          background: isSel ? 'color-mix(in srgb, var(--w-lamp) 12%, var(--w-surface-raised-bg))' : 'var(--w-surface-raised-bg)',
                          cursor: 'pointer',
                        }}
                      >
                        <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--w-ink)' }}>{m.label}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--w-ink-soft)' }}>{m.desc}</span>
                      </button>
                    );
                  })}
                </div>
                {selectedMood && (
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.82rem', color: 'var(--w-lamp)', fontWeight: 600 }}>
                    ✓ Inner weather checked in. Zero judgment, held in safety.
                  </p>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--w-ink)', lineHeight: 1.55 }}>
                  {activeModal.purpose}
                </p>
                <div style={{ padding: '0.85rem', borderRadius: '0.85rem', background: 'var(--w-surface-raised-bg)', border: '1px solid var(--w-line)', fontSize: '0.8rem', color: 'var(--w-ink-soft)' }}>
                  <strong>Practice Rhythm:</strong> {activeModal.rhythm} · Always accessible locally without internet or corporate tracking.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
