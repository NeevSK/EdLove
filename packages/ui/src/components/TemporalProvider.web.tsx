import React, { createContext, useContext, useMemo } from 'react';
import { useTemporalStore } from '@repo/core';

interface TemporalContextType {
    blurAmount: number;
    colorShift: string;
    intensity: number;
}

const TemporalContext = createContext<TemporalContextType | undefined>(undefined);

/**
 * TemporalProvider
 * 
 * Centralizes temporal state styling effects based on temporal displacement.
 * Adheres to the "WOAH" principle for premium visual transitions.
 */
export const TemporalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { viewDate, viewMode } = useTemporalStore();

    const value = useMemo(() => {
        const now = new Date();
        const targetDate = new Date(viewDate);
        const diffDays = Math.abs(now.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24);
        
        let blurAmount = 0;
        let colorShift = 'transparent';
        let intensity = 0;

        if (viewMode === 'timeline') {
            blurAmount = Math.min(diffDays * 0.5, 8); // Max 8px blur
            intensity = Math.min(diffDays / 30, 1);    // Scale intensity over a month
            
            if (targetDate < now) {
                colorShift = `rgba(15, 23, 42, ${intensity * 0.1})`; // Twilight/Past shift
            } else {
                colorShift = `rgba(251, 191, 36, ${intensity * 0.1})`; // Saffron/Future shift
            }
        }

        return { blurAmount, colorShift, intensity };
    }, [viewDate, viewMode]);

    return (
        <TemporalContext.Provider value={value}>
            <div style={{ 
                filter: value.blurAmount > 0 ? `blur(${value.blurAmount}px)` : 'none',
                backgroundColor: value.colorShift,
                transition: 'filter 0.5s ease, background-color 0.5s ease',
                minHeight: '100%'
            }}>
                {children}
            </div>
        </TemporalContext.Provider>
    );
};

export const useTemporalAesthetics = () => {
    const context = useContext(TemporalContext);
    if (!context) {
        throw new Error('useTemporalAesthetics must be used within a TemporalProvider');
    }
    return context;
};
