import { create } from 'zustand';

interface TemporalState {
    /**
     * The date the user is currently viewing in the application.
     * Format: YYYY-MM-DD
     */
    viewDate: string;
    
    /**
     * Update the view date (Time Travel)
     */
    setViewDate: (date: string) => void;
    
    /**
     * Reset the view to today's date
     */
    resetToToday: () => void;
    
    /**
     * Whether the user is currently looking at historical data
     */
    isPastView: boolean;
}

const getTodayString = (): string => {
    const date = new Date().toISOString().split('T')[0];
    return date || ''; 
};

export const useTemporalStore = create<TemporalState>((set) => ({
    viewDate: getTodayString(),
    setViewDate: (date) => set({ 
        viewDate: date,
        isPastView: date !== getTodayString()
    }),
    resetToToday: () => set({ 
        viewDate: getTodayString(),
        isPastView: false
    }),
    isPastView: false,
}));
