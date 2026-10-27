'use client';

import { Battery, Check } from 'lucide-react';
import { useState } from 'react';
import {
  type EnergyForecast as EnergyForecastType,
  useEnergyForecast,
} from '../../../../lib/sanctuary/selfBrowserAdapters';
import styles from './energy-forecast.module.css';

interface EnergyForecastProps {
  userId?: string;
  selectedDate: string;
  onClose?: () => void;
}

const ENERGY_LEVELS = [
  { level: 1, label: 'Depleted', emoji: '🍂', desc: 'Rest & recover', color: '#94a3b8' },
  { level: 2, label: 'Low', emoji: '🌱', desc: 'Gentle pacing', color: '#38bdf8' },
  { level: 3, label: 'Balanced', emoji: '🌿', desc: 'Steady focus', color: '#34d399' },
  { level: 4, label: 'High', emoji: '☀️', desc: 'Vibrant flow', color: '#f59e0b' },
  { level: 5, label: 'Radiant', emoji: '⚡', desc: 'Peak vitality', color: '#ef4444' },
] as const;

export function EnergyForecast({ userId, selectedDate }: EnergyForecastProps) {
  const { forecasts, saveForecast, isLoading } = useEnergyForecast(userId);
  const [selectedLevel, setSelectedLevel] = useState<number>(3);
  const [notes, setNotes] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    await saveForecast({
      forecastDate: selectedDate,
      energyLevel: selectedLevel as EnergyForecastType['energy_level'],
      notes: notes.trim() || undefined,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>Energy Forecast & Vitality Meter</h2>
          <p className={styles.subtitle}>
            Attune to your internal battery and calibrate your commitments
          </p>
        </div>
      </div>

      <div className={styles.levelGrid}>
        {ENERGY_LEVELS.map((item) => (
          <button
            key={item.level}
            type="button"
            className={`${styles.levelCard} ${selectedLevel === item.level ? styles.levelCardActive : ''}`}
            onClick={() => setSelectedLevel(item.level)}
          >
            <span className={styles.levelEmoji}>{item.emoji}</span>
            <span className={styles.levelLabel}>{item.label}</span>
            <span className={styles.levelDesc}>{item.desc}</span>
          </button>
        ))}
      </div>

      <div className={styles.notesArea}>
        <textarea
          rows={3}
          placeholder="Any physical sensations or context influencing your vitality today? (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={styles.notesInput}
        />
      </div>

      <button type="button" onClick={handleSave} className={styles.saveBtn}>
        {savedSuccess ? <Check size={16} /> : <Battery size={16} />}
        <span>{savedSuccess ? 'Vitality Logged' : 'Log Energy Level'}</span>
      </button>

      {forecasts.length > 0 && (
        <div className={styles.historySection}>
          <h3 className={styles.historyTitle}>Recent Vitality Trends</h3>
          <div className={styles.historyBars}>
            {forecasts
              .slice(0, 7)
              .reverse()
              .map((f) => {
                const matched = ENERGY_LEVELS.find((l) => l.level === f.energy_level);
                const heightPercent = ((f.energy_level || 3) / 5) * 100;
                return (
                  <div key={f.id || f.forecast_date} className={styles.barCol}>
                    <div
                      className={styles.barFill}
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: matched?.color ?? '#38bdf8',
                      }}
                      title={`${f.forecast_date}: Level ${f.energy_level}`}
                    />
                    <span className={styles.barDate}>
                      {f.forecast_date ? f.forecast_date.slice(5) : ''}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
