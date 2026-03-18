import React, { createContext, useContext, useMemo } from 'react';
import { useResonanceStore } from '@repo/core';

interface ResonanceContextType {
    blurAmount: number;
    colorShift: string;
    intensity: number;
}

const ResonanceContext = createContext<ResonanceContextType | undefined>(undefined);

/**
 * ResonanceProvider
 * 
 * Centralizes temporal state styling effects based on temporal displacement.
 * Adheres to the "WOAH" principle for premium visual transitions.
 */
export const ResonanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { resonanceDate, viewMode } = useResonanceStore();

    const value = useMemo(() => {
        const now = new Date();
        const resDate = new Date(resonanceDate);
        const diffDays = Math.abs(now.getTime() - resDate.getTime()) / (1000 * 60 * 60 * 24);
        
        let blurAmount = 0;
        let colorShift = 'transparent';
        let intensity = 0;

        if (viewMode === 'timeline') {
            blurAmount = Math.min(diffDays * 0.5, 8); // Max 8px blur
            intensity = Math.min(diffDays / 30, 1);    // Scale intensity over a month
            
            if (resDate < now) {
                colorShift = `rgba(15, 23, 42, ${intensity * 0.1})`; // Twilight/Past shift
            } else {
                colorShift = `rgba(251, 191, 36, ${intensity * 0.1})`; // Saffron/Future shift
            }
        }

        return { blurAmount, colorShift, intensity };
    }, [resonanceDate, viewMode]);

    return (
        <ResonanceContext.Provider value={value}>
            <div style={{ 
                filter: value.blurAmount > 0 ? `blur(${value.blurAmount}px)` : 'none',
                backgroundColor: value.colorShift,
                transition: 'filter 0.5s ease, background-color 0.5s ease',
                minHeight: '100%'
            }}>
                {children}
            </div>
        </ResonanceContext.Provider>
    );
};

export const useResonanceAesthetics = () => {
    const context = useContext(ResonanceContext);
    if (!context) {
        throw new Error('useResonanceAesthetics must be used within a ResonanceProvider');
    }
    return context;
};
