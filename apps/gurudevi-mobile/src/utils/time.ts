/**
 * Time Utilities
 * Time-based helpers for greetings, formatting, and sanctuary time-aware features
 */

import { lotusDeepPink, obsidian, sacredWhite, sanctuarySaffron, shadowViolet, shroud, templeGold } from '@repo/ui/theme';

/**
 * Time of Day Types
 */
export type TimeOfDay = 'dawn' | 'day' | 'evening' | 'night';

/**
 * Get current time of day based on hour
 * dawn: 5am-8am
 * day: 8am-5pm
 * evening: 5pm-8pm
 * night: 8pm-5am
 */
export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();

  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}

/**
 * Get time-appropriate greeting
 * Returns translation key for i18n
 */
export function getGreetingKey(): string {
  const hour = new Date().getHours();

  if (hour < 12) return 'self.goodMorning';
  if (hour < 17) return 'self.goodAfternoon';
  return 'self.goodEvening';
}

/**
 * Format date for display
 * Uses Intl.DateTimeFormat for locale-aware formatting
 */
export function formatDate(date: Date, locale: string = 'en'): string {
  const localeMap: { [key: string]: string } = {
    si: 'si-LK',
    ta: 'ta-LK',
    en: 'en-US',
  };

  const formattedLocale = localeMap[locale] || 'en-US';

  return new Intl.DateTimeFormat(formattedLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date, locale: string = 'en'): string {
  const localeMap: { [key: string]: string } = {
    si: 'si-LK',
    ta: 'ta-LK',
    en: 'en-US',
  };

  const formattedLocale = localeMap[locale] || 'en-US';

  return new Intl.DateTimeFormat(formattedLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
}

/**
 * Get relative time (e.g., "3 days ago", "just now")
 * Returns simple English for v0.1, can be enhanced with i18n later
 */
export function getRelativeTime(date: Date, locale: string = 'en'): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return formatDate(date, locale);
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is this week
 */
export function isThisWeek(date: Date): boolean {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return date >= weekAgo && date <= now;
}

/**
 * Get sanctuary time theme
 * Returns theme hints based on time of day for time-aware UI
 */
export function getSanctuaryTimeTheme(): {
  timeOfDay: TimeOfDay;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  description: string;
  warmth: number; // 0-1, for adjusting color temperature
} {
  const timeOfDay = getTimeOfDay();

  const themes = {
    dawn: {
      timeOfDay: 'dawn' as TimeOfDay,
      primaryColor: templeGold,
      backgroundColor: obsidian,
      textColor: sacredWhite,
      description: 'First light, gentle awakening',
      warmth: 0.3,
    },
    day: {
      timeOfDay: 'day' as TimeOfDay,
      primaryColor: sanctuarySaffron,
      backgroundColor: obsidian,
      textColor: sacredWhite,
      description: 'Full energy, active teaching',
      warmth: 0,
    },
    evening: {
      timeOfDay: 'evening' as TimeOfDay,
      primaryColor: lotusDeepPink,
      backgroundColor: '#2A2318',
      textColor: sacredWhite,
      description: 'Winding down, reflection',
      warmth: 0.5,
    },
    night: {
      timeOfDay: 'night' as TimeOfDay,
      primaryColor: shadowViolet,
      backgroundColor: shroud,
      textColor: sacredWhite,
      description: 'Rest, preparation for tomorrow',
      warmth: 0.8,
    },
  };

  return themes[timeOfDay];
}
