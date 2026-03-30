/**
 * ImpactRipplesCard.web.tsx
 *
 * Web override of the RN ImpactRipplesCard. The RN version uses hardcoded
 * white text (designed for dark-themed screens). On web, BaseSelfView renders
 * on a light sanctuary surface so we use CSS variables instead.
 *
 * Metro automatically resolves .web.tsx over .tsx on the web platform.
 */
import React from 'react';
import type { ImpactRipple } from '@repo/core';

interface ImpactRipplesCardProps {
    ripples: ImpactRipple[];
}

export function ImpactRipplesCard({ ripples }: ImpactRipplesCardProps) {
    if (!ripples.length) return null;

    return (
        <div style={{
            padding: '20px 24px',
            backgroundColor: 'rgba(58, 122, 154, 0.07)',
            borderRadius: '14px',
            border: '1px solid rgba(58, 122, 154, 0.18)',
        }}
            <div style={{
                fontSize: '10px',
                fontWeight: '900',
                letterSpacing: '2px',
                color: '#3A7A9A',
                marginBottom: '14px',
                textTransform: 'uppercase',
            }}
                \uD83D\uDCA7 IMPACT RIPPLES
            </div
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                {ripples.map(r => (
                    <div
                        key={r.id}
                        style={{
                            padding: '10px 14px',
                            backgroundColor: 'rgba(58, 122, 154, 0.06)',
                            borderRadius: '10px',
                            border: '1px solid rgba(58, 122, 154, 0.12)',
                        }}
                    
                        <p style={{
                            fontSize: '13px',
                            lineHeight: '1.55',
                            color: 'var(--ink-soft)',
                            margin: 0,
                        }}
                            {r.warm_message_en ?? r.ripple_type}
                        </p
                    </div
                ))}
            </div
        </div
    );
}
