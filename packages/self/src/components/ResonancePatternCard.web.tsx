/**
 * ResonancePatternCard.web.tsx
 *
 * Web override. The native version renders an SVG-like radar chart using
 * absolute-positioned React Native Views. On web we render a proper inline
 * SVG polygon radar chart with the same 4-axis data from useOrientationInference.
 * Metro resolves this over ResonancePatternCard.tsx on the web platform.
 */
import React from 'react';
import { useOrientationInference } from '../hooks/useOrientationInference';
import { usePermissions } from '@repo/core';
import type { MoodLog, EnergyForecast } from '../types/Wellbeing';
import type { OrientationSeeds } from '@repo/profile';
import { Sparkles } from 'lucide-react-native';

export interface ResonancePatternCardProps {
    orientationSeeds?: OrientationSeeds | null;
    moodLogs?: MoodLog[];
    energyForecasts?: EnergyForecast[];
    gradeNumber?: number | null;
    onExplore?: () => void;
}

const AXES = [
    { key: 'depth_breadth', lo: 'Depth',   hi: 'Breadth'  },
    { key: 'reflect_act',   lo: 'Reflect',  hi: 'Act'      },
    { key: 'solo_social',   lo: 'Solo',     hi: 'Social'   },
    { key: 'steady_surge',  lo: 'Steady',   hi: 'Surge'    },
];

const SIZE = 140;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 54;

function polarToXY(angleDeg: number, radius: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function buildPolygon(seeds: Record<string, number>): string {
    return AXES.map((axis, i) => {
        const angle = (360 / AXES.length) * i;
        const value = (seeds[axis.key] ?? 50) / 100;
        const { x, y } = polarToXY(angle, R * value);
        return `${x},${y}`;
    }).join(' ');
}

function buildGrid(): string[][] {
    return [0.25, 0.5, 0.75, 1].map(pct =>
        AXES.map((_, i) => {
            const angle = (360 / AXES.length) * i;
            const { x, y } = polarToXY(angle, R * pct);
            return `${x},${y}`;
        })
    );
}

export function ResonancePatternCard({
    orientationSeeds,
    moodLogs,
    energyForecasts,
    gradeNumber,
    onExplore,
}: ResonancePatternCardProps) {
    const { context } = usePermissions();
    const authority = context.roles[0];
    const { seeds: inferredSeeds, isDefault, confidence, dataQuality } = useOrientationInference({
        explicitSeeds: orientationSeeds,
        moodLogs,
        energyForecasts,
        authority,
        gradeNumber,
    });

    const seeds: Record<string, number> = {
        depth_breadth: inferredSeeds.depth_breadth,
        reflect_act:   inferredSeeds.reflect_act,
        solo_social:   inferredSeeds.solo_social,
        steady_surge:  inferredSeeds.steady_surge,
    };

    const isForming = isDefault && confidence < 0.25;
    const polygon = buildPolygon(seeds);
    const grid = buildGrid();
    const ACCENT = '#F59E0B'; // sanctuary saffron

    return (
        <div style={{ padding: '20px 24px', background: 'var(--background-alt)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Sparkles size={14} color={ACCENT} />
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: ACCENT }}>
                    Your Learning Pattern
                </span>
                {dataQuality !== 'default' && (
                    <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px', background: `${ACCENT}18`, color: ACCENT }}>
                        {dataQuality}
                    </span>
                )}
            </div>

            {isForming ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', color: 'var(--ink-ghost)', margin: 0 }}>
                        ✦ Still forming…{' '}
                        <span style={{ fontSize: '12px' }}>Your pattern will emerge as you use the app.</span>
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                    {/* SVG radar chart */}
                    <div style={{ flexShrink: 0 }}>
                        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                            {/* Grid rings */}
                            {grid.map((ring, ri) => (
                                <polygon
                                    key={ri}
                                    points={ring.join(' ')}
                                    fill="none"
                                    stroke="var(--border)"
                                    strokeWidth="0.8"
                                />
                            ))}
                            {/* Axis spokes */}
                            {AXES.map((_, i) => {
                                const angle = (360 / AXES.length) * i;
                                const { x, y } = polarToXY(angle, R);
                                return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="var(--border)" strokeWidth="0.8" />;
                            })}
                            {/* Data polygon */}
                            <polygon
                                points={polygon}
                                fill={`${ACCENT}28`}
                                stroke={ACCENT}
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                            />
                            {/* Data point dots */}
                            {AXES.map((axis, i) => {
                                const angle = (360 / AXES.length) * i;
                                const value = Math.max(0, Math.min(100, seeds[axis.key] ?? 50)) / 100;
                                const { x, y } = polarToXY(angle, R * value);
                                return <circle key={i} cx={x} cy={y} r="3.5" fill={ACCENT} />;
                            })}
                        </svg>
                    </div>

                    {/* Axis breakdowns */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {AXES.map(axis => {
                            const value = seeds[axis.key] ?? 50;
                            const pct = value / 100;
                            const pole = pct < 0.4 ? axis.lo : pct > 0.6 ? axis.hi : '—';
                            return (
                                <div key={axis.key}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '10px', color: 'var(--ink-ghost)' }}>{axis.lo}</span>
                                        <span style={{ fontSize: '10px', fontWeight: '700', color: ACCENT }}>{pole}</span>
                                        <span style={{ fontSize: '10px', color: 'var(--ink-ghost)' }}>{axis.hi}</span>
                                    </div>
                                    <div style={{ position: 'relative', height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
                                        <div style={{
                                            position: 'absolute',
                                            left: `${value}%`,
                                            top: '-1px',
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: ACCENT,
                                            transform: 'translateX(-3px)',
                                        }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Confidence footnote */}
            <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--ink-ghost)', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                Pattern confidence: {Math.round(confidence * 100)}% · {
                    isDefault ? 'Perspective defaults — usage will refine this.' :
                    dataQuality === 'strong' ? 'Strong signal from onboarding + behavior.' :
                    'Emerging from your usage patterns.'
                }
            </div>

            {onExplore && (
                <button
                    onClick={onExplore}
                    style={{ marginTop: '12px', background: 'none', border: 'none', color: ACCENT, fontSize: '12px', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                >
                    Explore pattern →
                </button>
            )}
        </div>
    );
}

export default ResonancePatternCard;
