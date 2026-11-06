'use client';

import React, { useState } from 'react';
import type { ScrollAreaVariant } from '@repo/ui/theme/contracts';
import { ScrollArea } from '@repo/ui/components/web';

const DEMO_PIPS = [
  { id: 'pip-dawn', label: 'Brahma MuhÅ«rta Â· Dawn', offsetPct: 15 },
  { id: 'pip-noon', label: 'Midday Seminar Â· Noon', offsetPct: 50 },
  { id: 'pip-dusk', label: 'Dusk SandhyÄ Â· Twilight', offsetPct: 85 },
];

const ARCHETYPES: Array<{
  id: ScrollAreaVariant;
  label: string;
  category: 'Living Instrument' | 'OS Baseline';
  badge: string;
  description: string;
}> = [
  {
    id: 'auto',
    label: '✦ Auto World',
    category: 'Living Instrument',
    badge: 'Adaptive Inhabitant',
    description: 'Automatically inherits and morphs to the living talisman of the active world (wewa ➔ fluid dewdrop, kele ➔ sacred bo leaf, ratna ➔ sapphire, perahera ➔ flame ember, spark ➔ astral sundial, sanctuary ➔ sovereign lamp light).',
  },
  {
    id: 'sovereign',
    label: '✦ Sovereign',
    category: 'Living Instrument',
    badge: 'World-Tuned Light',
    description: 'Living lamp glow with soft aura that automatically breathes with the active world theme.',
  },
  {
    id: 'mechanical',
    label: '⚙ Mechanical',
    category: 'Living Instrument',
    badge: '3D Tactile Vernier',
    description: '10px inset trench with metallic bevels and 3 knurled center vernier louvers.',
  },
  {
    id: 'fluid',
    label: '💧 Wewa Fluid',
    category: 'Living Instrument',
    badge: 'Lotus Ripple Capillary',
    description: 'Capillary tube rail with refractive water droplet that expands ripple rings and stretches with momentum.',
  },
  {
    id: 'circadian',
    label: '☀️ Astral Sundial',
    category: 'Living Instrument',
    badge: 'Diurnal Solar Azimuth',
    description: 'Astrolabe rail with azimuth degree markings casting live directional shadows matching diurnal solar phase.',
  },
  {
    id: 'ratna',
    label: '💎 Ratna Sapphire',
    category: 'Living Instrument',
    badge: 'Faceted Gemstone Glint',
    description: 'City of Gems octagonal polygon sapphire cut with dashed facet rail and twinkling celestial star glint (✦).',
  },
  {
    id: 'perahera',
    label: '🔥 Perahera Ember',
    category: 'Living Instrument',
    badge: 'Nocturnal Flame Ash',
    description: 'Charcoal ash flume track with breathing volcanic ember cinder and live incandescence flickering.',
  },
  {
    id: 'leaf',
    label: '🍃 Sacred Bo Leaf',
    category: 'Living Instrument',
    badge: 'Botanical Talisman',
    description: 'Sculpted sacred Bo leaf talisman with characteristic slender apex tail and delicate lateral veins.',
  },
  {
    id: 'perimeter',
    label: '🔲 Perimeter Ribbon',
    category: 'Living Instrument',
    badge: 'Continuous Border',
    description: 'Eliminates separate tracks; travels seamlessly along the container’s outer boundary stroke.',
  },
  {
    id: 'macos',
    label: ' macOS',
    category: 'OS Baseline',
    badge: 'Floating Inset Pill',
    description: 'Apple floating translucent rounded pill with auto-fade on interaction settle.',
  },
  {
    id: 'fluent',
    label: '⊞ Win 11 Fluent',
    category: 'OS Baseline',
    badge: 'Expanding Rail',
    description: 'Minimalist 4px line that expands to a 10px tactile rail on pointer hover.',
  },
  {
    id: 'classic',
    label: '🗔 Win Classic',
    category: 'OS Baseline',
    badge: 'Hardware Steppers',
    description: '16px retro beveled track with tactile ▲ and ▼ hardware stepper buttons.',
  },
  {
    id: 'native',
    label: '🌐 Native OS',
    category: 'OS Baseline',
    badge: 'Browser Engine',
    description: 'Standard unstyled browser default for architectural comparison and regression auditing.',
  },
];

export function ScrollInstrumentsShowcase() {
  const [activeVariant, setActiveVariant] = useState<ScrollAreaVariant>('auto');
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [visibility, setVisibility] = useState<'always' | 'hover'>('always');
  const [tone, setTone] = useState<'lamp' | 'quiet' | 'signal'>('lamp');
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [statusLog, setStatusLog] = useState<string>('Ready Â· Scroll with wheel or drag canvas/thumb');

  const activeMeta = ARCHETYPES.find((a) => a.id === activeVariant) ?? ARCHETYPES[0]!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Interactive Staged Sandbox Console */}
      <div
        style={{
          padding: '1.5rem',
          borderRadius: '1rem',
          background: 'color-mix(in srgb, var(--paper, #11121d) 92%, transparent)',
          border: '1px solid var(--line, rgba(255, 255, 255, 0.08))',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                background: 'color-mix(in srgb, var(--w-lamp, #e2c37a) 15%, transparent)',
                color: 'var(--w-lamp, #e2c37a)',
                border: '1px solid color-mix(in srgb, var(--w-lamp, #e2c37a) 30%, transparent)',
                marginBottom: '0.35rem',
              }}
            >
              {activeMeta.category} Â· {activeMeta.badge}
            </span>
            <h3 style={{ margin: 0, font: '700 1.25rem Georgia, serif', color: 'var(--ink, #fff)' }}>
              Interactive Sandbox Â· {activeMeta.label}
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--ink-soft, rgba(255, 255, 255, 0.65))' }}>
              {activeMeta.description}
            </p>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--w-lamp, #e2c37a)', fontStyle: 'italic' }}>
            {statusLog}
          </span>
        </div>

        {/* Archetype Selector Strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-soft, rgba(255, 255, 255, 0.5))' }}>
            Archetype:
          </span>
          {ARCHETYPES.map((a) => {
            const isSelected = activeVariant === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setActiveVariant(a.id);
                  setStatusLog(`Switched archetype: ${a.label}`);
                }}
                style={{
                  padding: '0.32rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected
                    ? '1px solid var(--w-lamp, #e2c37a)'
                    : '1px solid var(--line, rgba(255, 255, 255, 0.12))',
                  background: isSelected
                    ? 'color-mix(in srgb, var(--w-lamp, #e2c37a) 20%, transparent)'
                    : 'transparent',
                  color: isSelected ? 'var(--w-lamp, #e2c37a)' : 'var(--ink-soft, rgba(255, 255, 255, 0.75))',
                  transition: 'all 0.15s ease',
                }}
              >
                {a.label}
              </button>
            );
          })}
        </div>

        {/* Controls Bar: Orientation, Tone, Visibility */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--line, rgba(255, 255, 255, 0.06))',
          }}
        >
          {/* Orientation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-soft, rgba(255, 255, 255, 0.5))' }}>Axis:</span>
            {(['horizontal', 'vertical'] as const).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOrientation(o)}
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: orientation === o ? '1px solid var(--w-lamp, #e2c37a)' : '1px solid var(--line, rgba(255, 255, 255, 0.1))',
                  background: orientation === o ? 'color-mix(in srgb, var(--w-lamp, #e2c37a) 15%, transparent)' : 'transparent',
                  color: orientation === o ? 'var(--w-lamp, #e2c37a)' : 'var(--ink-soft, rgba(255, 255, 255, 0.6))',
                }}
              >
                {o.charAt(0).toUpperCase() + o.slice(1)}
              </button>
            ))}
          </div>

          {/* Visibility */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-soft, rgba(255, 255, 255, 0.5))' }}>Track:</span>
            {(['always', 'hover'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVisibility(v)}
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: visibility === v ? '1px solid var(--w-lamp, #e2c37a)' : '1px solid var(--line, rgba(255, 255, 255, 0.1))',
                  background: visibility === v ? 'color-mix(in srgb, var(--w-lamp, #e2c37a) 15%, transparent)' : 'transparent',
                  color: visibility === v ? 'var(--w-lamp, #e2c37a)' : 'var(--ink-soft, rgba(255, 255, 255, 0.6))',
                }}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* Tone */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-soft, rgba(255, 255, 255, 0.5))' }}>Tone:</span>
            {(['lamp', 'quiet', 'signal'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: tone === t ? '1px solid var(--w-lamp, #e2c37a)' : '1px solid var(--line, rgba(255, 255, 255, 0.1))',
                  background: tone === t ? 'color-mix(in srgb, var(--w-lamp, #e2c37a) 15%, transparent)' : 'transparent',
                  color: tone === t ? 'var(--w-lamp, #e2c37a)' : 'var(--ink-soft, rgba(255, 255, 255, 0.6))',
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Live Interactive Viewport */}
        <div
          style={{
            height: orientation === 'horizontal' ? '110px' : '300px',
            border: '1px solid var(--line, rgba(255, 255, 255, 0.12))',
            padding: '12px',
            borderRadius: '0.85rem',
            background: 'color-mix(in srgb, var(--paper, #0d0f18) 70%, transparent)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <ScrollArea
            variant={activeVariant}
            orientation={orientation}
            tone={tone}
            scrollbarVisibility={visibility}
            showEdgeGradients={true}
            dragToScroll={true}
            kineticMomentum={true}
            pips={DEMO_PIPS}
            hudLabel={`Spot #${selectedCard !== null ? selectedCard + 1 : 1}`}
            label="Interactive Scroll Instrument Sandbox"
            style={{ height: '100%', width: '100%' }}
          >
            {Array.from({ length: 16 }).map((_, i) => {
              const isSelected = selectedCard === i;
              return (
                <div
                  key={i}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedCard(i);
                    setStatusLog(`Spot #${i + 1} clicked cleanly (drag was not triggered)`);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedCard(i);
                  }}
                  style={{
                    flex: 'none',
                    minWidth: orientation === 'horizontal' ? '200px' : 'auto',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: isSelected
                      ? 'color-mix(in srgb, var(--w-lamp, #e2c37a) 25%, transparent)'
                      : 'color-mix(in srgb, var(--paper-light, #171825) 85%, transparent)',
                    border: isSelected
                      ? '1px solid var(--w-lamp, #e2c37a)'
                      : '1px solid var(--line, rgba(255, 255, 255, 0.08))',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.15s ease',
                    marginBottom: orientation === 'vertical' ? '8px' : '0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--w-lamp, #e2c37a)' }}>
                      #{i + 1}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--ink-soft, rgba(255, 255, 255, 0.4))' }}>
                      Habitat Locus
                    </span>
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink, #fff)' }}>
                    Habitat Sanctuary Spot
                  </span>
                </div>
              );
            })}
          </ScrollArea>
        </div>
      </div>

      {/* 2. Side-by-Side Live Comparison Gallery of All 9 Archetypes */}
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ font: '700 1.25rem Georgia, serif', color: 'var(--ink, #fff)', margin: '0 0 0.35rem 0' }}>
            All 9 Scrollbar Archetypes (Side-by-Side Live Comparison)
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ink-soft, rgba(255, 255, 255, 0.65))' }}>
            Every pane is fully functional and interactive. Wheel or drag inside any pane to compare touch, tension, and track morphology.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '1rem',
            width: '100%',
          }}
        >
          {ARCHETYPES.map((spec) => {
            const isHighlighted = activeVariant === spec.id;
            return (
              <div
                key={spec.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: isHighlighted
                    ? '1px solid var(--w-lamp, #e2c37a)'
                    : '1px solid var(--line, rgba(255, 255, 255, 0.08))',
                  borderRadius: '0.75rem',
                  background: 'color-mix(in srgb, var(--paper, #11121d) 80%, transparent)',
                  overflow: 'hidden',
                  height: '240px',
                  boxShadow: isHighlighted ? '0 0 16px color-mix(in srgb, var(--w-lamp, #e2c37a) 15%, transparent)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Pane Header */}
                <div
                  style={{
                    padding: '8px 12px',
                    background: isHighlighted
                      ? 'color-mix(in srgb, var(--w-lamp, #e2c37a) 18%, transparent)'
                      : 'color-mix(in srgb, var(--paper-light, #171825) 90%, transparent)',
                    borderBottom: '1px solid var(--line, rgba(255, 255, 255, 0.08))',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isHighlighted ? 'var(--w-lamp, #e2c37a)' : 'var(--ink, #fff)' }}>
                      {spec.label}
                    </span>
                    <span style={{ fontSize: '0.62rem', fontWeight: 600, padding: '1px 5px', borderRadius: '4px', background: 'color-mix(in srgb, var(--line) 30%, transparent)', color: 'var(--ink-soft)' }}>
                      {spec.badge}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--ink-soft, rgba(255, 255, 255, 0.55))', lineHeight: 1.25 }}>
                    {spec.description}
                  </span>
                </div>

                {/* Pane Live Scroll Viewport */}
                <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                  <ScrollArea
                    variant={spec.id}
                    orientation="vertical"
                    tone={tone}
                    scrollbarVisibility="always"
                    label={`${spec.label} comparison pane`}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {Array.from({ length: 10 }).map((_, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '4px',
                            background: 'color-mix(in srgb, var(--paper-light, #171825) 80%, transparent)',
                            border: '1px solid var(--line, rgba(255, 255, 255, 0.06))',
                            fontSize: '0.72rem',
                            color: 'var(--ink-soft, rgba(255, 255, 255, 0.7))',
                          }}
                        >
                          Item #{idx + 1}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
