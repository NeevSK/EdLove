/**
 * DailyContentCard.web.tsx
 *
 * Web override of the RN DailyContentCard. Same dailyContentAPI call,
 * pure HTML/CSS rendering. Metro resolves this over DailyContentCard.tsx.
 */
import React, { useState, useEffect } from 'react';
import { dailyContentAPI } from '../api/dailyContent';
import type { DailyContent } from '../types';

interface DailyContentCardProps {
    type: 'motivation' | 'did_you_know';
}

export default function DailyContentCard({ type }: DailyContentCardProps) {
    const [content, setContent] = useState<DailyContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    const isMotivation = type === 'motivation';
    const title = isMotivation ? 'Daily Motivation' : 'Did You Know?';
    const emoji = isMotivation ? '✨' : '💡';
    const accent = isMotivation ? '#F59E0B' : '#22C55E';

    useEffect(() => {
        dailyContentAPI.getTodaysContent().then(c => {
            setContent(isMotivation ? c?.motivation : c?.didYouKnow);
        }).catch(() => {}).finally(() => setLoading(false));
    }, [type, isMotivation]);

    if (loading) return <div style={{ height: '72px', background: 'var(--background-alt)', borderRadius: '12px' }} />;
    if (!content) return null;

    return (
        <div
            onClick={() => setExpanded(v => !v)}
            style={{ 
                padding: '16px 20px', 
                background: 'var(--background-alt)', 
                borderRadius: '12px', 
                borderLeft: `3px solid ${accent}`, 
                cursor: 'pointer' 
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px' }}>{emoji}</span>
                <span style={{ 
                    fontSize: '11px', 
                    fontWeight: '800', 
                    textTransform: 'uppercase', 
                    color: accent, 
                    letterSpacing: '1px' 
                }}>
                    {title}
                </span>
            </div>
            <p style={{ 
                fontSize: '13px', 
                lineHeight: '1.65', 
                color: 'var(--ink-soft)', 
                margin: 0, 
                display: '-webkit-box', 
                WebkitLineClamp: expanded ? undefined : 2, 
                WebkitBoxOrient: 'vertical' as any, 
                overflow: expanded ? 'visible' : 'hidden' 
            }}>
                {content.content}
            </p>
            {content.author && expanded && (
                <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', marginTop: '8px' }}>
                    — {content.author}
                </div>
            )}
        </div>
    );
}
