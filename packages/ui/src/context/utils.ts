import type { TemporalPhase } from './types';

/**
 * Determines the temporal phase based on current time
 * - Predawn:   4 AM - 6 AM  (dark)
 * - Dawn:      6 AM - 9 AM  (light)
 * - Morning:   9 AM - 12 PM (light)
 * - Afternoon: 12 PM - 5 PM (light)
 * - Dusk:      5 PM - 8 PM  (dark)
 * - Night:     8 PM - 4 AM  (dark, wraps midnight)
 */
export function getTemporalPhase(): TemporalPhase {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 6) return 'predawn';
  if (hour >= 6 && hour < 9) return 'dawn';
  if (hour >= 9 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
}

/**
 * Determines if current temporal phase should use dark theme
 */
export function shouldUseDarkTheme(phase: TemporalPhase): boolean {
  return phase === 'predawn' || phase === 'dusk' || phase === 'night';
  // dawn, morning, afternoon → light world
}
