/**
 * openExternalURL — Platform-safe external link opener
 *
 * On native: uses React Native's `Linking.openURL()` (standard behaviour).
 * On web: uses `window.open(url, '_blank', 'noopener,noreferrer')` so the link
 *         opens in a NEW TAB instead of replacing the running app in the same tab.
 *
 * Usage (replaces all bare `Linking.openURL(url)` calls in shared components):
 *   await openExternalURL('https://example.com');
 */

import { Linking, Platform } from 'react-native';

export async function openExternalURL(url: string): Promise<void> {
    if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
        // If window is undefined (e.g. SSR context), silently skip — no meaningful action possible
        return;
    }
    try {
        await Linking.openURL(url);
    } catch (error) {
        // Propagate so callers can show user feedback if needed
        throw error;
    }
}
