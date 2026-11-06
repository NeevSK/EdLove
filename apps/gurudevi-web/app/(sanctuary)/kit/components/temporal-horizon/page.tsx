'use client';

import { ScrollArea } from '@repo/ui/components/web';

import React, { useState } from 'react';
import Link from 'next/link';
import { KitTableOfContents } from '../KitTableOfContents';
import { TemporalOrbit, type SpotHabitat } from '../TemporalOrbit';
import { ScrollInstrumentsShowcase } from '../ScrollInstrumentsShowcase';
import { Date as DatePicker, Time, DateTimeCombo, SearchField } from '@repo/ui/components/web';
import styles from './temporal-horizon-page.module.css';

export default function TemporalHorizonComparisonPage() {
  const [selectedSpot, setSelectedSpot] = useState<SpotHabitat | null>(null);
  const [activeDateIso, setActiveDateIso] = useState<string>(
    new globalThis.Date().toISOString().slice(0, 10)
  );
  const [activeTime, setActiveTime] = useState<string>('10:30');
  const [sampleSearchQuery, setSampleSearchQuery] = useState('');

  return (
    <div className={styles.pageLayout}>
      <aside className={styles.sidebarArea}>
        <KitTableOfContents activeId="temporal-combo" />
      </aside>

      <main className={styles.mainCanvas}>
        <header className={styles.pageHeader}>
          <div className={styles.breadcrumbs}>
            <Link href="/kit" className={styles.breadLink}>Sanctuary Kit</Link>
            <span className={styles.breadDivider}>/</span>
            <Link href="/kit/components" className={styles.breadLink}>Components</Link>
            <span className={styles.breadDivider}>/</span>
            <span className={styles.breadCurrent}>Temporal Perception Lab</span>
          </div>
          <h1 className={styles.pageTitle}>Temporal Perception Architecture</h1>
          <p className={styles.pageSubtitle}>
            Unified yet decoupled Date & Time controls, adaptive responsive containers, owned zero-slop scrollbars, and spatial circadian spot habitats.
          </p>
        </header>

        {/* Section 1: Unified Combo Component (Date + Time Together yet Decoupled) */}
        <section id="date-time-combo" className={styles.modelSection}>
          <div className={styles.modelHeader}>
            <span className={styles.modelTag}>Unified & Decoupled</span>
            <h2 className={styles.modelTitle}>DateTimeCombo Â· Date & Time Unified Control</h2>
            <p className={styles.modelDesc}>
              Brings the Date Horizon and Time together into a single master control while maintaining strict architectural decoupling.
              Includes one-click pills to toggle or dismiss either component on demand.
            </p>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <DateTimeCombo
              formFactor="auto"
              date={activeDateIso}
              time={activeTime}
              onSelectDate={setActiveDateIso}
              onTimeChange={setActiveTime}
              allowDismiss={true}
            />
          </div>
        </section>

        {/* Section 2: Dedicated Showcase for Owned Scrollbar Component */}
        <section id="scroll-area" className={styles.modelSection}>
          <div className={styles.modelHeader}>
            <span className={styles.modelTag}>Living Spatial Instruments</span>
            <h2 className={styles.modelTitle}>ScrollArea Â· Living Multi-World Navigation Instruments</h2>
            <p className={styles.modelDesc}>
              Transcending flat desktop scrollbars: 3D mechanical calibrated verniers, surface-tension fluid dewdrops,
              circadian diurnal sundial orbits, continuous perimeter border ribbons, and classic OS baselines.
            </p>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <ScrollInstrumentsShowcase />
          </div>
        </section>

        {/* Section 3: Dedicated Showcase for Owned Search Bar */}
        <section id="sanctuary-search-bar" className={styles.modelSection}>
          <div className={styles.modelHeader}>
            <span className={styles.modelTag}>Owned Search Component</span>
            <h2 className={styles.modelTitle}>Sanctuary Search Bar Â· Keyboard-First Filter</h2>
            <p className={styles.modelDesc}>
              Our owned zero-slop web search component featuring ambient focus glow, polished glyph prefix, escape-to-clear key handler, and screen-reader polite announcements.
            </p>
          </div>

          <div style={{ maxWidth: '420px', marginTop: '1rem' }}>
            <SearchField label="Search components"
              value={sampleSearchQuery}
              onChange={setSampleSearchQuery}
              placeholder="Search components, props, domains..."
              resultCount={sampleSearchQuery ? 4 : undefined}
            />
            {sampleSearchQuery && (
              <span style={{ fontSize: '0.78rem', color: 'var(--w-lamp, #e2c37a)', marginTop: '0.5rem', display: 'block' }}>
                Filtering query: &ldquo;{sampleSearchQuery}&rdquo;
              </span>
            )}
          </div>
        </section>

        {/* Section 4: Mobile & Tablet Fluid Responsive Preview */}
        <section className={styles.modelSection}>
          <div className={styles.modelHeader}>
            <span className={styles.modelTag}>Responsive Scaling</span>
            <h2 className={styles.modelTitle}>Mobile & Tablet Adaptive Scale Viewport</h2>
            <p className={styles.modelDesc}>
              Testing the control inside a simulated mobile viewport (375px) to ensure the container dynamically shrinks, the compact pill wraps to exact content width, and the owned scrollbar ensures fluid swipeability.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start', marginTop: '1rem' }}>
            {/* Mobile Viewport Simulation */}
            <div style={{
              width: '375px',
              padding: '1rem',
              borderRadius: '1.5rem',
              border: '2px solid rgba(226, 195, 122, 0.3)',
              background: '#0a0b12',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.72rem', color: '#888' }}>
                <span>ðŸ“± Mobile Simulation (375px)</span>
                <span>9:41 AM</span>
              </div>
              <DatePicker
                formFactor="full"
                date={activeDateIso}
                onSelectDate={setActiveDateIso}
              />
            </div>

            {/* Tablet / Medium Viewport Simulation */}
            <div style={{
              width: '520px',
              padding: '1rem',
              borderRadius: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: '#0d0f1a',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.72rem', color: '#888' }}>
                <span>ðŸ“Ÿ Tablet / Compact Pane (520px)</span>
                <span>Adaptive Horizon</span>
              </div>
              <DatePicker
                formFactor="full"
                date={activeDateIso}
                onSelectDate={setActiveDateIso}
              />
            </div>
          </div>
        </section>

        {/* Section 5: All Form Factors (Nano, Compact, Medium, Full, Expandable) */}
        <section className={styles.modelSection}>
          <div className={styles.modelHeader}>
            <span className={styles.modelTag}>Individual Tiers</span>
            <h2 className={styles.modelTitle}>Date Tiers Â· Inverted Hierarchy & Degradation Ladder</h2>
            <p className={styles.modelDesc}>
              Calendar icon placed on the right flank of the date, custom date picker icon on the bottom, and dynamic step-down degradation.
            </p>
          </div>

          <div className={styles.tiersStack}>
            <div className={styles.tierBox}>
              <span className={styles.tierLabel}>Tier 0: Nano Day Badge (Ultra-Compact)</span>
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <DatePicker
                  formFactor="nano"
                  date={activeDateIso}
                  onSelectDate={setActiveDateIso}
                />
              </div>
            </div>

            <div className={styles.tierBox}>
              <span className={styles.tierLabel}>Tier 1: Compact Minimal Capsule (Hugs Content Width)</span>
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <DatePicker
                  formFactor="compact"
                  date={activeDateIso}
                  onSelectDate={setActiveDateIso}
                />
              </div>
            </div>

            <div className={styles.tierBox}>
              <span className={styles.tierLabel}>Tier 1.5: Medium Window Bar</span>
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <DatePicker
                  formFactor="medium"
                  date={activeDateIso}
                  onSelectDate={setActiveDateIso}
                />
              </div>
            </div>

            <div className={styles.tierBox}>
              <span className={styles.tierLabel}>Tier 2: Inverted Full Horizon Bar</span>
              <DatePicker
                formFactor="full"
                date={activeDateIso}
                onSelectDate={setActiveDateIso}
              />
            </div>

            <div className={styles.tierBox}>
              <span className={styles.tierLabel}>Tier 3: In-Situ Expandable Month Matrix</span>
              <DatePicker
                formFactor="expandable"
                date={activeDateIso}
                onSelectDate={setActiveDateIso}
              />
            </div>
          </div>
        </section>

        {/* Section 6: Spatial Spot Model (Temporal Orbit) */}
        <section className={styles.modelSection}>
          <div className={styles.modelHeader}>
            <span className={styles.modelTag}>Spatial Habitats</span>
            <h2 className={styles.modelTitle}>Temporal Orbit Â· Habitat Spots vs Flat Tapes</h2>
            <p className={styles.modelDesc}>
              Celestial arc where diurnal moments are rendered as interactive celestial spot loci situated across the parabolic arch.
            </p>
          </div>

          <div className={styles.orbitContainerWrapper}>
            <TemporalOrbit
              currentDate={new globalThis.Date(activeDateIso + 'T12:00:00')}
              onSelectSpot={(spot) => setSelectedSpot(spot)}
            />
          </div>

          {selectedSpot && (
            <div className={styles.habitatExpandedCard}>
              <div className={styles.habitatEchoHeader}>
                <span className={styles.habitatEchoBadge}>Active Spot Locus</span>
                <span className={styles.habitatEchoTime}>{selectedSpot.time}</span>
              </div>
              <h3 className={styles.habitatEchoName}>{selectedSpot.name}</h3>
              <p className={styles.habitatEchoFocus}><strong>Atmosphere:</strong> {selectedSpot.focus}</p>
              <p className={styles.habitatEchoEnergy}><strong>Circadian Energy:</strong> {selectedSpot.energy}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}


