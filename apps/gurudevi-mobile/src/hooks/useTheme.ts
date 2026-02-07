/**
 * useTheme Hook
 * 
 * Manages app theme (light/dark/auto) with time-based dynamic switching
 * Default: Light theme, but auto mode adjusts based on time of day
 */

import { useEffect, useState } from 'react';
import { useStore, ThemeMode } from '../store/useStore';

interface UseThemeReturn {
    themeMode: ThemeMode;
    isDark: boolean;
    setThemeMode: (mode: ThemeMode) => void;
}

/**
 * Determines if current time should use dark theme
 * Dark mode active between 8 PM and 6 AM (but colors remain muted, not pure dark)
 * Note: Uses device local time, which may vary if user travels across timezones
 */
function shouldUseDarkMode(): boolean {
    const hour = new Date().getHours();
    return hour >= 20 || hour < 6;
}

export function useTheme(): UseThemeReturn {
    const { themeMode, setThemeMode: setStoredThemeMode } = useStore(state => ({
        themeMode: state.themeMode || 'light',
        setThemeMode: state.setThemeMode
    }));

    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Calculate actual theme based on mode
        if (themeMode === 'auto') {
            setIsDark(shouldUseDarkMode());
            
            // Update every minute when in auto mode to catch time changes
            const interval = setInterval(() => {
                setIsDark(shouldUseDarkMode());
            }, 60000); // Check every minute

            return () => clearInterval(interval);
        } else {
            setIsDark(themeMode === 'dark');
        }
    }, [themeMode]);

    return {
        themeMode,
        isDark,
        setThemeMode: setStoredThemeMode
    };
}
