import { useEffect, useState } from 'react';
import { AppState, Text as RNText } from 'react-native';
import type { KitIconProps, TimeIntent, TimeLabels } from '../../../theme/contracts';
import { useWorldContext } from '../../../theme/native/WorldContext';
import type { TimeTone } from '../../../theme/types';
import { localeOf, refreshAfter, TIME_ENGLISH } from '../../shared/time';

/** The locale and words every time piece speaks with. */
export function useTimeWords(locale?: string, labels?: Partial<TimeLabels>) {
  const { language } = useWorldContext();
  return { locale: locale ?? localeOf(language), l: { ...TIME_ENGLISH, ...labels } };
}

/** The world's drawing for past, today or ahead. */
export function useTimeTone(intent: TimeIntent): TimeTone {
  const r = useWorldContext().world.recipes.time;
  return intent === 'review' ? r.past : intent === 'plan' ? r.future : r.today;
}

/**
 * Now, kept current only as often as the moment needs (every 30 s near now,
 * hourly far away) and only while the app is in front.
 */
export function useNow(fixed: Date | undefined, around: Date | null): Date {
  const [now, setNow] = useState(() => fixed ?? new Date());
  const [active, setActive] = useState(AppState.currentState !== 'background');
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      setActive(s === 'active');
      if (s === 'active') setNow(new Date());
    });
    return () => sub.remove();
  }, []);
  const at = around?.getTime();
  useEffect(() => {
    if (fixed || !active || at === undefined || Number.isNaN(at)) return;
    const id = setTimeout(() => setNow(new Date()), refreshAfter(new Date(at), now));
    return () => clearTimeout(id);
  }, [fixed, active, at, now]);
  return fixed ?? now;
}

/** Kit arrows are drawn as type so they take the world's ink and need no icon set. */
export function Previous({ size = 20, color }: KitIconProps) {
  return <RNText style={{ fontSize: size, lineHeight: size + 2, color }}>‹</RNText>;
}

export function Next({ size = 20, color }: KitIconProps) {
  return <RNText style={{ fontSize: size, lineHeight: size + 2, color }}>›</RNText>;
}
