import type { MoodLog } from '../types';

/** Human-readable labels for mood_score 1–5 (index 0 is unused placeholder). */
export const MOOD_LABELS = ['', 'Depleted', 'Low', 'Steady', 'Energised', 'Vibrant'] as const;

/**
 * CSS colour for each mood_score level 1–5.
 */
export const MOOD_COLORS = [
    '',
    '#EF4444', // ember
    '#F59E0B', // amber-glow
    '#3B82F6', // water
    '#10B981', // moss
    '#8B5CF6', // lotus
] as const;

/** Colours used for energy-forecast bars (same scale, saffron high). */
export const ENERGY_COLORS = [
    '',
    '#EF4444', // ember
    '#F59E0B', // amber-glow
    '#3B82F6', // water
    '#10B981', // moss
    '#FCD34D', // sanctuary-saffron
] as const;

/** Ordered emoji options for the inline mood picker. */
export const MOOD_OPTIONS: { value: MoodLog['mood']; emoji: string; label: string }[] = [
    { value: 'sad', emoji: '😔', label: 'Sad' },
    { value: 'frustrated', emoji: '😤', label: 'Frustrated' },
    { value: 'anxious', emoji: '😰', label: 'Anxious' },
    { value: 'calm', emoji: '😌', label: 'Calm' },
    { value: 'curious', emoji: '🤔', label: 'Curious' },
    { value: 'joyful', emoji: '😊', label: 'Joyful' },
];
