/**
 * WarmMirrorCard.web.tsx
 *
 * Web override of the RN WarmMirrorCard. The RN version uses hardcoded white
 * text (designed for dark-themed screens). On web, BaseSelfView renders on a
 * light sanctuary surface so we use CSS variables instead.
 *
 * Metro automatically resolves .web.tsx over .tsx on the web platform.
 */
import React from 'react';

interface WarmMirrorCardProps {
    text: string | null;
}

export function WarmMirrorCard({ text }: WarmMirrorCardProps) {
    if (!text) return null;

    return (
        <div style={{
            padding: '24px 28px',
            backgroundColor: 'rgba(139, 92, 246, 0.08)',
            borderRadius: '16px',
            border: '1px solid rgba(139, 92, 246, 0.18)',
        }}>
            <div style={{
                fontSize: '12px',
                fontWeight: '800',
                color: '#8B5CF6',
                marginBottom: '12px',
                textTransform: 'uppercase',
            }}>
                📖 YOUR WEEK AS A STORY
            </div>
            <p style={{
                fontSize: '14px',
                lineHeight: '1.7',
                color: 'var(--ink-soft)',
                fontStyle: 'italic',
                margin: 0,
            }}>
                {text}
            </p>
        </div>
    );
}
