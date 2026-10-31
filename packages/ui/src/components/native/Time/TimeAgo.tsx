import { useMemo } from 'react';
import { Text as RNText, type StyleProp, type TextStyle } from 'react-native';
import type { TimeAgoContract } from '../../../theme/contracts';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { momentIntent, relativeTime } from '../../shared/time';
import { useNow, useTimeTone, useTimeWords } from './words';

export interface TimeAgoProps extends TimeAgoContract {
  style?: StyleProp<TextStyle>;
}

/**
 * A moment said against now: "5 minutes ago", "yesterday", "in 3 weeks".
 * Readers hear the exact day and time too; the past is said quietly.
 */
export function TimeAgo({ at, now: fixed, exact, locale, labels, style }: TimeAgoProps) {
  const { world, language } = useWorldContext();
  const { locale: loc, l } = useTimeWords(locale, labels);
  const moment = useMemo(() => new Date(at), [at]);
  const valid = !Number.isNaN(moment.getTime());
  const now = useNow(fixed, valid ? moment : null);
  const tone = useTimeTone(valid ? momentIntent(moment, now) : 'current');
  const base = typeStyle(world.recipes.text.caption, language, world);
  if (!valid) return <RNText style={[base, style]}>{l.noTime}</RNText>;
  const words = relativeTime(moment, now, loc);
  const full = new Intl.DateTimeFormat(loc, { dateStyle: 'medium', timeStyle: 'short' }).format(
    moment,
  );
  return (
    <RNText accessibilityLabel={`${words}, ${full}`} style={[base, { color: tone.ink }, style]}>
      {exact ? `${words} · ${full}` : words}
    </RNText>
  );
}
