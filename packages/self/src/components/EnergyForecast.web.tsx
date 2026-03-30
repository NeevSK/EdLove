/**
 * EnergyForecast.web.tsx
 *
 * Web override of the RN EnergyForecast. The native version uses expo-haptics
 * and RN UI components. On web we deliver the same 1-5 energy level log for
 * today with a battery-style visual and notes field.
 * Metro resolves this over EnergyForecast.tsx on the web platform.
 */
import React, { useState, useEffect } from 'react';
import { useTemporalStore } from '@repo/core';
import { useEnergyForecast } from '../hooks/useEnergyForecast';
import { ENERGY_COLORS } from '../constants/wellbeing';
import { Battery } from 'lucide-react-native';

interface EnergyForecastProps {
    userId?: string;
}

const LEVEL_LABELS: Record<number, { label: string; emoji: string; desc: string }> = {
    1: { label: 'Depleted',    emoji: '\uD83E\uDEAB', desc: 'Running on empty. Rest is medicine.' },
    2: { label: 'Low',         emoji: '\uD83D\uDE14', desc: 'Conserve energy. Be gentle with yourself.' },
    3: { label: 'Moderate',    emoji: '\uD83D\uDE10', desc: 'Steady and present. Enough to show up.' },
    4: { label: 'Energised',   emoji: '\uD83C\uDF1F', desc: 'Clear and capable. Use this well.' },
    5: { label: 'Flourishing', emoji: '\u26A1', desc: 'Full vitality. Channel this energy wisely.' },
};

export default function EnergyForecast({ userId }: EnergyForecastProps) {
    const { forecasts, refreshData, isLoading, saveForecast } = useEnergyForecast(userId);
    const { isPastView, viewDate } = useTemporalStore();

    const currentForecast = forecasts.find(f => f.forecast_date === viewDate) ?? null;
    const [selectedLevel, setSelectedLevel] = useState<number | null>(currentForecast?.energy_level ?? null);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setSelectedLevel(currentForecast?.energy_level ?? null);
        setNotes(currentForecast?.notes ?? '');
    }, [currentForecast?.energy_level, currentForecast?.notes]);

    const handleSave = async (level: number) => {
        if (!userId) return;
        setSelectedLevel(level);
        setSaving(true);
        try {
            await saveForecast({
                forecastDate: viewDate,
                energyLevel: level as 1 | 2 | 3 | 4 | 5,
                notes,
                existingId: currentForecast?.id,
            });
            await refreshData();
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return <div style={{ height: '60px', background: 'var(--background-alt)', borderRadius: '12px' }} />;
    }

    const meta = selectedLevel ? LEVEL_LABELS[selectedLevel] : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                <Battery size={16} color="var(--sanctuary-saffron)" /
                <span style={{ fontSize: '14px', fontWeight: '800' }}>Energy Forecast</span
                {saved && <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--moss)', fontWeight: '700' }}>\u2713 Logged</span>}
            </div

            {/* Level selector */}
            <div style={{ display: 'flex', gap: '8px' }}
                {[1, 2, 3, 4, 5].map(level => {
                    const m = LEVEL_LABELS[level];
                    const isSelected = selectedLevel === level;
                    const color = ENERGY_COLORS[level] ?? '#8B5CF6';
                    return (
                        <button
                            key={level}
                            onClick={() => !isPastView && handleSave(level)}
                            disabled={saving || isPastView}
                            title={isPastView ? 'Viewing past energy resonance' : m!.label}
                            style={{
                                flex: 1,
                                padding: '12px 4px',
                                borderRadius: '10px',
                                border: `2px solid ${isSelected ? color : 'var(--border)'}`,
                                background: isSelected ? `${color}18` : 'var(--background-alt)',
                                cursor: (saving || isPastView) ? 'default' : 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.2s',
                                transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                                opacity: isPastView && !isSelected ? 0.4 : 1,
                            }}
                        
                            <span style={{ fontSize: '20px' }}>{m!.emoji}</span
                            <span style={{ fontSize: '9px', fontWeight: '700', color: isSelected ? color : 'var(--ink-ghost)', textTransform: 'uppercase' }}>{m!.label}</span
                        </button
                    );
                })}
            </div

            {/* Description */}
            {meta && (
                <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', margin: 0, fontStyle: 'italic' }}
                    {meta.desc}
                </p
            )}

            {/* Notes */}
            {selectedLevel && (
                <div style={{ display: 'flex', gap: '8px' }}
                    <input
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        onBlur={() => !isPastView && selectedLevel && handleSave(selectedLevel)}
                        placeholder={isPastView ? "Viewing historical context" : "Add context (optional)\u2026"}
                        disabled={isPastView}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontSize: '13px', fontFamily: 'var(--font-body)', outline: 'none', opacity: isPastView ? 0.7 : 1 }}
                    /
                </div
            )}
        </div
    );
}
