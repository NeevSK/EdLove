'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import {
  CANONICAL_CLIMATE_DIMENSIONS,
  type ClimateDimensionRating,
  useClimateSensing,
} from '@/lib/repositories/climateSensingRepository';
import styles from './climate.module.css';

const defaultDimensions: readonly ClimateDimensionRating[] = CANONICAL_CLIMATE_DIMENSIONS;

interface ClimateSensingFloorProps {
  displayName: string;
  capacity?: string;
}

export function ClimateSensingFloor({ displayName, capacity }: Readonly<ClimateSensingFloorProps>) {
  const { metrics, history, submitRating, isOffline, pendingCount } = useClimateSensing();
  const [dimensions, setDimensions] = useState<readonly ClimateDimensionRating[]>(defaultDimensions);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState('Grade 10-A (Lotus Sanctuary)');
  const [notice, setNotice] = useState<string | null>(null);

  const handleScoreChange = (id: string, newScore: number) => {
    setDimensions((prev) => prev.map((d) => (d.id === id ? { ...d, score: newScore } : d)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const safetyDim = dimensions.find((d) => d.id === 'safety')?.score ?? 4;
      const balanceDim = dimensions.find((d) => d.id === 'balance')?.score ?? 3;
      const belongingDim = dimensions.find((d) => d.id === 'belonging')?.score ?? 5;
      const connectionDim = dimensions.find((d) => d.id === 'connection')?.score ?? 4;
      const vitalityDim = dimensions.find((d) => d.id === 'vitality')?.score ?? 4;

      await submitRating({
        psychologicalSafety: safetyDim,
        academicPacing: balanceDim,
        peerBelonging: belongingDim,
        teacherWarmth: connectionDim,
        cognitiveChallenge: vitalityDim,
      });

      setSubmitted(true);
      setNotice(
        isOffline
          ? 'Classroom climate pulse saved locally and queued for synchronization.'
          : 'Anonymous classroom climate pulse submitted successfully. Aggregates updated.',
      );
    } catch {
      setNotice('Failed to submit climate pulse. Please try again.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const overviewDimensions = [
    { id: 'safety', name: 'Psychological & Emotional Safety', score: metrics.psychologicalSafety },
    { id: 'belonging', name: 'Peer Belonging & Collaboration', score: metrics.peerBelonging },
    { id: 'connection', name: 'Teacher Warmth & Attunement', score: metrics.teacherWarmth },
    { id: 'balance', name: 'Workload & Sensory Pace', score: metrics.academicPacing },
    { id: 'vitality', name: 'Classroom Vitality & Hope', score: metrics.cognitiveChallenge },
  ];

  const averageScore = (
    (metrics.psychologicalSafety +
      metrics.academicPacing +
      metrics.peerBelonging +
      metrics.teacherWarmth +
      metrics.cognitiveChallenge) /
    5
  ).toFixed(1);

  return (
    <div className={styles.container}>
      <header className={styles.headerBar}>
        <div className={styles.titleArea}>
          <div style={{ marginBottom: '0.5rem' }}>
            <Link
              href="/workspace"
              style={{
                fontSize: '0.8rem',
                fontWeight: 650,
                color: 'var(--color-action, #a85022)',
                textDecoration: 'none',
              }}
            >
              ← Back to Attendance Workspace
            </Link>
          </div>
          <h1>Classroom Climate & Emotional Sensing</h1>
          <p>
            Anonymous Likert survey sensing psychological safety, educator attunement, and student
            vitality.
          </p>
        </div>
      </header>

      {notice && (
        <div aria-live="polite" style={{ color: '#2e5d32', fontWeight: 700, fontSize: '0.85rem' }}>
          ✓ {notice}
        </div>
      )}

      {/* Class Overview Aggregation */}
      <section className={styles.radarCard}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div>
            <h2 className={styles.cardTitle}>
              <span>🌱</span>
              <span>Sanctuary Climate Index: {averageScore} / 5.0</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft, #453c35)', margin: 0 }}>
              Aggregated from 34 anonymous responses in {selectedClassroom}.
            </p>
          </div>
          <select
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--color-line, rgba(104, 94, 85, 0.25))',
              background: '#ffffff',
              fontSize: '0.8rem',
            }}
          >
            <option value="Grade 10-A (Lotus Sanctuary)">Grade 10-A (Lotus Sanctuary)</option>
            <option value="Grade 10-B (Cedar Circle)">Grade 10-B (Cedar Circle)</option>
            <option value="Grade 11-A (Monsoon Hall)">Grade 11-A (Monsoon Hall)</option>
          </select>
        </div>

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}
        >
          {overviewDimensions.map((dim) => (
            <div key={dim.id} className={styles.scoreBar}>
              <span className={styles.scoreLabel}>{dim.name}</span>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${(dim.score / 5) * 100}%` }} />
              </div>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--color-ink, #131e27)',
                  width: '2.5rem',
                }}
              >
                {dim.score}.0
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Survey Form */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          <span>📝</span>
          <span>Submit Today&rsquo;s Anonymous Pulse</span>
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft, #453c35)', margin: 0 }}>
          Your responses are completely anonymized to protect honest reflection.
        </p>

        <form onSubmit={handleSubmit} className={styles.dimensionList}>
          {dimensions.map((dim) => (
            <div key={dim.id} className={styles.dimensionItem}>
              <div className={styles.dimHeader}>
                <span className={styles.dimTitle}>{dim.name}</span>
                <span className={styles.dimScoreBadge}>{dim.score} / 5</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft, #453c35)', margin: 0 }}>
                {dim.description}
              </p>
              <div className={styles.sliderWrapper}>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={dim.score}
                  onChange={(e) => handleScoreChange(dim.id, Number(e.target.value))}
                  className={styles.slider}
                  aria-label={dim.name}
                />
              </div>
              <div className={styles.sliderLabels}>
                <span>1 - Needs Attention</span>
                <span>3 - Moderate</span>
                <span>5 - Thriving & Vibrant</span>
              </div>
            </div>
          ))}

          <button type="submit" className={styles.submitBtn}>
            {submitted ? 'Update Anonymized Pulse' : 'Submit Climate Pulse'}
          </button>
        </form>
      </section>
    </div>
  );
}
