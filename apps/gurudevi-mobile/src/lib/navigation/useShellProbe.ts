import { trackEvent } from '@repo/core/monitoring';
import { useVergerSnapshot } from '@repo/verger-react';
import { useCallback, useEffect, useRef } from 'react';
import {
  addSample,
  addSwitch,
  readStats,
  type ShellStats,
  summarize,
  writeStats,
} from './shellMetrics';
import type { ShellVariantChoice } from './shellVariant';

const FLUSH_MS = 15_000;
const REPORT_EVERY_MS = 5 * 60_000;

/**
 * Measures the shell on screen: time in each verger state and tab-switch latency, saved per
 * variant on this phone and reported as product events (`shell_variant_exposed`,
 * `shell_tab_switch`, `shell_variant_health`) for comparing installs.
 *
 * Returns `markTabPress`, to be called when a tab is pressed; the switch is timed to the first
 * frame after the route changes (`pathname`).
 */
export function useShellProbe(choice: ShellVariantChoice, pathname: string) {
  const { variant } = choice;
  const snapshot = useVergerSnapshot();
  const stats = useRef<ShellStats>(readStats(variant));
  const last = useRef<{ at: number; frame: string; memory: string } | null>(null);
  const pending = useRef<{ tab: string; at: number } | null>(null);
  const reportedAt = useRef(0);

  // One exposure per mount of the shell, with how the variant was chosen.
  useEffect(() => {
    const saved = readStats(variant);
    stats.current = { ...saved, launches: saved.launches + 1 };
    writeStats(variant, stats.current);
    trackEvent('shell_variant_exposed', {
      variant,
      reason: choice.reason,
      bucket: choice.bucket,
    });
    reportedAt.current = stats.current.sampleMs;
    const timer = setInterval(() => writeStats(variant, stats.current), FLUSH_MS);
    return () => {
      clearInterval(timer);
      writeStats(variant, stats.current);
    };
  }, [variant, choice.reason, choice.bucket]);

  // Attribute the time since the last snapshot to the state it reported.
  useEffect(() => {
    if (!snapshot) return;
    const now = Date.now();
    const prev = last.current;
    if (prev) stats.current = addSample(stats.current, prev.frame, prev.memory, now - prev.at);
    last.current = { at: now, frame: snapshot.frameState, memory: snapshot.memory };
    if (stats.current.sampleMs - reportedAt.current >= REPORT_EVERY_MS) {
      reportedAt.current = stats.current.sampleMs;
      trackEvent('shell_variant_health', {
        variant,
        capacity: snapshot.capacityClass,
        ...summarize(stats.current),
      });
    }
  }, [snapshot, variant]);

  // A tab switch ends at the first frame drawn after the route changed.
  useEffect(() => {
    const press = pending.current;
    if (!press) return;
    pending.current = null;
    // A press on the tab already open changes no route; a stale press is not a switch.
    if (performance.now() - press.at > 2000) return;
    const id = requestAnimationFrame(() => {
      const ms = performance.now() - press.at;
      stats.current = addSwitch(stats.current, ms);
      trackEvent('shell_tab_switch', { variant, tab: press.tab, ms: Math.round(ms) });
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, variant]);

  return useCallback((tab: string) => {
    pending.current = { tab, at: performance.now() };
  }, []);
}
