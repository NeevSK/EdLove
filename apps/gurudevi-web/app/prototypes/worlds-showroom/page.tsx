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
import { Moon, Sparkles, Sun } from 'lucide-react';
import { useState } from 'react';
import styles from './showroom.module.css';

const PHASES: readonly { id: WorldPhase; label: string; hour: string }[] = [
  { id: 'predawn', label: 'Predawn', hour: '04:00 - 06:00' },
  { id: 'dawn', label: 'Dawn', hour: '06:00 - 09:00' },
  { id: 'morning', label: 'Morning', hour: '09:00 - 12:00' },
  { id: 'afternoon', label: 'Afternoon', hour: '12:00 - 17:00' },
  { id: 'dusk', label: 'Dusk', hour: '17:00 - 20:00' },
  { id: 'night', label: 'Night', hour: '20:00 - 04:00' },
];

export default function WorldsShowroomPrototypePage() {
  const [globalMode, setGlobalMode] = useState<WorldMode>('light');
  const [globalPhase, setGlobalPhase] = useState<WorldPhase>('morning');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'si' | 'ta'>('en');
  const [activeChip, setActiveChip] = useState<string>('teachers');
  const [attendanceCount, setAttendanceCount] = useState<number>(34);

  return (
    <main className={styles.showroom} data-phase={globalPhase} data-mode={globalMode}>
      <header className={styles.intro}>
        <div className={styles.badge}>
          <Sparkles size={14} />
          <span>Disposable Prototype · Explore Mode</span>
        </div>
        <h1 className={styles.title}>Worlds Foundation Showroom</h1>
        <p className={styles.description}>
          Gurudevi generic components dressed dynamically by cultural worlds, circadian diurnal
          phases, and lighting modes. Side-by-side verification and aesthetic inspection.
        </p>
      </header>

      {/* Interactive Global Control Bar */}
      <section className={styles.toolbar} aria-label="Controls">
        <div className={styles.toolGroup}>
          <span className={styles.toolLabel}>Mode</span>
          <Chips single label="Select Light or Dark mode">
            <Chip
              label="Light"
              selected={globalMode === 'light'}
              onClick={() => setGlobalMode('light')}
            />
            <Chip
              label="Dark"
              selected={globalMode === 'dark'}
              onClick={() => setGlobalMode('dark')}
            />
          </Chips>
        </div>

        <div className={styles.toolGroup}>
          <span className={styles.toolLabel}>Circadian Phase</span>
          <Chips single label="Circadian Phase of the day">
            {PHASES.map((p) => (
              <Chip
                key={p.id}
                label={`${p.label}`}
                selected={globalPhase === p.id}
                onClick={() => setGlobalPhase(p.id)}
              />
            ))}
          </Chips>
        </div>

        <div className={styles.toolGroup}>
          <span className={styles.toolLabel}>Dialect</span>
          <Chips single label="Language">
            <Chip
              label="English"
              selected={selectedLanguage === 'en'}
              onClick={() => setSelectedLanguage('en')}
            />
            <Chip
              label="සිංහල"
              selected={selectedLanguage === 'si'}
              onClick={() => setSelectedLanguage('si')}
            />
            <Chip
              label="தமிழ்"
              selected={selectedLanguage === 'ta'}
              onClick={() => setSelectedLanguage('ta')}
            />
          </Chips>
        </div>
      </section>

      {/* 6 Worlds Side-By-Side Matrix */}
      <div className={styles.grid}>
        {WORLD_IDS.map((worldId: WorldId) => {
          const world = WORLDS[worldId];
          const palette = world.palette[globalMode];

          return (
            <div key={worldId} className={styles.worldCard}>
              <WorldScope world={worldId} mode={globalMode} phase={globalPhase}>
                {/* World Card Header */}
                <div className={styles.cardHeader}>
                  <div>
                    <h2 className={styles.worldNameEn}>{world.names.en}</h2>
                    <p className={styles.worldNameNative}>
                      {world.names.si} · {world.names.ta}
                    </p>
                    <p className={styles.worldDesc}>{world.description}</p>
                  </div>

                  {/* Swatches */}
                  <div className={styles.swatchRow} title="World tokens palette">
                    <span
                      className={styles.swatch}
                      style={{ background: palette.ground }}
                      title="Ground"
                    />
                    <span
                      className={styles.swatch}
                      style={{ background: palette.raised }}
                      title="Raised"
                    />
                    <span
                      className={styles.swatch}
                      style={{ background: palette.lamp }}
                      title="Lamp"
                    />
                    <span
                      className={styles.swatch}
                      style={{ background: palette.ink }}
                      title="Ink"
                    />
                  </div>
                </div>

                {/* World Dressed Components Playground */}
                <div className={styles.cardBody}>
                  {/* Buttons */}
                  <div className={styles.componentGroup}>
                    <span className={styles.groupLabel}>Buttons & Actions</span>
                    <div className={styles.buttonRow}>
                      <Button
                        variant="primary"
                        size="sm"
                        label="Take Roll"
                        onClick={() => setAttendanceCount((c) => c + 1)}
                      />
                      <Button variant="secondary" size="sm" label="Inspect" />
                      <Button variant="quiet" size="sm" label="Dismiss" />
                    </div>
                  </div>

                  {/* Chips Filter */}
                  <div className={styles.componentGroup}>
                    <span className={styles.groupLabel}>Cultural Chips</span>
                    <Chips single label="Filters">
                      <Chip
                        label="Teachers"
                        selected={activeChip === 'teachers'}
                        onClick={() => setActiveChip('teachers')}
                      />
                      <Chip
                        label="Students"
                        selected={activeChip === 'students'}
                        onClick={() => setActiveChip('students')}
                      />
                      <Chip
                        label="Quiet Hours"
                        selected={activeChip === 'quiet'}
                        onClick={() => setActiveChip('quiet')}
                      />
                    </Chips>
                  </div>

                  {/* Interactive Section & Rows */}
                  <div className={styles.componentGroup}>
                    <span className={styles.groupLabel}>Dressed Section & Rows</span>
                    <Section
                      title="Sanctuary Room"
                      voice="Calm presence in learning."
                      density="dense"
                    >
                      <Row
                        label="Morning Attendance"
                        detail={`${attendanceCount} Present`}
                        signal
                        signalLabel="Active"
                      />
                      <Row
                        label="Timetable Schedule"
                        detail="Grade 10B · Sinhala Lit"
                        chevron
                        onPress={() => {}}
                      />
                      <Row
                        label="Mindful Breath"
                        detail="5 mins"
                        accessory={
                          <Button
                            variant="secondary"
                            size="sm"
                            label="Start"
                            onClick={() => {}}
                          />
                        }
                      />
                    </Section>
                  </div>

                  {/* Surface & TextField */}
                  <div className={styles.componentGroup}>
                    <span className={styles.groupLabel}>Surface & Inputs</span>
                    <Surface tone="inset">
                      <TextField
                        label="Reflective Journal Note"
                        hint="Thoughts saved locally in offline SQLite."
                        placeholder="Write a calm thought..."
                      />
                    </Surface>
                  </div>
                </div>
              </WorldScope>
            </div>
          );
        })}
      </div>
    </main>
  );
}
