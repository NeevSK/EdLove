import React, { useState, useRef } from 'react';
import {
  MoreHorizontal,
  MoreVertical,
  Pin,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import styles from './practice-cards.module.css';

export interface PracticeSpec {
  id: string;
  emoji: string;
  title: string;
  category: string;
  description: string;
  sessions: number;
  rhythm: string;
  isFocus?: boolean;
}

export type CornerStickerMode =
  | 'mixed'
  | 'menu'
  | 'counter'
  | 'pin'
  | 'tooltip'
  | 'status';

interface PebbleCornerContainerProps {
  practice: PracticeSpec;
  mode: CornerStickerMode;
  isPinned: boolean;
  count: number;
  status: 'ready' | 'busy' | 'syncing';
  isOpenMenu: boolean;
  dotOrientation?: 'vertical' | 'horizontal';
  compact?: boolean;
  onTogglePin: (id: string) => void;
  onToggleMenu: (id: string) => void;
  onCloseMenu: () => void;
  onIncrementCount: (id: string) => void;
  onCycleStatus: (id: string) => void;
  onActionFeedback: (msg: string) => void;
}

function PebbleCornerStickerContainer({
  practice,
  mode,
  isPinned,
  count,
  status,
  isOpenMenu,
  dotOrientation = 'vertical',
  compact = false,
  onTogglePin,
  onToggleMenu,
  onCloseMenu,
  onIncrementCount,
  onCycleStatus,
  onActionFeedback,
}: PebbleCornerContainerProps) {
  const [isPressing, setIsPressing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // In mixed mode, demonstrate heterogeneous server state across cards
  const resolvedMode: 'pin' | 'menu' | 'counter' | 'tooltip' | 'status' =
    mode === 'mixed'
      ? practice.id === 'fire_journal'
        ? 'pin'
        : practice.id === 'mood_lotus'
        ? 'menu'
        : 'counter'
      : mode;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsPressing(true);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsPressing(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    switch (resolvedMode) {
      case 'pin':
        onTogglePin(practice.id);
        onActionFeedback(`${isPinned ? 'Unpinned' : 'Pinned'} ${practice.title}`);
        break;
      case 'menu':
        onToggleMenu(practice.id);
        break;
      case 'counter':
        onIncrementCount(practice.id);
        onActionFeedback(`Incremented ${practice.title} badge count to ${count + 1}`);
        break;
      case 'status':
        onCycleStatus(practice.id);
        break;
      case 'tooltip':
        setShowTooltip((prev) => !prev);
        break;
    }
  };

  const isPermanentActive =
    (resolvedMode === 'pin' && isPinned) ||
    (resolvedMode === 'menu' && isOpenMenu) ||
    (resolvedMode === 'counter' && count > 0);

  const getCircadianGuidance = (id: string) => {
    switch (id) {
      case 'fire_journal':
        return 'Dawn reflection · Private release';
      case 'mood_lotus':
        return 'Midday somatic weather check-in';
      case 'breath_guide':
        return 'Inter-period vagal nerve reset';
      default:
        return 'Personalized sanctuary practice';
    }
  };

  return (
    <div
      className={styles.pebbleCornerHitBox}
      data-pressing={isPressing || undefined}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        setIsPressing(false);
        setShowTooltip(false);
      }}
      onPointerCancel={() => setIsPressing(false)}
      onMouseEnter={() => setShowTooltip(true)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      title={
        resolvedMode === 'pin'
          ? isPinned ? 'Unpin favorite' : 'Pin to favorites'
          : resolvedMode === 'menu'
          ? 'Options menu'
          : resolvedMode === 'counter'
          ? 'Click to increment counter'
          : resolvedMode === 'status'
          ? `Status: ${status} (Click to cycle)`
          : 'Practice guidance'
      }
      aria-label={`${resolvedMode} for ${practice.title}`}
    >
      {/* Quarter-Circle Visual Face */}
      <div
        className={compact ? styles.compactCornerStickerFace : styles.pebbleCornerStickerFace}
        data-active={isPermanentActive || undefined}
      >
        {resolvedMode === 'pin' && (
          <span className={styles.stickerGlyph} aria-hidden="true">
            {isPinned ? '📍' : '📌'}
          </span>
        )}

        {resolvedMode === 'menu' && (
          <span className={styles.stickerGlyph} aria-hidden="true">
            {dotOrientation === 'vertical' ? (
              <MoreVertical size={compact ? 12 : 14} />
            ) : (
              <MoreHorizontal size={compact ? 12 : 14} />
            )}
          </span>
        )}

        {resolvedMode === 'counter' && (
          <span className={styles.stickerCounter} aria-hidden="true">
            {count > 99 ? '99+' : count}
          </span>
        )}

        {resolvedMode === 'tooltip' && (
          <span className={styles.stickerGlyph} aria-hidden="true">
            💡
          </span>
        )}

        {resolvedMode === 'status' && (
          <span
            className={styles.stickerStatusDot}
            data-state={status}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Autonomous Dropdown Menu for 3-Dot Mode */}
      {resolvedMode === 'menu' && isOpenMenu && (
        <div
          className={styles.stickerDropdownMenu}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className={styles.stickerDropdownItem}
            onClick={() => {
              onTogglePin(practice.id);
              onActionFeedback(`${isPinned ? 'Unpinned' : 'Pinned'} ${practice.title}`);
              onCloseMenu();
            }}
          >
            <span>{isPinned ? '📌' : '📍'}</span>
            <span>{isPinned ? 'Unpin Favorite' : 'Pin to Top'}</span>
          </button>
          <button
            type="button"
            className={styles.stickerDropdownItem}
            onClick={() => {
              onActionFeedback(`Adjusted rhythm schedule for ${practice.title}`);
              onCloseMenu();
            }}
          >
            <span>⏱️</span>
            <span>Adjust Rhythm</span>
          </button>
          <button
            type="button"
            className={styles.stickerDropdownItem}
            onClick={() => {
              onActionFeedback(`Opened archive history for ${practice.title}`);
              onCloseMenu();
            }}
          >
            <span>📖</span>
            <span>Practice History</span>
          </button>
        </div>
      )}

      {/* Floating Micro-Tooltip */}
      {resolvedMode === 'tooltip' && showTooltip && (
        <div className={styles.stickerTooltip} role="tooltip">
          {getCircadianGuidance(practice.id)}
        </div>
      )}
    </div>
  );
}

const SAMPLE_PRACTICES: PracticeSpec[] = [
  {
    id: 'fire_journal',
    emoji: '🌅',
    title: 'Fire Journal',
    category: 'Wellbeing · Release',
    description:
      'Release heavy reflections and worries to the quiet fire. Only an anonymized preview remains in your history.',
    sessions: 14,
    rhythm: 'Morning flow',
    isFocus: true,
  },
  {
    id: 'mood_lotus',
    emoji: '🪷',
    title: 'Mood Lotus',
    category: 'Somatic · Presence',
    description:
      'Check in with your nervous system and emotional climate through an intuitive 5-petal contemplative lotus.',
    sessions: 28,
    rhythm: 'Midday reset',
    isFocus: true,
  },
  {
    id: 'breath_guide',
    emoji: '🌬️',
    title: 'Breath Guide',
    category: 'Circadian · Rhythm',
    description:
      'Paced somatic breathing calibrated to your physiological tempo to restore mental clarity between teaching blocks.',
    sessions: 9,
    rhythm: 'Between classes',
  },
];

export function PracticeCardCandidates() {
  const [testWidth, setTestWidth] = useState(440);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set(['fire_journal']));
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [lastLaunched, setLastLaunched] = useState<string | null>(null);
  const [chargingId, setChargingId] = useState<string | null>(null);

  // ─── Dynamic Corner Sticker State ───
  const [stickerMode, setStickerMode] = useState<CornerStickerMode>('mixed');
  const [dotOrientation, setDotOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [stickerCounts, setStickerCounts] = useState<Record<string, number>>({
    fire_journal: 14,
    mood_lotus: 28,
    breath_guide: 9,
  });
  const [stickerStatuses, setStickerStatuses] = useState<Record<string, 'ready' | 'busy' | 'syncing'>>({
    fire_journal: 'ready',
    mood_lotus: 'busy',
    breath_guide: 'ready',
  });
  const [activeCornerDropdownId, setActiveCornerDropdownId] = useState<string | null>(null);
  const [lastStickerAction, setLastStickerAction] = useState<string | null>(null);

  const actionTimerRef = useRef<NodeJS.Timeout | null>(null);
  function handleStickerActionFeedback(msg: string) {
    setLastStickerAction(msg);
    if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
    actionTimerRef.current = setTimeout(() => setLastStickerAction(null), 3500);
  }

  function handleIncrementCount(id: string) {
    setStickerCounts((prev) => ({
      ...prev,
      [id]: (prev[id] ?? 0) + 1,
    }));
  }

  function handleCycleStatus(id: string) {
    setStickerStatuses((prev) => {
      const current = prev[id] ?? 'ready';
      const next: 'ready' | 'busy' | 'syncing' =
        current === 'ready' ? 'busy' : current === 'busy' ? 'syncing' : 'ready';
      handleStickerActionFeedback(`Set status for ${id.replace('_', ' ')} to ${next.toUpperCase()}`);
      return { ...prev, [id]: next };
    });
  }

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);
  const pointerStartPosRef = useRef<{ x: number; y: number } | null>(null);

  function togglePin(id: string, e?: React.MouseEvent) {
    e?.stopPropagation();
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function launchPractice(practice: PracticeSpec) {
    setLastLaunched(practice.title);
    setTimeout(() => setLastLaunched(null), 3000);
  }

  // ─── Precision Long-Press / Long-Click Gestural Engine ───
  function handlePointerDown(practice: PracticeSpec, e: React.PointerEvent) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    isLongPressTriggeredRef.current = false;
    pointerStartPosRef.current = { x: e.clientX, y: e.clientY };
    setChargingId(practice.id);

    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(20);
        } catch {}
      }
      setActiveMenuId(practice.id);
      setChargingId(null);
    }, 450);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!pointerStartPosRef.current || !longPressTimerRef.current) return;
    const dx = Math.abs(e.clientX - pointerStartPosRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartPosRef.current.y);

    if (dx > 8 || dy > 8) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
      setChargingId(null);
      pointerStartPosRef.current = null;
    }
  }

  function handlePointerUp(practice: PracticeSpec) {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!isLongPressTriggeredRef.current && chargingId === practice.id) {
      launchPractice(practice);
    }

    setChargingId(null);
    pointerStartPosRef.current = null;
  }

  function handlePointerCancel() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setChargingId(null);
    pointerStartPosRef.current = null;
  }

  function handleContextMenu(practice: PracticeSpec, e: React.MouseEvent) {
    e.preventDefault();
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setChargingId(null);
    setActiveMenuId(practice.id);
  }

  const activePractice = SAMPLE_PRACTICES.find((p) => p.id === activeMenuId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* 🛠 Interactive Controls: Container Width & Tactile Guidance */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1.15rem 1.35rem',
          borderRadius: '0.85rem',
          background: 'var(--w-ground)',
          border: '1px solid var(--w-line)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 320px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--w-ink)' }}>
            Grid Container Width: <strong style={{ color: 'var(--w-lamp)' }}>{testWidth}px</strong>
          </span>
          <input
            type="range"
            min={240}
            max={680}
            value={testWidth}
            onChange={(e) => setTestWidth(Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--w-lamp)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setTestWidth(540)}
            type="button"
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              border: '1px solid var(--w-line)',
              background: testWidth === 540 ? 'var(--w-lamp)' : 'var(--w-surface-raised-bg)',
              color: testWidth === 540 ? '#ffffff' : 'var(--w-ink)',
              cursor: 'pointer',
            }}
          >
            Wide Grid (540px)
          </button>
          <button
            onClick={() => setTestWidth(420)}
            type="button"
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              border: '1px solid var(--w-line)',
              background: testWidth === 420 ? 'var(--w-lamp)' : 'var(--w-surface-raised-bg)',
              color: testWidth === 420 ? '#ffffff' : 'var(--w-ink)',
              cursor: 'pointer',
            }}
          >
            Balanced (420px)
          </button>
          <button
            onClick={() => setTestWidth(320)}
            type="button"
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              border: '1px solid var(--w-line)',
              background: testWidth === 320 ? 'var(--w-lamp)' : 'var(--w-surface-raised-bg)',
              color: testWidth === 320 ? '#ffffff' : 'var(--w-ink)',
              cursor: 'pointer',
            }}
          >
            Mobile (320px)
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--w-ink-soft)' }}>
          <span>💡 <strong>Quick Tap</strong> = Launch · <strong>Press & Hold (450ms)</strong> = Bottom Sheet</span>
          {lastLaunched ? (
            <span
              style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                background: 'color-mix(in srgb, var(--w-lamp) 15%, var(--w-ground))',
                border: '1px solid var(--w-lamp)',
                color: 'var(--w-lamp)',
                fontWeight: 600,
              }}
            >
              ✓ Launched {lastLaunched}!
            </span>
          ) : null}
        </div>

        {/* ─── Corner Sticker Mode Switcher & Realtime Dynamic Controls ─── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            flexWrap: 'wrap',
            gap: '0.75rem',
            borderTop: '1px dashed var(--w-line)',
            paddingTop: '0.85rem',
            marginTop: '0.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--w-ink)', marginRight: '0.25rem' }}>
              Sticker Slot Mode:
            </span>
            {(
              [
                { id: 'mixed', label: '🎲 Mixed (Server State)' },
                { id: 'menu', label: '••• 3-Dot Menu' },
                { id: 'counter', label: '🔢 Badge Counter' },
                { id: 'pin', label: '📍 Pin Toggle' },
                { id: 'tooltip', label: '💡 Context Tooltip' },
                { id: 'status', label: '● Live Status' },
              ] as const
            ).map((item) => {
              const isSelected = stickerMode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setStickerMode(item.id);
                    setActiveCornerDropdownId(null);
                  }}
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                    fontSize: '0.73rem',
                    fontWeight: isSelected ? 700 : 500,
                    border: '1px solid var(--w-line)',
                    background: isSelected ? 'var(--w-lamp)' : 'var(--w-surface-raised-bg)',
                    color: isSelected ? '#ffffff' : 'var(--w-ink)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Dots Orientation Sub-Toggle for Menu & Mixed modes */}
            {(stickerMode === 'menu' || stickerMode === 'mixed') && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  marginLeft: '0.45rem',
                  paddingLeft: '0.45rem',
                  borderLeft: '1px solid var(--w-line)',
                }}
              >
                <span style={{ fontSize: '0.72rem', color: 'var(--w-ink-soft)' }}>Dots:</span>
                <button
                  type="button"
                  onClick={() => setDotOrientation('vertical')}
                  style={{
                    padding: '0.18rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: dotOrientation === 'vertical' ? 700 : 500,
                    border: '1px solid var(--w-line)',
                    background: dotOrientation === 'vertical' ? 'var(--w-lamp)' : 'var(--w-surface-raised-bg)',
                    color: dotOrientation === 'vertical' ? '#ffffff' : 'var(--w-ink)',
                    cursor: 'pointer',
                  }}
                >
                  ⋮ Vertical
                </button>
                <button
                  type="button"
                  onClick={() => setDotOrientation('horizontal')}
                  style={{
                    padding: '0.18rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: dotOrientation === 'horizontal' ? 700 : 500,
                    border: '1px solid var(--w-line)',
                    background: dotOrientation === 'horizontal' ? 'var(--w-lamp)' : 'var(--w-surface-raised-bg)',
                    color: dotOrientation === 'horizontal' ? '#ffffff' : 'var(--w-ink)',
                    cursor: 'pointer',
                  }}
                >
                  … Horizontal
                </button>
              </div>
            )}
          </div>

          {lastStickerAction ? (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                background: 'color-mix(in srgb, var(--w-lamp) 18%, var(--w-ground))',
                border: '1px solid var(--w-lamp)',
                color: 'var(--w-lamp)',
                fontWeight: 600,
              }}
            >
              ✓ {lastStickerAction}
            </span>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--w-ink-ghost)' }}>
              ⚡ Tap sticker independently to test touch isolation
            </span>
          )}
        </div>
      </div>

      {/* ─── SHOWCASE: Height/Width Balanced Architectural Units (No Flat Strips) ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

        {/* ─── 🏆 SIDE-BY-SIDE COMPARISON: Pebble A vs Pebble B vs Pebble C ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem' }}>
          
          {/* ─── PEBBLE A: The Baseline Pebble (No Corner Sticker) ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--w-ink-soft)' }}>
                  Pebble A (Baseline)
                </span>
                <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', borderRadius: '4px', background: 'var(--w-ground)', border: '1px solid var(--w-line)' }}>
                  Pure Face
                </span>
              </div>
              <h3 style={{ margin: '0.25rem 0', fontFamily: 'var(--w-font-display, Georgia)', fontSize: '1.25rem' }}>
                The Baseline Pebble
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--w-ink-soft)' }}>
                Clean face with no corner attachments. Tactile 1:1 squircle.
              </p>
            </div>

            <div className={styles.candidateContainer}>
              <div className={styles.pebbleGrid}>
                {SAMPLE_PRACTICES.map((practice) => {
                  const isCharging = chargingId === practice.id;
                  return (
                    <div
                      key={`pebble-a-${practice.id}`}
                      className={styles.pebbleTile}
                      data-charging={isCharging || undefined}
                      onPointerDown={(e) => handlePointerDown(practice, e)}
                      onPointerMove={handlePointerMove}
                      onPointerUp={() => handlePointerUp(practice)}
                      onPointerLeave={handlePointerCancel}
                      onPointerCancel={handlePointerCancel}
                      onContextMenu={(e) => handleContextMenu(practice, e)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') launchPractice(practice);
                      }}
                      title="Quick tap to launch · Hold or right-click for details"
                    >
                      <div className={styles.pebbleTop}>
                        <span className={styles.pebbleEmoji} aria-hidden="true">
                          {practice.emoji}
                        </span>
                      </div>

                      <div className={styles.pebbleBottom}>
                        <h4 className={styles.pebbleTitle}>{practice.title}</h4>
                        <div className={styles.pebbleRhythmRow}>
                          <span className={styles.pebblePulseDot} />
                          <span>{practice.rhythm}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─── PEBBLE B: The Corner-Sticker Pebble (Autonomous Container & Dynamic Slots) ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--w-lamp)' }}>
                  Pebble B (New)
                </span>
                <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', borderRadius: '4px', background: 'var(--w-ground)', border: '1px solid var(--w-line)' }}>
                  Autonomous Corner Container · Dynamic Slots
                </span>
              </div>
              <h3 style={{ margin: '0.25rem 0', fontFamily: 'var(--w-font-display, Georgia)', fontSize: '1.25rem' }}>
                The Corner-Sticker Pebble
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--w-ink-soft)' }}>
                Dedicated sub-container with independent touch target and micro-spring tactile physics. Holds pins, 3-dot menus, counters, tooltips, or live status without leaking taps to the card.
              </p>
            </div>

            <div className={styles.candidateContainer}>
              <div className={styles.pebbleGrid}>
                {SAMPLE_PRACTICES.map((practice) => {
                  const isPinned = pinnedIds.has(practice.id);
                  const isCharging = chargingId === practice.id;
                  const count = stickerCounts[practice.id] ?? practice.sessions;
                  const status = stickerStatuses[practice.id] ?? 'ready';
                  const isOpenMenu = activeCornerDropdownId === practice.id;

                  return (
                    <div
                      key={`pebble-b-${practice.id}`}
                      className={styles.pebbleTile}
                      data-charging={isCharging || undefined}
                      onPointerDown={(e) => handlePointerDown(practice, e)}
                      onPointerMove={handlePointerMove}
                      onPointerUp={() => handlePointerUp(practice)}
                      onPointerLeave={handlePointerCancel}
                      onPointerCancel={handlePointerCancel}
                      onContextMenu={(e) => handleContextMenu(practice, e)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') launchPractice(practice);
                      }}
                      title="Quick tap to launch · Hold or right-click for details"
                    >
                      {/* Top-Right Quarter-Circle Autonomous Sub-Container */}
                      <PebbleCornerStickerContainer
                        practice={practice}
                        mode={stickerMode}
                        isPinned={isPinned}
                        count={count}
                        status={status}
                        isOpenMenu={isOpenMenu}
                        dotOrientation={dotOrientation}
                        onTogglePin={(id) => togglePin(id)}
                        onToggleMenu={(id) =>
                          setActiveCornerDropdownId((curr) => (curr === id ? null : id))
                        }
                        onCloseMenu={() => setActiveCornerDropdownId(null)}
                        onIncrementCount={handleIncrementCount}
                        onCycleStatus={handleCycleStatus}
                        onActionFeedback={handleStickerActionFeedback}
                      />

                      <div className={styles.pebbleTop}>
                        <span className={styles.pebbleEmoji} aria-hidden="true">
                          {practice.emoji}
                        </span>
                      </div>

                      <div className={styles.pebbleBottom}>
                        <h4 className={styles.pebbleTitle}>{practice.title}</h4>
                        {/* Pure rhythm row - zero pin clutter */}
                        <div className={styles.pebbleRhythmRow}>
                          <span className={styles.pebblePulseDot} />
                          <span>{practice.rhythm}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─── PEBBLE C: The Compact Squircle (Mobile-Optimized · 3rd Line Dropped) ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--w-lamp)' }}>
                  Pebble C (Compact)
                </span>
                <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', borderRadius: '4px', background: 'var(--w-ground)', border: '1px solid var(--w-line)' }}>
                  Zero 3rd Line · Pure 1:1 Face
                </span>
              </div>
              <h3 style={{ margin: '0.25rem 0', fontFamily: 'var(--w-font-display, Georgia)', fontSize: '1.25rem' }}>
                The Compact Squircle
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--w-ink-soft)' }}>
                3rd line dropped completely. Scaled corner sticker, pure emoji, and bold title. Fits 3 across on any mobile device with zero crowding.
              </p>
            </div>

            <div className={styles.candidateContainer}>
              <div className={styles.compactPebbleGrid}>
                {SAMPLE_PRACTICES.map((practice) => {
                  const isPinned = pinnedIds.has(practice.id);
                  const isCharging = chargingId === practice.id;
                  const count = stickerCounts[practice.id] ?? practice.sessions;
                  const status = stickerStatuses[practice.id] ?? 'ready';
                  const isOpenMenu = activeCornerDropdownId === practice.id;

                  return (
                    <div
                      key={`pebble-c-${practice.id}`}
                      className={styles.compactPebbleTile}
                      data-charging={isCharging || undefined}
                      onPointerDown={(e) => handlePointerDown(practice, e)}
                      onPointerMove={handlePointerMove}
                      onPointerUp={() => handlePointerUp(practice)}
                      onPointerLeave={handlePointerCancel}
                      onPointerCancel={handlePointerCancel}
                      onContextMenu={(e) => handleContextMenu(practice, e)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') launchPractice(practice);
                      }}
                      title="Quick tap to launch · Hold or right-click for details"
                    >
                      {/* Scaled Top-Right Quarter-Circle Autonomous Sub-Container */}
                      <PebbleCornerStickerContainer
                        practice={practice}
                        mode={stickerMode}
                        isPinned={isPinned}
                        count={count}
                        status={status}
                        isOpenMenu={isOpenMenu}
                        dotOrientation={dotOrientation}
                        compact={true}
                        onTogglePin={(id) => togglePin(id)}
                        onToggleMenu={(id) =>
                          setActiveCornerDropdownId((curr) => (curr === id ? null : id))
                        }
                        onCloseMenu={() => setActiveCornerDropdownId(null)}
                        onIncrementCount={handleIncrementCount}
                        onCycleStatus={handleCycleStatus}
                        onActionFeedback={handleStickerActionFeedback}
                      />

                      <div className={styles.compactPebbleTop}>
                        <span className={styles.compactPebbleEmoji} aria-hidden="true">
                          {practice.emoji}
                        </span>
                      </div>

                      <div className={styles.compactPebbleBottom}>
                        <h4 className={styles.compactPebbleTitle}>{practice.title}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* ─── 📐 SPATIAL ERGONOMICS: Web (G3) vs Tablet (G2) vs Mobile (G1) ─── */}
        <div style={{ borderTop: '1px solid var(--w-line)', paddingTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--w-ink-ghost)' }}>
                Spatial Ergonomics & Viewport Surface Ratio (VSR)
              </span>
              <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', borderRadius: '4px', background: 'var(--w-ground)', border: '1px solid var(--w-line)' }}>
                Target VSR ≤ 2.5%
              </span>
            </div>
            <h4 style={{ margin: '0.25rem 0', fontSize: '1.15rem', color: 'var(--w-ink)' }}>
              Form-Factor Degradation Gears (Real Pixel Proportions)
            </h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--w-ink-soft)' }}>
              Comparing how dropping the 3rd line ensures the pebble maintains a tactile 1:1 squircle across Web, Tablet, and Mobile 3-in-a-row.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Gear 3: Web Desktop (156px) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--w-ink-soft)' }}>
                🖥️ Web Desktop (156px Pebble · G3 Full)
              </span>
              <div style={{ width: '156px' }}>
                <div className={styles.pebbleTile} style={{ width: '100%', maxWidth: 'none' }}>
                  <PebbleCornerStickerContainer
                    practice={SAMPLE_PRACTICES[0]!}
                    mode={stickerMode}
                    isPinned={pinnedIds.has('fire_journal')}
                    count={stickerCounts['fire_journal'] ?? 14}
                    status={stickerStatuses['fire_journal'] ?? 'ready'}
                    isOpenMenu={activeCornerDropdownId === 'fire_journal_demo_1'}
                    dotOrientation={dotOrientation}
                    onTogglePin={togglePin}
                    onToggleMenu={(id) => setActiveCornerDropdownId((c) => (c === id ? null : id))}
                    onCloseMenu={() => setActiveCornerDropdownId(null)}
                    onIncrementCount={handleIncrementCount}
                    onCycleStatus={handleCycleStatus}
                    onActionFeedback={handleStickerActionFeedback}
                  />
                  <div className={styles.pebbleTop}>
                    <span className={styles.pebbleEmoji}>🌅</span>
                  </div>
                  <div className={styles.pebbleBottom}>
                    <h4 className={styles.pebbleTitle}>Fire Journal</h4>
                    <div className={styles.pebbleRhythmRow}>
                      <span className={styles.pebblePulseDot} />
                      <span>Morning flow</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gear 2: Tablet (124px) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--w-ink-soft)' }}>
                📱 Tablet (124px Pebble · G2 Medium)
              </span>
              <div style={{ width: '124px' }}>
                <div className={styles.pebbleTile} style={{ width: '100%', maxWidth: 'none', padding: '1rem 0.65rem 1.15rem 0.65rem' }}>
                  <PebbleCornerStickerContainer
                    practice={SAMPLE_PRACTICES[0]!}
                    mode={stickerMode}
                    isPinned={pinnedIds.has('fire_journal')}
                    count={stickerCounts['fire_journal'] ?? 14}
                    status={stickerStatuses['fire_journal'] ?? 'ready'}
                    isOpenMenu={activeCornerDropdownId === 'fire_journal_demo_2'}
                    dotOrientation={dotOrientation}
                    compact={true}
                    onTogglePin={togglePin}
                    onToggleMenu={(id) => setActiveCornerDropdownId((c) => (c === id ? null : id))}
                    onCloseMenu={() => setActiveCornerDropdownId(null)}
                    onIncrementCount={handleIncrementCount}
                    onCycleStatus={handleCycleStatus}
                    onActionFeedback={handleStickerActionFeedback}
                  />
                  <div className={styles.pebbleTop}>
                    <span className={styles.pebbleEmoji} style={{ fontSize: '2.05rem' }}>🌅</span>
                  </div>
                  <div className={styles.pebbleBottom}>
                    <h4 className={styles.pebbleTitle} style={{ fontSize: '0.92rem' }}>Fire Journal</h4>
                    <div className={styles.pebbleRhythmRow}>
                      <span className={styles.pebblePulseDot} />
                      <span>Morning flow</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gear 1: Mobile 3-in-a-Row (98px) - 3RD LINE DROPPED COMPLETELY */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--w-lamp)' }}>
                📲 Mobile 3-Across (98px Squircle · 3rd Line Dropped)
              </span>
              <div style={{ width: '98px' }}>
                <div className={styles.compactPebbleTile} style={{ width: '100%' }}>
                  <PebbleCornerStickerContainer
                    practice={SAMPLE_PRACTICES[0]!}
                    mode={stickerMode}
                    isPinned={pinnedIds.has('fire_journal')}
                    count={stickerCounts['fire_journal'] ?? 14}
                    status={stickerStatuses['fire_journal'] ?? 'ready'}
                    isOpenMenu={activeCornerDropdownId === 'fire_journal_demo_3'}
                    dotOrientation={dotOrientation}
                    compact={true}
                    onTogglePin={togglePin}
                    onToggleMenu={(id) => setActiveCornerDropdownId((c) => (c === id ? null : id))}
                    onCloseMenu={() => setActiveCornerDropdownId(null)}
                    onIncrementCount={handleIncrementCount}
                    onCycleStatus={handleCycleStatus}
                    onActionFeedback={handleStickerActionFeedback}
                  />
                  <div className={styles.compactPebbleTop}>
                    <span className={styles.compactPebbleEmoji}>🌅</span>
                  </div>
                  <div className={styles.compactPebbleBottom}>
                    <h4 className={styles.compactPebbleTitle}>Fire Journal</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── REFERENCE COMPARISONS ─── */}
        <div style={{ borderTop: '1px solid var(--w-line)', paddingTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--w-ink-ghost)' }}>
            Reference Comparisons (Other Balanced Shapes)
          </span>

          {/* Reference: The 4C Balanced Tile (4:3 Squircle Module) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--w-ink)' }}>
              Shape 1: The 4C Balanced Tile (4:3 Squircle)
            </h4>
            <div
              className={styles.candidateContainer}
              style={{
                width: `${testWidth}px`,
                maxWidth: '100%',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 150px), 1fr))',
                gap: '1rem',
              }}
            >
              {SAMPLE_PRACTICES.map((practice) => {
                const isPinned = pinnedIds.has(practice.id);
                const isCharging = chargingId === practice.id;
                return (
                  <div
                    key={`tile-${practice.id}`}
                    className={styles.balancedTile}
                    data-charging={isCharging || undefined}
                    onPointerDown={(e) => handlePointerDown(practice, e)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={() => handlePointerUp(practice)}
                    onPointerLeave={handlePointerCancel}
                    onPointerCancel={handlePointerCancel}
                    onContextMenu={(e) => handleContextMenu(practice, e)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') launchPractice(practice);
                    }}
                  >
                    <div className={styles.tileTop}>
                      <span className={styles.freeGlowEmoji} aria-hidden="true">
                        {practice.emoji}
                      </span>
                      {isPinned ? (
                        <span title="Pinned to quick access" style={{ fontSize: '0.85rem', color: 'var(--w-lamp)' }}>
                          📍
                        </span>
                      ) : null}
                    </div>

                    <div className={styles.tileBottom}>
                      <h4 className={styles.tileTitle}>{practice.title}</h4>
                      <span className={styles.tileRhythm}>
                        <span className={styles.tilePulseDot} />
                        <span>{practice.rhythm}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reference: The 4C Balanced Split-Box (3:2 Architectural Module) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--w-ink)' }}>
              Shape 2: The 4C Balanced Split-Box (3:2 Module)
            </h4>
            <div
              className={styles.candidateContainer}
              style={{
                width: `${testWidth}px`,
                maxWidth: '100%',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 210px), 1fr))',
                gap: '1rem',
              }}
            >
              {SAMPLE_PRACTICES.map((practice) => {
                const isPinned = pinnedIds.has(practice.id);
                const isCharging = chargingId === practice.id;
                return (
                  <div
                    key={`split-${practice.id}`}
                    className={styles.splitBox}
                    data-charging={isCharging || undefined}
                    onPointerDown={(e) => handlePointerDown(practice, e)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={() => handlePointerUp(practice)}
                    onPointerLeave={handlePointerCancel}
                    onPointerCancel={handlePointerCancel}
                    onContextMenu={(e) => handleContextMenu(practice, e)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') launchPractice(practice);
                    }}
                  >
                    <div className={styles.splitGutter} aria-hidden="true">
                      <span className={styles.freeGlowEmoji}>{practice.emoji}</span>
                      <div className={styles.splitGutterLamp} />
                    </div>

                    <div className={styles.splitBody}>
                      <h4 className={styles.splitTitle}>{practice.title}</h4>

                      <div className={styles.splitBottom}>
                        <span className={styles.tileRhythm}>
                          <span className={styles.tilePulseDot} />
                          <span>{practice.rhythm}</span>
                        </span>
                        {isPinned ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--w-lamp)' }}>📍</span>
                        ) : (
                          <span style={{ color: 'var(--w-ink-ghost)' }}>
                            <ChevronRight size={14} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ─── Transparent Backdrop for Dismissing Active Sticker Dropdown ─── */}
      {activeCornerDropdownId && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 35, background: 'transparent' }}
          onClick={() => setActiveCornerDropdownId(null)}
        />
      )}

      {/* ─── Mobile Bottom Sheet / Orientation Popover Modal ─── */}
      {activePractice ? (
        <>
          <div className={styles.popoverBackdrop} onClick={() => setActiveMenuId(null)} />
          <div className={styles.orientationPopover} role="dialog" aria-labelledby="popover-title">
            {/* Mobile Sheet Drag Handle */}
            <div className={styles.sheetDragHandle} />

            <div className={styles.popoverHeading}>
              <span className={styles.pebbleEmoji} style={{ fontSize: '1.85rem' }}>
                {activePractice.emoji}
              </span>
              <div>
                <h4 id="popover-title" style={{ margin: 0 }}>{activePractice.title}</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--w-ink-soft)' }}>
                  {activePractice.category}
                </span>
              </div>
            </div>

            <p className={styles.popoverDescription}>{activePractice.description}</p>

            <div style={{ fontSize: '0.78rem', color: 'var(--w-ink-soft)' }}>
              <strong>Circadian Timing:</strong> {activePractice.rhythm} · Zero private logs retained
            </div>

            <div className={styles.popoverActionRow}>
              <button
                type="button"
                className={styles.popoverBtn}
                onClick={(e) => {
                  togglePin(activePractice.id, e);
                  setActiveMenuId(null);
                }}
              >
                {pinnedIds.has(activePractice.id) ? '📌 Unpin Favorite' : '📍 Pin Favorite'}
              </button>
              <button
                type="button"
                className={styles.popoverBtn}
                style={{ background: 'var(--w-lamp)', color: '#ffffff', borderColor: 'var(--w-lamp)' }}
                onClick={() => {
                  launchPractice(activePractice);
                  setActiveMenuId(null);
                }}
              >
                Launch Practice →
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
