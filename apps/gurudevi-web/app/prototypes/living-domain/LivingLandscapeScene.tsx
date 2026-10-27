'use client';

import type { WorldId, WorldMode, WorldPhase } from '@repo/ui/world/types';
import { useEffect, useRef } from 'react';
import styles from './living-landscape.module.css';

import { ProceduralWewaCanvas } from './ProceduralWewaCanvas';
import { ProceduralKandyanArt } from './ProceduralKandyanArt';

interface LandscapeSceneProps {
  world: WorldId;
  mode: WorldMode;
  phase: WorldPhase;
  hour: number;
}

export function LivingLandscapeScene({ world, mode, phase, hour }: LandscapeSceneProps) {
  const renderKandyanFlora = world === 'kandyan';
  // Flagship Realm 1: Wewa (Procedural Lake Cross-Section, FBM Mountains, Underwater Ecosystem)
  if (world === 'wewa') {
    return (
      <div
        className={styles.landscapeStage}
        data-world={world}
        data-mode={mode}
        data-phase={phase}
        aria-hidden="true"
      >
        <ProceduralWewaCanvas mode={mode} phase={phase} hour={hour} />
        <div className={styles.seamlessGroundMist} />
      </div>
    );
  }

  // Flagship Realm 2: Kandyan (Temple Fresco Fine Art with Handmade Paper Tooth & Timber Pekada)
  if (world === 'kandyan') {
    return (
      <div
        className={styles.landscapeStage}
        data-world={world}
        data-mode={mode}
        data-phase={phase}
        aria-hidden="true"
      >
        <ProceduralKandyanArt mode={mode} phase={phase} hour={hour} />
        <div className={styles.seamlessGroundMist} />
      </div>
    );
  }

  // Fallback scenic stage for other worlds
  const isDay = hour >= 6 && hour < 18;
  const transitProgress = isDay ? (hour - 6) / 12 : hour >= 18 ? (hour - 18) / 12 : (hour + 6) / 12;
  const orbXPercent = 16 + transitProgress * 68;
  const orbYPercent = 58 - Math.sin(transitProgress * Math.PI) * 42;

  return (
    <div
      className={styles.landscapeStage}
      data-world={world}
      data-mode={mode}
      data-phase={phase}
      aria-hidden="true"
    >
      {/* 1. Atmospheric Sky Canvas */}
      <div className={styles.skyAtmosphere} />

      {/* 2. Celestial Body */}
      <div
        className={styles.celestialOrb}
        style={{
          left: `${orbXPercent}%`,
          top: `${orbYPercent}%`,
        }}
        data-celestial={isDay ? 'sun' : 'moon'}
      >
        {!isDay && (
          <div className={styles.lunarCraters}>
            <div className={styles.craterA} />
            <div className={styles.craterB} />
            <div className={styles.craterC} />
          </div>
        )}
      </div>

      {/* 3. Mountain Horizons */}
      <svg
        className={styles.distantMountainsSvg}
        viewBox="0 0 1440 340"
        preserveAspectRatio="none"
      >
        <path
          d="M0,230 L100,180 L220,240 L340,150 L480,210 L600,120 L740,195 L880,140 L1020,215 L1180,160 L1320,200 L1440,170 L1440,340 L0,340 Z"
          className={styles.farMountainPath}
        />
        <path
          d="M0,270 L140,220 L300,280 L440,200 L580,250 L720,175 L900,240 L1060,190 L1220,250 L1380,210 L1440,225 L1440,340 L0,340 Z"
          className={styles.nearMountainPath}
        />
      </svg>

      {/* 4. Heritage Artworks */}
      <div className={styles.biomeFloraLayer}>
        {renderKandyanFlora && (
          <svg className={styles.biomeSvg} viewBox="0 0 1440 280" preserveAspectRatio="none">
            <path
              d="M0,195 L180,168 L195,195 L375,168 L390,195 L570,168 L585,195 L765,168 L780,195 L960,168 L975,195 L1155,168 L1170,195 L1350,168 L1365,195 L1440,180 L1440,280 L0,280 Z"
              className={styles.templeRoofSilhouettes}
            />
            <rect x="185" y="195" width="22" height="85" className={styles.handDrawnTrunk} />
            <rect x="565" y="195" width="22" height="85" className={styles.handDrawnTrunk} />
            <rect x="955" y="195" width="22" height="85" className={styles.handDrawnTrunk} />
            <path
              d="M0,250 Q20,230 40,250 T80,250 T120,250 T160,250 T200,250 T240,250 T280,250 T320,250 T360,250 T400,250 T440,250 T480,250 T520,250 T560,250 T600,250 T640,250 T680,250 T720,250 T760,250 T800,250 T840,250 T880,250 T920,250 T960,250 T1000,250 T1040,250 T1080,250 T1120,250 T1160,250 T1200,250 T1240,250 T1280,250 T1320,250 T1360,250 T1400,250 T1440,250 L1440,280 L0,280 Z"
              className={styles.walakuluBamma}
            />
          </svg>
        )}

        {world === 'kele' && (
          <svg className={styles.biomeSvg} viewBox="0 0 1440 280" preserveAspectRatio="none">
            <path
              d="M90,280 Q130,160 120,40 Q150,20 160,0 Q170,40 150,160 Q170,220 190,280 Z"
              className={styles.handDrawnTrunk}
            />
            <path
              d="M1280,280 Q1250,170 1270,30 Q1300,10 1310,0 Q1320,40 1290,170 Q1320,220 1350,280 Z"
              className={styles.handDrawnTrunk}
            />
            <circle cx="140" cy="30" r="115" className={styles.handDrawnFoliage} />
            <circle cx="280" cy="50" r="85" className={styles.handDrawnFoliage} />
            <circle cx="1260" cy="25" r="130" className={styles.handDrawnFoliage} />
            <circle cx="1140" cy="55" r="90" className={styles.handDrawnFoliage} />
          </svg>
        )}

        {world === 'sanctuary' && (
          <svg className={styles.biomeSvg} viewBox="0 0 1440 280" preserveAspectRatio="none">
            <rect x="120" y="140" width="18" height="140" className={styles.handDrawnTrunk} />
            <rect x="420" y="140" width="18" height="140" className={styles.handDrawnTrunk} />
            <rect x="1020" y="140" width="18" height="140" className={styles.handDrawnTrunk} />
            <rect x="1320" y="140" width="18" height="140" className={styles.handDrawnTrunk} />
            <path
              d="M0,140 L1440,140 M0,150 L1440,150"
              stroke="currentColor"
              strokeWidth="4"
              className={styles.handDrawnTrunk}
            />
          </svg>
        )}
      </div>

      {/* 5. Soft Ground Mist */}
      <div className={styles.seamlessGroundMist} />
    </div>
  );
}
