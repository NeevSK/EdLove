import React from 'react';

export interface SelfViewFeature {
    id: string;
    label: string;
    content: React.ReactNode;
    icon?: string;
    category?: 'pulse' | 'wisdom' | 'reflection' | 'rhythm' | 'growth' | 'ritual';
    timing?: {
        startTime?: string; // HH:mm
        endTime?: string;
        preferredPhase?: 'morning' | 'afternoon' | 'night';
    };
    domainColor?: string;
    domainId?: string;
    historyContent?: React.ReactNode;
}

export interface SelfViewDomain {
    id: string;
    title: string;
    accentColor: string; // The "vibe" color (e.g., Amber, Lotus, Teal)
    features?: SelfViewFeature[];
    content?: React.ReactNode;
    description?: string;
}

export interface BaseSelfViewProps {
    role: string;
    title?: string;
    description?: string;

    /** The primary content domains (Personal, Working, etc.) */
    domains: SelfViewDomain[];

    /** Additional layers (usually for Web sidebar or Mobile bottom) */
    sideBar?: React.ReactNode;
    reminders?: React.ReactNode;

    /** Universal Expansions (Legacy support or explicit placement) */
    morningRitual?: React.ReactNode;
    nightRitual?: React.ReactNode;
    voiceJournal?: React.ReactNode;
}
