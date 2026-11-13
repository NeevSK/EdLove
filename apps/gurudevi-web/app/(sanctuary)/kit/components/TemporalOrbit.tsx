import React, { useState, useId } from 'react';
import { ScrollArea } from '@repo/ui/components/web';
import styles from './temporal-orbit.module.css';

export interface SpotHabitat {
  id: string;
  name: string;
  phase: 'predawn' | 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night';
  time: string;
  focus: string;
  energy: string;
  cx: number;
  cy: number;
}

export interface TemporalOrbitProps {
  currentDate?: Date;
  onSelectSpot?: (spot: SpotHabitat) => void;
  className?: string;
}

const DEFAULT_HABITATS: SpotHabitat[] = [
  {
    id: 'brahma-muhurta',
    name: 'Brahma Muhūrta / Still Ground',
    phase: 'predawn',
    time: '04:30 AM',
    focus: 'Solitary contemplation & deep reading',
    energy: 'Silent Ether',
    cx: 80,
    cy: 130,
  },
  {
    id: 'dawn-gathering',
    name: 'Dawn Sanctuary / First Light',
    phase: 'dawn',
    time: '06:15 AM',
    focus: 'Community assembly & intention setting',
    energy: 'Ascending Fire',
    cx: 200,
    cy: 70,
  },
  {
    id: 'morning-seminar',
    name: 'Morning Dialectic / High Sun',
    phase: 'morning',
    time: '10:00 AM',
    focus: 'Architectural deliberation & code crafting',
    energy: 'Peak Radiant Mind',
    cx: 400,
    cy: 35,
  },
  {
    id: 'afternoon-workshop',
    name: 'Afternoon Guild / The Workbench',
    phase: 'afternoon',
    time: '02:45 PM',
    focus: 'Physical implementation & collective peer review',
    energy: 'Sustained Flow',
    cx: 600,
    cy: 70,
  },
  {
    id: 'dusk-sandhya',
    name: 'Dusk Sandhyā / Twilight Ledger',
    phase: 'dusk',
    time: '06:30 PM',
    focus: 'Reflection, synthesis & daily release',
    energy: 'Golden Dissolution',
    cx: 720,
    cy: 130,
  },
];

export function TemporalOrbit({
  currentDate = new Date(),
  onSelectSpot,
  className = '',
}: TemporalOrbitProps) {
  const [selectedSpotId, setSelectedSpotId] = useState<string>('morning-seminar');
  const gradientId = useId();

  const activeHabitat: SpotHabitat =
    DEFAULT_HABITATS.find((h) => h.id === selectedSpotId) ?? DEFAULT_HABITATS[0]!;

  const handleSpotClick = (spot: SpotHabitat) => {
    setSelectedSpotId(spot.id);
    onSelectSpot?.(spot);
  };

  // Generate 7 days around the current anchor
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentDate);
    d.setDate(currentDate.getDate() - 3 + i);
    const isToday = i === 3;
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    return { date: d, isToday, weekday, dayNum, index: i };
  });

  return (
    <div className={`${styles.orbitContainer} ${className}`}>
      {/* Header / Spatial Context */}
      <div className={styles.orbitTopRow}>
        <div className={styles.phaseTitleGroup}>
          <h4 className={styles.phaseMainHeading}>
            <span>✦</span>
            <span>Circadian Horizon · Spot Perception</span>
          </h4>
          <span className={styles.phaseSubtitle}>
            Human time is a constellation of inhabited places, not a cold 1D coordinate.
          </span>
        </div>
        <div className={styles.circadianBadge}>
          <span>☀️ Active Phase: {activeHabitat.phase.toUpperCase()}</span>
        </div>
      </div>

      {/* The Celestial Arc Stage */}
      <div className={styles.arcStage} role="region" aria-label="Celestial Arc Orbit">
        <svg
          viewBox="0 0 800 160"
          className={styles.arcSvg}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--w-ink-soft, rgba(255, 255, 255, 0.2))" />
              <stop offset="50%" stopColor="var(--w-lamp, #e2c37a)" />
              <stop offset="100%" stopColor="var(--w-ink-soft, rgba(255, 255, 255, 0.2))" />
            </linearGradient>
          </defs>

          {/* Horizon Base Line */}
          <line x1="40" y1="145" x2="760" y2="145" className={styles.horizonLine} />

          {/* Diurnal Parabolic Arc (The Solar Arch) */}
          <path
            d="M 50 145 Q 400 -10 750 145"
            className={styles.arcTrajectory}
            stroke={`url(#${gradientId})`}
          />

          {/* Celestial Habitat Spot Nodes */}
          {DEFAULT_HABITATS.map((habitat) => {
            const isActive = habitat.id === selectedSpotId;
            return (
              <g
                key={habitat.id}
                className={styles.spotNode}
                data-active={isActive ? 'true' : 'false'}
                transform={`translate(${habitat.cx}, ${habitat.cy})`}
                onClick={() => handleSpotClick(habitat)}
                tabIndex={0}
                role="button"
                aria-pressed={isActive}
                aria-label={`${habitat.name} at ${habitat.time}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSpotClick(habitat);
                  }
                }}
              >
                {/* Outer halo */}
                <circle r={isActive ? 18 : 12} className={styles.spotOuterRing} />
                {/* Core jewel */}
                <circle
                  r={isActive ? 8 : 5}
                  className={styles.spotCore}
                  fill={isActive ? 'var(--w-lamp, #e2c37a)' : 'currentColor'}
                />
                {/* Micro Label under spot */}
                <text
                  y={isActive ? 32 : 24}
                  className={styles.spotLabelText}
                >
                  {habitat.time}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* The Active Inhabited Spot Locus (Card) */}
      <div className={styles.habitatCard}>
        <div className={styles.habitatDetails}>
          <span className={styles.habitatPhaseBadge}>
            Spot Locus · {activeHabitat.time} · {activeHabitat.energy}
          </span>
          <h3 className={styles.habitatName}>{activeHabitat.name}</h3>
          <span className={styles.habitatMeta}>{activeHabitat.focus}</span>
        </div>
        <button
          type="button"
          className={styles.enterSpotBtn}
          onClick={() => onSelectSpot?.(activeHabitat)}
        >
          Enter Habitat →
        </button>
      </div>

      {/* Seven Day Swarm (Anchors to Date) */}
      <ScrollArea orientation="horizontal" showEdgeGradients={false} label="Days in week">
        <div className={styles.daysSwarm} role="tablist" aria-label="Days in week">
        {days.map((day) => (
          <button
            key={day.index}
            type="button"
            className={styles.dayLocusBtn}
            data-active={day.isToday ? 'true' : 'false'}
            role="tab"
            aria-selected={day.isToday}
          >
            <span className={styles.dayLocusDay}>{day.weekday}</span>
            <span className={styles.dayLocusNum}>{day.dayNum}</span>
            {day.isToday && <span className={styles.dayLocusDot} />}
          </button>
        ))}
        </div>
      </ScrollArea>
    </div>
  );
}
