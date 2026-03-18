import { create } from 'zustand';

export type ResonancePhase = 'past' | 'present' | 'future';
export type TemporalScale = 'day' | 'week' | 'month' | 'year' | 'custom';
export type ResonanceViewMode = 'spotlight' | 'timeline';



interface ResonanceState {
    /**
     * The targeted date for temporal resonance.
     * Format: YYYY-MM-DD
     */
    resonanceDate: string;
    
    /**
     * The intensity of the temporal shift (0.0 to 1.0).
     * Used to drive UI animations and ghosting effects.
     */
    intensity: number;
    
    /**
     * The current temporal phase.
     */
    phase: ResonancePhase;

    /**
     * The current viewing scale (precision).
     */
    viewScale: TemporalScale;

    /**
     * Offline status (synced from global store).
     */
    isOffline: boolean;

    /**
     * The current view mode.
     * spotlight: Focus on a single point in time.
     * timeline: Focus on a chronological journey.
     */
    viewMode: ResonanceViewMode;

    /**
     * Focus filter for timeline mode.
     * 'all' shows everything, otherwise filters by feature type.
     */
    timelineFocus: string;



    
    /**
     * Update the resonance date and automatically determine the phase.
     */
    setResonanceDate: (date: string) => void;
    
    /**
     * Shift the intensity of the resonance.
     */
    setIntensity: (value: number) => void;
    
    /**
     * Reset the pulse to the "Living Present".
     */
    resetPulse: () => void;
    
    /**
     * Update the temporal scale.
     */
    setScale: (scale: TemporalScale) => void;

    /**
     * Set offline status.
     */
    setOffline: (offline: boolean) => void;
    /**
     * Update the view mode.
     */
    setViewMode: (mode: ResonanceViewMode) => void;

    /**
     * Update the timeline focus.
     */
    setTimelineFocus: (focus: string) => void;

    /**
     * Derived helper: Is the view currently in the past?
     */


    isPast: () => boolean;

}

const getTodayString = (): string => {
    const date = new Date().toISOString().split('T')[0];
    return date || ''; // Ensure it's never undefined
};

/**
 * useResonanceStore
 * 
 * The Metacognitive Pulse of the application. 
 * Orchestrates temporal continuity across all modules.
 */
export const useResonanceStore = create<ResonanceState>((set, get) => ({
    resonanceDate: getTodayString(),
    intensity: 1.0,
    phase: 'present',
    viewScale: 'day',
    viewMode: 'spotlight',
    timelineFocus: 'all',
    isOffline: false,


    
    setResonanceDate: (date) => {

        const today = getTodayString();
        if (!today) return; // Safety guard
        let phase: ResonancePhase = 'present';
        
        if (date < today) {
            phase = 'past';
        } else if (date > today) {
            phase = 'future';
        }
        
        set({ 
            resonanceDate: date,
            phase,
            // Automatically dip intensity during transitions for a "breathing" effect
            intensity: 0.8 
        });
        
        // Return to full intensity after a brief "resonance lock"
        setTimeout(() => get().setIntensity(1.0), 300);
    },

    
    setIntensity: (value) => set({ intensity: Math.max(0, Math.min(1, value)) }),
    
    resetPulse: () => set({ 
        resonanceDate: getTodayString(),
        phase: 'present',
        intensity: 1.0,
        viewScale: 'day'
    }),
    
    setScale: (scale) => set({ viewScale: scale }),

    setViewMode: (mode) => set({ viewMode: mode }),

    setTimelineFocus: (focus) => set({ timelineFocus: focus }),

    setOffline: (offline) => set({ isOffline: offline }),


    
    isPast: () => get().phase === 'past',
}));

