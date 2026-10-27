'use client';

import {
  Button,
  Chip,
  Chips,
  Row,
  Section,
  Surface,
  Text,
  TextField,
  WorldScope,
} from '@repo/ui/world/dom';
import type { WorldId, WorldMode, WorldPhase } from '@repo/ui/world/types';
import { WORLD_IDS, WORLDS } from '@repo/ui/world';
import {
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Eye,
  EyeOff,
  Flame,
  Heart,
  Moon,
  Sparkles,
  Sun,
  Users,
  Wind,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LivingLandscapeScene } from './LivingLandscapeScene';
import styles from './living-domain.module.css';

/* --------------------------------------------------------------------------
   Atmospheric Celestial Sky & Dynamic Starry Lighting Matrix
--------------------------------------------------------------------------- */
interface CelestialConfig {
  top: string;
  horizon: string;
  orbX: string;
  orbY: string;
  orbSize: string;
  orbBg: string;
  orbGlow: string;
  orbCorona: string;
  isMoon: boolean;
  atmosphereDescription: string;
}

const CELESTIAL_CONFIGS: Record<WorldMode, Record<WorldPhase, CelestialConfig>> = {
  light: {
    predawn: {
      top: '#1E293B',
      horizon: '#475569',
      orbX: '22%',
      orbY: '68%',
      orbSize: '54px',
      orbBg: 'radial-gradient(circle at 35% 35%, #F1F5F9 0%, #94A3B8 100%)',
      orbGlow: 'rgba(241, 245, 249, 0.5)',
      orbCorona: 'rgba(148, 163, 184, 0.25)',
      isMoon: true,
      atmosphereDescription: 'Cool silver twilight mist, gentle morning star fading.',
    },
    dawn: {
      top: '#FDBA74',
      horizon: '#FED7AA',
      orbX: '32%',
      orbY: '48%',
      orbSize: '76px',
      orbBg: 'radial-gradient(circle at 35% 35%, #FFFBEB 0%, #F59E0B 80%)',
      orbGlow: 'rgba(245, 158, 11, 0.6)',
      orbCorona: 'rgba(254, 215, 170, 0.45)',
      isMoon: false,
      atmosphereDescription: 'Warm amber and saffron sunrise touching the horizon.',
    },
    morning: {
      top: '#BAE6FD',
      horizon: '#E0F2FE',
      orbX: '48%',
      orbY: '24%',
      orbSize: '92px',
      orbBg: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #FDE047 75%)',
      orbGlow: 'rgba(253, 224, 71, 0.7)',
      orbCorona: 'rgba(186, 230, 253, 0.4)',
      isMoon: false,
      atmosphereDescription: 'Bright golden solar rays, clear sky, high morning vitality.',
    },
    afternoon: {
      top: '#7DD3FC',
      horizon: '#FEF08A',
      orbX: '66%',
      orbY: '28%',
      orbSize: '96px',
      orbBg: 'radial-gradient(circle at 35% 35%, #FFFBEB 0%, #F59E0B 80%)',
      orbGlow: 'rgba(245, 158, 11, 0.65)',
      orbCorona: 'rgba(254, 240, 138, 0.4)',
      isMoon: false,
      atmosphereDescription: 'Warm golden afternoon glow, deep shade under trees.',
    },
    dusk: {
      top: '#7C2D12',
      horizon: '#EA580C',
      orbX: '82%',
      orbY: '62%',
      orbSize: '88px',
      orbBg: 'radial-gradient(circle at 35% 35%, #FED7AA 0%, #DC2626 80%)',
      orbGlow: 'rgba(220, 38, 38, 0.7)',
      orbCorona: 'rgba(234, 88, 12, 0.5)',
      isMoon: false,
      atmosphereDescription: 'Deep terracotta & amethyst twilight, oil lamps light up.',
    },
    night: {
      top: '#0F172A',
      horizon: '#1E293B',
      orbX: '76%',
      orbY: '32%',
      orbSize: '62px',
      orbBg: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #E2E8F0 60%, #94A3B8 100%)',
      orbGlow: 'rgba(255, 255, 255, 0.6)',
      orbCorona: 'rgba(203, 213, 225, 0.35)',
      isMoon: true,
      atmosphereDescription: 'Moonlit silence, celestial fireflies, soft night breeze.',
    },
  },
  dark: {
    predawn: {
      top: '#040711',
      horizon: '#0F1A2E',
      orbX: '22%',
      orbY: '68%',
      orbSize: '50px',
      orbBg: 'radial-gradient(circle at 35% 35%, #CBD5E1 0%, #475569 100%)',
      orbGlow: 'rgba(203, 213, 225, 0.35)',
      orbCorona: 'rgba(71, 85, 105, 0.25)',
      isMoon: true,
      atmosphereDescription: 'Cold midnight mist, solitary moon on the horizon.',
    },
    dawn: {
      top: '#1A0C08',
      horizon: '#431407',
      orbX: '32%',
      orbY: '48%',
      orbSize: '68px',
      orbBg: 'radial-gradient(circle at 35% 35%, #FB923C 0%, #9A3412 85%)',
      orbGlow: 'rgba(251, 146, 60, 0.55)',
      orbCorona: 'rgba(154, 52, 18, 0.35)',
      isMoon: false,
      atmosphereDescription: 'Deep ember horizon breaking through the dark silence.',
    },
    morning: {
      top: '#081420',
      horizon: '#0C283E',
      orbX: '48%',
      orbY: '24%',
      orbSize: '82px',
      orbBg: 'radial-gradient(circle at 35% 35%, #38BDF8 0%, #0369A1 85%)',
      orbGlow: 'rgba(56, 189, 248, 0.5)',
      orbCorona: 'rgba(3, 105, 161, 0.3)',
      isMoon: false,
      atmosphereDescription: 'Cool azure daylight over deep stone and water.',
    },
    afternoon: {
      top: '#161108',
      horizon: '#3A270D',
      orbX: '66%',
      orbY: '28%',
      orbSize: '86px',
      orbBg: 'radial-gradient(circle at 35% 35%, #FBBF24 0%, #B45309 85%)',
      orbGlow: 'rgba(251, 191, 36, 0.55)',
      orbCorona: 'rgba(180, 83, 9, 0.35)',
      isMoon: false,
      atmosphereDescription: 'Warm amber solar wash warming stone and wooden surfaces.',
    },
    dusk: {
      top: '#1E070F',
      horizon: '#4C0519',
      orbX: '82%',
      orbY: '62%',
      orbSize: '78px',
      orbBg: 'radial-gradient(circle at 35% 35%, #F43F5E 0%, #9F1239 85%)',
      orbGlow: 'rgba(244, 63, 94, 0.6)',
      orbCorona: 'rgba(159, 18, 57, 0.4)',
      isMoon: false,
      atmosphereDescription: 'Crimson twilight, ceremonial oil lamps brightly lit.',
    },
    night: {
      top: '#02040A',
      horizon: '#090E17',
      orbX: '76%',
      orbY: '32%',
      orbSize: '58px',
      orbBg: 'radial-gradient(circle at 35% 35%, #F8FAFC 0%, #94A3B8 65%, #334155 100%)',
      orbGlow: 'rgba(248, 250, 252, 0.55)',
      orbCorona: 'rgba(148, 163, 184, 0.3)',
      isMoon: true,
      atmosphereDescription: 'Star-filled cosmic stillness, cool silver moonlight caustics.',
    },
  },
};

const PHASE_TITLES: Record<WorldPhase, { label: string; hour: number; sinhala: string }> = {
  predawn: { label: 'Predawn (Brahma Muhurta)', hour: 5, sinhala: 'බ්‍රහ්ම මුහුර්ථය' },
  dawn: { label: 'Dawn (Udaya)', hour: 7, sinhala: 'උදය කාලය' },
  morning: { label: 'Morning (Prabhata)', hour: 10, sinhala: 'ප්‍රභාතය' },
  afternoon: { label: 'Afternoon (Madhyahna)', hour: 14, sinhala: 'මධ්‍යාහ්නය' },
  dusk: { label: 'Dusk (Sandhya)', hour: 18, sinhala: 'සන්ධ්‍යාව' },
  night: { label: 'Night (Ratri)', hour: 22, sinhala: 'රාත්‍රිය' },
};

function hourToPhase(hour: number): WorldPhase {
  if (hour >= 4 && hour < 6) return 'predawn';
  if (hour >= 6 && hour < 9) return 'dawn';
  if (hour >= 9 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
}

type Domain = 'self' | 'workspace' | 'community' | 'library';

interface StudentRoster {
  id: string;
  name: string;
  roll: number;
  present: boolean;
}

const INITIAL_ROSTER: StudentRoster[] = [
  { id: '1', name: 'Naveen S.', roll: 1, present: true },
  { id: '2', name: 'Anuki P.', roll: 2, present: true },
  { id: '3', name: 'Kasun D.', roll: 3, present: true },
  { id: '4', name: 'Tharushi W.', roll: 4, present: false },
  { id: '5', name: 'Sahan M.', roll: 5, present: true },
  { id: '6', name: 'Buddhika R.', roll: 6, present: true },
  { id: '7', name: 'Methmi K.', roll: 7, present: false },
  { id: '8', name: 'Isuru T.', roll: 8, present: true },
];

/* --------------------------------------------------------------------------
   Cultural Ornament SVG Patterns
--------------------------------------------------------------------------- */
function CulturalOrnamentSvg({ world }: { world: WorldId }) {
  if (world === 'kandyan') {
    // Traditional Liyawela Vine Band
    return (
      <svg className={styles.ornamentSvg} viewBox="0 0 1200 24" preserveAspectRatio="none">
        <path d="M0,12 Q50,0 100,12 T200,12 T300,12 T400,12 T500,12 T600,12 T700,12 T800,12 T900,12 T1000,12 T1100,12 T1200,12 M0,16 Q50,24 100,16 T200,16 T300,16 T400,16 T500,16 T600,16 T700,16 T800,16 T900,16 T1000,16 T1100,16 T1200,16" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.75" />
        <circle cx="100" cy="12" r="3" />
        <circle cx="300" cy="12" r="3" />
        <circle cx="500" cy="12" r="3" />
        <circle cx="700" cy="12" r="3" />
        <circle cx="900" cy="12" r="3" />
        <circle cx="1100" cy="12" r="3" />
      </svg>
    );
  }
  if (world === 'wewa') {
    // Gentle Water Ripples
    return (
      <svg className={styles.ornamentSvg} viewBox="0 0 1200 24" preserveAspectRatio="none">
        <path d="M0,14 C150,4 250,24 400,14 C550,4 650,24 800,14 C950,4 1050,24 1200,14 M0,8 C150,18 250,-2 400,8 C550,18 650,-2 800,8 C950,18 1050,-2 1200,8" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.6" />
      </svg>
    );
  }
  if (world === 'kele') {
    // Swaying Forest Branches
    return (
      <svg className={styles.ornamentSvg} viewBox="0 0 1200 24" preserveAspectRatio="none">
        <path d="M0,12 L300,8 L350,16 L600,10 L650,18 L900,9 L950,17 L1200,12" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.65" />
        <circle cx="350" cy="16" r="3" />
        <circle cx="650" cy="18" r="3" />
        <circle cx="950" cy="17" r="3" />
      </svg>
    );
  }
  if (world === 'angampora') {
    // Disciplined Martial Studs & Line
    return (
      <svg className={styles.ornamentSvg} viewBox="0 0 1200 24" preserveAspectRatio="none">
        <line x1="0" y1="12" x2="1200" y2="12" stroke="currentColor" strokeWidth="1.5" />
        {Array.from({ length: 24 }).map((_, i) => (
          <rect key={i} x={i * 50 + 20} y="9" width="6" height="6" fill="currentColor" opacity="0.8" />
        ))}
      </svg>
    );
  }
  if (world === 'ratna') {
    // Beeralu Lace Filigree
    return (
      <svg className={styles.ornamentSvg} viewBox="0 0 1200 24" preserveAspectRatio="none">
        <path d="M0,6 Q25,18 50,6 T100,6 T150,6 T200,6 T250,6 T300,6 T350,6 T400,6 T450,6 T500,6 T550,6 T600,6 T650,6 T700,6 T750,6 T800,6 T850,6 T900,6 T950,6 T1000,6 T1050,6 T1100,6 T1150,6 T1200,6" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.75" />
        <circle cx="100" cy="14" r="2.5" />
        <circle cx="200" cy="14" r="2.5" />
        <circle cx="300" cy="14" r="2.5" />
        <circle cx="400" cy="14" r="2.5" />
        <circle cx="500" cy="14" r="2.5" />
      </svg>
    );
  }
  // Sanctuary Default (Lotus bud rhythm)
  return (
    <svg className={styles.ornamentSvg} viewBox="0 0 1200 24" preserveAspectRatio="none">
      <path d="M0,12 Q60,6 120,12 T240,12 T360,12 T480,12 T600,12 T720,12 T840,12 T960,12 T1080,12 T1200,12" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="240" cy="12" r="2" />
      <circle cx="480" cy="12" r="2" />
      <circle cx="720" cy="12" r="2" />
      <circle cx="960" cy="12" r="2" />
    </svg>
  );
}

export default function LivingDomainPrototypePage() {
  // Layer 1: Cultural World
  const [activeWorld, setActiveWorld] = useState<WorldId>('sanctuary');

  // Layer 2: Theme Light / Dark
  const [activeMode, setActiveMode] = useState<WorldMode>('light');

  // Layer 3: Circadian Hour & Phase
  const [currentHour, setCurrentHour] = useState<number>(9);
  const activePhase = useMemo(() => hourToPhase(currentHour), [currentHour]);

  // Real Domain Navigation
  const [activeDomain, setActiveDomain] = useState<Domain>('self');

  // Full-View Fine-Art Immersion Mode (Hides UI overlay to view full canvas art)
  const [hideUi, setHideUi] = useState(false);

  // Interactive State
  const [journalNote, setJournalNote] = useState('');
  const [burnedCount, setBurnedCount] = useState(3);
  const [burningAnimation, setBurningAnimation] = useState(false);
  const [roster, setRoster] = useState<StudentRoster[]>(INITIAL_ROSTER);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const celestial = CELESTIAL_CONFIGS[activeMode][activePhase];
  const worldMeta = WORLDS[activeWorld];

  // Living Particle & Firefly Canvas Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = Math.round(window.innerHeight * 0.52));

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = Math.round(window.innerHeight * 0.52);
    };
    window.addEventListener('resize', onResize);

    const isNight = activePhase === 'night' || activePhase === 'predawn';
    const isDark = activeMode === 'dark';

    // Spawn 28 living particles (fireflies at night, solar motes/dew at dawn)
    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Night Stars / Starfield
      if (isNight || (isDark && activePhase === 'dusk')) {
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.45)';
        for (let i = 0; i < 45; i++) {
          const sx = (Math.sin(i * 99) * 0.5 + 0.5) * width;
          const sy = (Math.cos(i * 33) * 0.5 + 0.5) * (height * 0.7);
          const twinkle = (Math.sin(Date.now() * 0.002 + i) + 1) * 0.4 + 0.2;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.1, 0, Math.PI * 2);
          ctx.globalAlpha = twinkle;
          ctx.fill();
        }
      }

      // Floating living fireflies or atmospheric pollen
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.03;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = Math.abs(Math.sin(p.pulse)) * p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        // Firefly gold vs daytime light shimmer
        if (isNight) {
          ctx.fillStyle = '#FDE047';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#FBBF24';
        } else {
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#FDE047';
        }
        ctx.globalAlpha = currentAlpha;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [activePhase, activeMode]);

  const toggleStudent = (id: string) => {
    setRoster((prev) =>
      prev.map((s) => (s.id === id ? { ...s, present: !s.present } : s)),
    );
  };

  const burnThought = () => {
    if (!journalNote.trim()) return;
    setBurningAnimation(true);
    setTimeout(() => {
      setBurnedCount((c) => c + 1);
      setJournalNote('');
      setBurningAnimation(false);
    }, 900);
  };

  const presentCount = roster.filter((s) => s.present).length;

  return (
    <WorldScope world={activeWorld} mode={activeMode} phase={activePhase}>
      <div
        className={styles.livingCanvas}
        style={
          {
            '--sky-top': celestial.top,
            '--sky-horizon': celestial.horizon,
            '--orb-x': celestial.orbX,
            '--orb-y': celestial.orbY,
            '--orb-size': celestial.orbSize,
            '--orb-bg': celestial.orbBg,
            '--orb-glow': celestial.orbGlow,
            '--orb-corona': celestial.orbCorona,
          } as React.CSSProperties
        }
      >
        {/* Cultural Ornament SVG Band */}
        <div className={styles.ornamentBanner}>
          <CulturalOrnamentSvg world={activeWorld} />
        </div>

        {/* Milestone 1: Multi-Layered Living Landscape & Horizon Parallax Scene */}
        <LivingLandscapeScene
          world={activeWorld}
          mode={activeMode}
          phase={activePhase}
          hour={currentHour}
        />

        {/* Top-Level Living HUD */}
        <header className={styles.livingHud}>
          <div className={styles.hudInner}>
            <div className={styles.hudPrimaryRow}>
              {/* Brand & Realm Info */}
              <div className={styles.brandRealm}>
                <div className={styles.realmIconBadge}>
                  <div className={styles.lampGlowHalo} />
                  <span>🪷</span>
                </div>
                <div className={styles.realmTitles}>
                  <h1>Gurudevi Sanctuary · Living Domain</h1>
                  <span className={styles.realmMeta}>
                    <strong>{worldMeta.names.en}</strong>
                    <span>•</span>
                    <span>{worldMeta.names.si}</span>
                    <span>•</span>
                    <span style={{ color: 'var(--w-lamp)' }}>Explore Guest Realm</span>
                  </span>
                </div>
              </div>

              {/* Layer 1: Cultural Worlds */}
              <div className={styles.worldPills} role="radiogroup" aria-label="Select Cultural World">
                {WORLD_IDS.map((wId) => {
                  const w = WORLDS[wId];
                  const isActive = activeWorld === wId;
                  return (
                    <button
                      key={wId}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      className={`${styles.worldPill} ${isActive ? styles.worldPillActive : ''}`}
                      onClick={() => setActiveWorld(wId)}
                    >
                      <span>{w.names.en}</span>
                      <small style={{ opacity: 0.75 }}>{w.names.si}</small>
                    </button>
                  );
                })}
              </div>

              {/* Layer 2: Theme Light / Dark & Full Canvas Immersion */}
              <div className={styles.modeControls}>
                <button
                  type="button"
                  className={styles.modeToggleBtn}
                  onClick={() => setActiveMode((m) => (m === 'light' ? 'dark' : 'light'))}
                  aria-label="Toggle theme mode"
                >
                  {activeMode === 'light' ? (
                    <>
                      <Sun size={15} color="var(--w-lamp)" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <Moon size={15} color="var(--w-lamp)" />
                      <span>Dark</span>
                    </>
                  )}
                </button>

                {/* Hide / Show UI Overlay Button to View Full-Screen Fine Art */}
                <button
                  type="button"
                  className={styles.modeToggleBtn}
                  onClick={() => setHideUi((h) => !h)}
                  style={{
                    background: hideUi ? 'var(--w-lamp)' : undefined,
                    color: hideUi ? 'var(--w-on-lamp)' : undefined,
                  }}
                  title={hideUi ? 'Show Inhabited Domain Workspace' : 'Hide UI & Behold Pure Fine-Art Painting'}
                >
                  {hideUi ? (
                    <>
                      <Eye size={15} />
                      <span>Show Workspace</span>
                    </>
                  ) : (
                    <>
                      <EyeOff size={15} />
                      <span>Behold Canvas Art</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Layer 3: Interactive Circadian Hour Scrubber */}
            <div className={styles.circadianScrubber}>
              <div className={styles.phaseLabel}>
                <Compass size={15} />
                <span>{PHASE_TITLES[activePhase].label}</span>
              </div>

              <div className={styles.sliderTrack}>
                <input
                  type="range"
                  min="0"
                  max="23"
                  step="1"
                  value={currentHour}
                  onChange={(e) => setCurrentHour(Number(e.target.value))}
                  className={styles.timeSlider}
                  aria-label="Circadian Hour Slider"
                />
              </div>

              <span className={styles.timeClock}>
                {String(currentHour).padStart(2, '0')}:00 HRS
              </span>
            </div>
          </div>
        </header>

        {/* Real Domain Sanctuary Stage (Conditionally hidden when admiring pure canvas art) */}
        {!hideUi && (
          <main className={styles.sanctuaryStage}>
            {/* Domain Navigation Strip */}
            <nav className={styles.domainNavStrip} aria-label="Sanctuary Domains">
            <button
              type="button"
              className={`${styles.domainTab} ${activeDomain === 'self' ? styles.domainTabActive : ''}`}
              onClick={() => setActiveDomain('self')}
            >
              <Heart size={18} />
              <span>Self Domain</span>
              <span className={styles.domainBadge}>Daily Practice</span>
            </button>

            <button
              type="button"
              className={`${styles.domainTab} ${activeDomain === 'workspace' ? styles.domainTabActive : ''}`}
              onClick={() => setActiveDomain('workspace')}
            >
              <Calendar size={18} />
              <span>Workspace Domain</span>
              <span className={styles.domainBadge}>{presentCount}/8 Present</span>
            </button>

            <button
              type="button"
              className={`${styles.domainTab} ${activeDomain === 'community' ? styles.domainTabActive : ''}`}
              onClick={() => setActiveDomain('community')}
            >
              <Users size={18} />
              <span>Community</span>
              <span className={styles.domainBadge}>Ecology</span>
            </button>

            <button
              type="button"
              className={`${styles.domainTab} ${activeDomain === 'library' ? styles.domainTabActive : ''}`}
              onClick={() => setActiveDomain('library')}
            >
              <BookOpen size={18} />
              <span>Library</span>
              <span className={styles.domainBadge}>Curated</span>
            </button>
          </nav>

          {/* Domain Content Inhabited Space */}
          {activeDomain === 'self' && (
            <div className={styles.domainLayout}>
              <div className={styles.mainStagePane}>
                {/* Fire Journal Living Card */}
                <div className={styles.livingCard}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h2 className={styles.cardTitle}>
                        <Flame size={20} color="var(--w-lamp)" />
                        <span>Living Fire Journal</span>
                      </h2>
                      <p className={styles.cardVoice}>
                        Write down worries, burdens, or heavy thoughts and let the ritual flame release them.
                      </p>
                    </div>
                    <span className={styles.domainBadge}>{burnedCount} Burdens Released</span>
                  </div>

                  <div className={styles.flameRitualPit}>
                    <TextField
                      label="Unspoken Burden or Heavy Thought"
                      placeholder="Write freely... this note will be converted to ash upon release."
                      multiline
                      value={journalNote}
                      onChange={(e) => setJournalNote((e.target as HTMLTextAreaElement).value)}
                      hint="Encrypted locally in offline storage."
                    />

                    {/* Terracotta Coconut Oil Lamp Hearth */}
                    <div className={styles.flameHearthContainer}>
                      <div className={styles.terracottaLampBase} />
                      <div
                        className={styles.flameCore}
                        style={{
                          transform: burningAnimation
                            ? 'scale(2.6) rotate(-45deg)'
                            : undefined,
                          transition: 'transform 0.4s ease',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                      <Button
                        variant="primary"
                        label={burningAnimation ? 'Burning into ash...' : 'Release to Fire →'}
                        onClick={burnThought}
                        disabled={!journalNote.trim() || burningAnimation}
                      />
                    </div>
                  </div>
                </div>

                {/* Self Reflection Timeline & Rows */}
                <Section
                  title="Daily Rhythm & Micro-Checkins"
                  voice="The day moves the light, never your inner peace."
                  density="calm"
                >
                  <Row
                    label="Morning Intention"
                    detail="Teach with patience and attentive stillness."
                    signal
                    signalLabel="Completed at Dawn"
                  />
                  <Row
                    label="Afternoon Breathing Ritual"
                    detail="5 minutes of mindful box breathing."
                    accessory={<Button variant="secondary" size="sm" label="Begin" />}
                  />
                  <Row
                    label="Evening Gratitude Journal"
                    detail="Scheduled for Dusk"
                    chevron
                  />
                </Section>
              </div>

              {/* Ambient Side Panel */}
              <aside className={styles.ambientSidePanel}>
                {/* Lotus Pond Mindful Breath Pacer */}
                <div className={styles.livingCard}>
                  <h3 className={styles.cardTitle} style={{ fontSize: '1.05rem' }}>
                    <Wind size={18} color="var(--w-lamp)" />
                    <span>Diurnal Lotus Pond Pacer</span>
                  </h3>
                  <p className={styles.cardVoice}>Inhale the ground, exhale the noise.</p>
                  
                  <div className={styles.lotusPondScene}>
                    <div className={styles.breathingWaterRipples} />
                    <div className={styles.lotusFlowerArtwork}>🪷</div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <Text kind="caption" tone="soft">
                      Synchronized to {PHASE_TITLES[activePhase].label}
                    </Text>
                  </div>
                </div>

                {/* Sanctuary Room Mood Notes */}
                <Surface tone="inset">
                  <Section title="Sanctuary Ecology" density="dense">
                    <Row label="Current Phase" detail={PHASE_TITLES[activePhase].label} />
                    <Row label="Atmosphere" detail={celestial.atmosphereDescription} />
                    <Row label="Sun/Moon Altitude" detail={`${Math.round((currentHour / 24) * 100)}%`} />
                    <Row label="Offline Sync" detail="Healthy (WAL active)" />
                  </Section>
                </Surface>
              </aside>
            </div>
          )}

          {activeDomain === 'workspace' && (
            <div className={styles.domainLayout}>
              <div className={styles.mainStagePane}>
                {/* Real Classroom Attendance Register */}
                <div className={styles.livingCard}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h2 className={styles.cardTitle}>
                        <CheckCircle2 size={20} color="var(--w-success)" />
                        <span>Classroom Roll Call & Register</span>
                      </h2>
                      <p className={styles.cardVoice}>
                        Grade 10B · Sinhala Language & Literature · Morning Period
                      </p>
                    </div>
                    <span className={styles.domainBadge}>
                      {presentCount} of {roster.length} Present
                    </span>
                  </div>

                  <p className={styles.cardVoice}>
                    Click on student beads to toggle present/absent state:
                  </p>

                  <div className={styles.studentRosterBeads}>
                    {roster.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => toggleStudent(student.id)}
                        className={`${styles.studentBead} ${student.present ? styles.studentBeadPresent : ''}`}
                      >
                        <span>
                          #{student.roll} {student.name}
                        </span>
                        {student.present && <span className={styles.presentDot} />}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                    <Button variant="secondary" size="sm" label="Reset All" onClick={() => setRoster(INITIAL_ROSTER)} />
                    <Button
                      variant="primary"
                      size="sm"
                      label={`Commit Register (${presentCount}/${roster.length})`}
                      onClick={() => alert(`Saved roll call for ${presentCount} students!`)}
                    />
                  </div>
                </div>

                {/* Timetable Schedule Section */}
                <Section
                  title="Today's Timetable Horizon"
                  voice="Follows school calendar without cloud latency."
                  density="dense"
                >
                  <Row label="08:00 - 08:45" detail="Morning Assembly & Silent Reading" signal />
                  <Row label="08:45 - 09:30" detail="Sinhala Literature (Grade 10B)" chevron />
                  <Row label="09:30 - 10:15" detail="History & Sri Lankan Civilization" chevron />
                  <Row label="10:15 - 10:45" detail="Interval (Tea & Stillness)" />
                  <Row label="10:45 - 11:30" detail="Mathematics & Geometry" chevron />
                </Section>
              </div>

              {/* Workspace Side Panel */}
              <aside className={styles.ambientSidePanel}>
                <div className={styles.livingCard}>
                  <h3 className={styles.cardTitle} style={{ fontSize: '1.05rem' }}>
                    <Clock size={18} color="var(--w-lamp)" />
                    <span>Next Class Bell</span>
                  </h3>
                  <p className={styles.cardVoice}>15 minutes remaining in period</p>
                  <div style={{ marginTop: '1rem' }}>
                    <Button variant="quiet" fullWidth label="Ring Classroom Bell 🔔" onClick={() => {}} />
                  </div>
                </div>

                <Surface tone="inset">
                  <Section title="Teaching Group" density="dense">
                    <Row label="Primary Grade" detail="10B" />
                    <Row label="Language Medium" detail="Sinhala" />
                    <Row label="Weekly Load" detail="24 Periods" />
                  </Section>
                </Surface>
              </aside>
            </div>
          )}

          {activeDomain === 'community' && (
            <div className={styles.domainLayout}>
              <div className={styles.mainStagePane}>
                <div className={styles.livingCard}>
                  <h2 className={styles.cardTitle}>
                    <Users size={20} color="var(--w-lamp)" />
                    <span>School Forest & Community Hearth</span>
                  </h2>
                  <p className={styles.cardVoice}>
                    Local school ecology discussions, lesson plans, and mutual aid across Sri Lankan educators.
                  </p>
                  <div style={{ marginTop: '1.5rem' }}>
                    <Section title="Community Stories" density="dense">
                      <Row
                        label="Sabaragamuwa Province Teaching Circle"
                        detail="32 teachers active"
                        chevron
                      />
                      <Row
                        label="Primary Grade Storytelling Archive"
                        detail="14 resources shared today"
                        signal
                      />
                      <Row
                        label="Water & Garden Project at Kandy Model School"
                        detail="New update posted"
                        chevron
                      />
                    </Section>
                  </div>
                </div>
              </div>
              <aside className={styles.ambientSidePanel}>
                <Surface tone="inset">
                  <Section title="Village Noticeboard" density="dense">
                    <Row label="Guest House Access" detail="Explore Mode Enabled" />
                    <Row label="Regional Hub" detail="Central Province" />
                  </Section>
                </Surface>
              </aside>
            </div>
          )}

          {activeDomain === 'library' && (
            <div className={styles.domainLayout}>
              <div className={styles.mainStagePane}>
                <div className={styles.livingCard}>
                  <h2 className={styles.cardTitle}>
                    <BookOpen size={20} color="var(--w-lamp)" />
                    <span>Curated Ola Leaf & Book Archive</span>
                  </h2>
                  <p className={styles.cardVoice}>
                    Classical and modern educational texts preserved in open-source formats.
                  </p>
                  <div style={{ marginTop: '1.5rem' }}>
                    <Section title="Curator Collections" density="dense">
                      <Row
                        label="Ancient Irrigation & Tank Architecture (Wewa)"
                        detail="12 manuscripts"
                        signal
                      />
                      <Row
                        label="Sinhala Classical Poetry & Vyakaranaya"
                        detail="8 guides"
                        chevron
                      />
                      <Row
                        label="Botanical Taxonomy of Ceylon Plants"
                        detail="24 scanned folios"
                        chevron
                      />
                    </Section>
                  </div>
                </div>
              </div>
              <aside className={styles.ambientSidePanel}>
                <Surface tone="inset">
                  <Section title="Reading Mode" density="dense">
                    <Row label="Font Type" detail="Newsreader Serif" />
                    <Row label="Storage" detail="100% Offline SQLite" />
                  </Section>
                </Surface>
              </aside>
            </div>
          )}
        </main>
      )}
      </div>
    </WorldScope>
  );
}
