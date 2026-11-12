import { Divider } from '@repo/ui/components/native';
import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';
import { View } from 'react-native';

export interface PieceContext {
  t: TFunction;
  /** The person's language, for dates. */
  locale: string;
  /** Opens a piece's own screen when it has one. */
  open?: (pieceId: string) => void;
  /** Whether a piece has a screen to open yet. */
  canOpen: (pieceId: string) => boolean;
}

export const MAX_ROWS = 3;

export function dueText(iso: string | null, locale: string, now = Date.now()): string | null {
  if (!iso) return null;
  const days = Math.round((new Date(iso).getTime() - now) / 86_400_000);
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(days, 'day');
}

export function rows<T>(
  items: readonly T[],
  draw: (item: T) => ReactNode,
  key: (item: T) => string,
) {
  return (
    <View>
      {items.slice(0, MAX_ROWS).map((it, i) => (
        <View key={key(it)}>
          {i > 0 ? <Divider /> : null}
          {draw(it)}
        </View>
      ))}
    </View>
  );
}

/** A fraction as a whole percent in the person's language ("96%"). */
export const percent = (fraction: number, locale: string) =>
  new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(fraction);
