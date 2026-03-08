/**
 * dateTimeUtils.ts — Shared date/time formatting helpers.
 *
 * These utilities were previously copy-pasted in 8+ separate files with
 * slightly inconsistent signatures. Single source of truth: import from `@repo/ui`.
 */

/**
 * Format a native video duration (milliseconds → "M:SS").
 * Used by expo-av VideoPlayerScreen (native).
 *
 * @example formatTimeMs(90500) // "1:30"
 */
export function formatTimeMs(ms: number): string {
    const total = Math.floor(ms / 1000);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Format an HTML5 video duration (seconds → "M:SS").
 * Used by <video> element VideoPlayerScreen.web.tsx.
 *
 * @example formatTimeSecs(90) // "1:30"
 */
export function formatTimeSecs(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * Format an ISO timestamp string to a locale-aware HH:MM string.
 * Used in chat screens (DirectMessage, GroupChat, AIAssistant).
 *
 * @example formatTimestamp('2026-03-08T13:45:00Z') // "1:45 PM"
 */
export function formatTimestamp(iso: string | number): string {
    const d = typeof iso === 'number' ? new Date(iso) : new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format an ISO date string to a short, locale-aware date (e.g. "Mar 8").
 * Used across principal section components (observations, leave, calendar).
 *
 * Returns the original string if parsing fails.
 *
 * @example formatShortDate('2026-03-08') // "Mar 8"
 */
export function formatShortDate(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
        return dateStr;
    }
}
