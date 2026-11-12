'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { KitTableOfContents } from './KitTableOfContents';
import { TemporalOrbit, type SpotHabitat } from './TemporalOrbit';
import { ScrollInstrumentsShowcase } from './ScrollInstrumentsShowcase';
import { Date as DatePicker } from '@repo/ui/components/web';
import { KIT_CATEGORIES } from '../kitNavigationData';
import styles from './kit-components-page.module.css';

export function KitComponentsDirectory() {
  const [selectedSpot, setSelectedSpot] = useState<SpotHabitat | null>(null);
  const [activeDateIso, setActiveDateIso] = useState<string>(
    new globalThis.Date().toISOString().slice(0, 10)
  );

  const totalComponents = KIT_CATEGORIES.reduce(
    (acc, cat) => acc + cat.components.length,
    0
  );

  return (
    <div className={styles.pageLayout}>
      {/* Sidebar TOC */}
      <aside className={styles.sidebarArea}>
        <KitTableOfContents />
      </aside>

      {/* Main Showcase Canvas */}
      <main className={styles.mainCanvas}>
        {/* Page Top Header */}
        <header className={styles.pageHeader}>
          <div className={styles.breadcrumbs}>
            <Link href="/kit" className={styles.breadLink}>Sanctuary Kit</Link>
            <span className={styles.breadDivider}>/</span>
            <span className={styles.breadCurrent}>Components Directory & Temporal TOC</span>
          </div>
          <h1 className={styles.pageTitle}>Sanctuary Component Library</h1>
          <p className={styles.pageSubtitle}>
            A living catalog of design system primitives, spatial perception models, and circadian workbench controls.
            Indexed into {KIT_CATEGORIES.length} distinct domains ({totalComponents} registered components).
          </p>
        </header>

        {/* Featured Section: Temporal Perception & The Spatial Spot Paradigm */}
        <section id="temporal-spatial-spot" className={styles.featureSection}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <span className={styles.sectionBadge}>Spatial Paradigm</span>
              <h2 className={styles.sectionTitle}>Temporal Orbit · Habitat Spots vs Flat Tapes</h2>
              <p className={styles.sectionDesc}>
                Addressing the fundamental user perception gap: 1D horizontal timebars feel &ldquo;flat and loner&rdquo;.
                Human beings perceive circadian flow as spatial habitats (spots/loci like Brahma Muhūrta, Morning Seminar, and Dusk Sandhyā)
                situated along the celestial parabolic arc.
              </p>
            </div>
            <Link href="/kit/components/temporal-horizon" className={styles.detailLinkBtn}>
              Full Screen Temporal Lab →
            </Link>
          </div>

          <div className={styles.orbitDemoWrapper}>
            <TemporalOrbit
              currentDate={new globalThis.Date(activeDateIso + 'T12:00:00')}
              onSelectSpot={(spot) => setSelectedSpot(spot)}
            />
            {selectedSpot && (
              <div className={styles.spotEchoNotice}>
                <span>✦ Inhabiting: <strong>{selectedSpot.name}</strong> ({selectedSpot.time}) &mdash; {selectedSpot.focus}</span>
              </div>
            )}
          </div>
        </section>

        {/* Section 1.5: Living Scroll Instruments */}
        <section id="scroll-area" className={styles.featureSection}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <span className={styles.sectionBadge}>Living Spatial Instruments</span>
              <h2 className={styles.sectionTitle}>ScrollArea · Living Multi-World Navigation Instruments</h2>
              <p className={styles.sectionDesc}>
                Transcending flat desktop scrollbars: 3D mechanical calibrated verniers, surface-tension fluid dewdrops,
                circadian diurnal sundial orbits, continuous perimeter border ribbons, and classic OS baselines.
              </p>
            </div>
          </div>
          <ScrollInstrumentsShowcase />
        </section>

        {/* Section 2: Adaptive 3-Tier Temporal Horizon Refinement */}
        <section id="temporal-horizon-refined" className={styles.featureSection}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <span className={styles.sectionBadge}>Horizon Refinement</span>
              <h2 className={styles.sectionTitle}>Temporal Horizon · 3 Adaptive Tiers</h2>
              <p className={styles.sectionDesc}>
                The floor-level temporal spine offering Compact Minimal (header capsule), Full Floor Bar (diurnal anchor), and In-Situ Expandable Tray (month matrix).
              </p>
            </div>
          </div>

          <div className={styles.tiersGrid}>
            <div className={styles.tierCard}>
              <h3 className={styles.tierTitle}>Tier 1: Compact Minimal Capsule</h3>
              <p className={styles.tierDescription}>Zero-slop compact pill for crowded utility headers and floating navbars.</p>
              <div className={styles.tierPreview}>
                <DatePicker
                  formFactor="compact"
                  date={activeDateIso}
                  onSelectDate={setActiveDateIso}
                />
              </div>
            </div>

            <div className={styles.tierCard}>
              <h3 className={styles.tierTitle}>Tier 2: Full Sanctuary Floor Bar</h3>
              <p className={styles.tierDescription}>Standard high-contrast floor bar with diurnal phase indicators and quick jump tokens.</p>
              <div className={styles.tierPreview}>
                <DatePicker
                  formFactor="full"
                  date={activeDateIso}
                  onSelectDate={setActiveDateIso}
                />
              </div>
            </div>

            <div className={styles.tierCard}>
              <h3 className={styles.tierTitle}>Tier 3: In-Situ Expandable Tray</h3>
              <p className={styles.tierDescription}>Interactive inline tray revealing the month coordinate matrix and temporal leaps.</p>
              <div className={styles.tierPreview}>
                <DatePicker
                  formFactor="expandable"
                  date={activeDateIso}
                  onSelectDate={setActiveDateIso}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Full Platform Directory Grid */}
        <section id="all-categories" className={styles.featureSection}>
          <h2 className={styles.sectionTitle}>Full Component Directory Index</h2>
          <p className={styles.sectionDesc}>Browse by architectural domain across the entire platform kit.</p>

          <div className={styles.categoriesGrid}>
            {KIT_CATEGORIES.map((cat) => (
              <div key={cat.id} className={styles.categoryCard}>
                <div className={styles.catCardHeader}>
                  <span className={styles.catIcon}>{cat.icon}</span>
                  <h3 className={styles.catTitle}>{cat.title}</h3>
                </div>
                <ul className={styles.catList}>
                  {cat.components.map((c) => (
                    <li key={c.id} className={styles.catListItem}>
                      <div className={styles.catItemRow}>
                        {c.route ? (
                          <Link href={c.route} className={styles.catItemLink}>
                            {c.name}
                          </Link>
                        ) : (
                          <Link href={`/kit#${c.id}`} className={styles.catItemLink}>
                            {c.name}
                          </Link>
                        )}
                        {c.badge && <span className={styles.catBadge}>{c.badge}</span>}
                      </div>
                      <p className={styles.catItemDesc}>{c.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
