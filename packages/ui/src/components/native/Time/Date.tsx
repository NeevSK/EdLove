import { useState } from 'react';
import {
  Pressable,
  Text as RNText,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import type { DateContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { useWorldContext } from '../../../theme/native/WorldContext';
import {
  dayIntent,
  formatDay,
  parseCivilDate,
  shiftCivilDate,
  toIsoDate,
  withinRange,
} from '../../shared/time';
import { Sheet } from '../Sheet/Sheet';
import { MonthGrid } from './MonthGrid';
import { useTimeTone, useTimeWords } from './words';

export interface DateProps extends DateContract {
  style?: StyleProp<ViewStyle>;
}

/**
 * Canonical Native Date Component
 * Adapts across 4 continuous form factors:
 * - 'nano': Ultra-compact single-day badge (Month short + Day number)
 * - 'compact': Content-width capsule with micro-steppers (‹ Nov 01 ›)
 * - 'medium': Single-row adaptive bar
 * - 'full': Inverted hierarchy floor bar with top steppers + bottom Past/Today/Future switchboard
 */
export function Date({
  date,
  onChange,
  formFactor = 'compact',
  dateLabel,
  today: fixedToday,
  min,
  max,
  disabled,
  locale,
  labels,
  style,
}: DateProps) {
  const { world } = useWorldContext();
  const feedback = useFeedback();
  const { loc, l } = useTimeWords(locale, labels) as unknown as { loc: string; l: Record<string, string> };
  const [sheetOpen, setSheetOpen] = useState(false);

  const todayDateObj = typeof fixedToday === 'string' ? parseCivilDate(fixedToday) : (fixedToday ?? new globalThis.Date());
  const todayIso = toIsoDate(todayDateObj);
  const activeDate = date || todayIso;
  const intent = dayIntent(activeDate, todayDateObj);
  const tone = useTimeTone(intent);
  const lamp = world.tokens.lamp;
  const onLamp = world.tokens.onLamp;
  const surface = world.tokens.raised;
  const line = world.tokens.line;
  const ink = world.tokens.ink;
  const inkSoft = world.tokens.inkSoft;

  const parsed = parseCivilDate(activeDate);
  const shortDate = formatDay(activeDate, loc, 'short');
  const weekdayShort = new Intl.DateTimeFormat(loc, { weekday: 'short' }).format(parsed).slice(0, 2);
  const dayNumber = activeDate.slice(8, 10);

  const handleStep = (direction: -1 | 1) => {
    if (disabled) return;
    const next = shiftCivilDate(activeDate, direction);
    if (!withinRange(next, min, max)) return;
    feedback('step');
    onChange?.(next);
  };

  const handleSelectDate = (next: string) => {
    feedback('select');
    onChange?.(next);
    setSheetOpen(false);
  };

  return (
    <View style={[styles.root, style]}>
      {/* 0. NANO FORM FACTOR */}
      {formFactor === 'nano' && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${shortDate}. Mode: ${intent}. Double tap to open calendar`}
          onPress={() => setSheetOpen(true)}
          style={({ pressed }) => [
            styles.nanoBadge,
            { backgroundColor: surface, borderColor: line, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <View style={[styles.nanoMonthBar, { backgroundColor: lamp }]}>
            <RNText style={[styles.nanoMonthText, { color: onLamp }]}>{weekdayShort}</RNText>
          </View>
          <RNText style={[styles.nanoDayText, { color: ink }]}>{dayNumber}</RNText>
        </Pressable>
      )}

      {/* 1. COMPACT CAPSULE (Recommended default on phone screens) */}
      {formFactor === 'compact' && (
        <View style={[styles.compactCapsule, { backgroundColor: surface, borderColor: line }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous day"
            disabled={disabled || !withinRange(shiftCivilDate(activeDate, -1), min, max)}
            onPress={() => handleStep(-1)}
            style={({ pressed }) => [styles.compactStepBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <RNText style={[styles.compactChevronText, { color: lamp }]}>‹</RNText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${shortDate}. Tap to choose date`}
            onPress={() => setSheetOpen(true)}
            style={({ pressed }) => [styles.compactDateBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={[styles.intentPip, { backgroundColor: lamp }]} />
            <RNText style={[styles.compactDateText, { color: ink }]}>{dateLabel ?? shortDate}</RNText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next day"
            disabled={disabled || !withinRange(shiftCivilDate(activeDate, 1), min, max)}
            onPress={() => handleStep(1)}
            style={({ pressed }) => [styles.compactStepBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <RNText style={[styles.compactChevronText, { color: lamp }]}>›</RNText>
          </Pressable>
        </View>
      )}

      {/* 2. MEDIUM & 3. FULL (Adaptive with Calendar Svg & Switchboard) */}
      {(formFactor === 'medium' || formFactor === 'full' || formFactor === 'expandable') && (
        <View style={[styles.fullContainer, { backgroundColor: surface, borderColor: line }]}>
          {/* Top Row: Chevrons + Date + Calendar Svg */}
          <View style={styles.fullTopRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous day"
              onPress={() => handleStep(-1)}
              style={({ pressed }) => [styles.compactStepBtn, { opacity: pressed ? 0.6 : 1 }]}
            >
              <RNText style={[styles.compactChevronText, { color: lamp }]}>‹</RNText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => setSheetOpen(true)}
              style={styles.fullDateGroup}
            >
              <RNText style={[styles.fullDateHeading, { color: ink }]}>{dateLabel ?? shortDate}</RNText>
              <View style={[styles.calendarSvgBtn, { borderColor: line }]}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Rect x="3" y="4" width="18" height="18" rx="2" stroke={lamp} strokeWidth="2" />
                  <Line x1="16" y1="2" x2="16" y2="6" stroke={lamp} strokeWidth="2" />
                  <Line x1="8" y1="2" x2="8" y2="6" stroke={lamp} strokeWidth="2" />
                  <Line x1="3" y1="10" x2="21" y2="10" stroke={lamp} strokeWidth="2" />
                  <Circle cx="8" cy="14" r="1.5" fill={lamp} />
                  <Circle cx="12" cy="14" r="1.5" fill={lamp} />
                  <Circle cx="16" cy="14" r="1.5" fill={lamp} />
                </Svg>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next day"
              onPress={() => handleStep(1)}
              style={({ pressed }) => [styles.compactStepBtn, { opacity: pressed ? 0.6 : 1 }]}
            >
              <RNText style={[styles.compactChevronText, { color: lamp }]}>›</RNText>
            </Pressable>
          </View>

          {/* Bottom Switchboard for Full Mode: Past (left), Today (center), Future (right) */}
          {formFactor === 'full' && (
            <View style={[styles.intentSwitchboard, { borderColor: line }]}>
              {/* Past */}
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  if (activeDate >= todayIso) handleSelectDate(shiftCivilDate(todayIso, -1));
                }}
                style={[
                  styles.intentTab,
                  intent === 'review' && { backgroundColor: lamp },
                ]}
              >
                <RNText style={[styles.intentText, { color: intent === 'review' ? onLamp : inkSoft }]}>
                  « Past
                </RNText>
              </Pressable>

              {/* Today */}
              <Pressable
                accessibilityRole="button"
                onPress={() => handleSelectDate(todayIso)}
                style={[
                  styles.intentTab,
                  intent === 'current' && { backgroundColor: lamp },
                ]}
              >
                <RNText style={[styles.intentText, { color: intent === 'current' ? onLamp : inkSoft }]}>
                  Today
                </RNText>
              </Pressable>

              {/* Future */}
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  if (activeDate <= todayIso) handleSelectDate(shiftCivilDate(todayIso, 1));
                }}
                style={[
                  styles.intentTab,
                  intent === 'plan' && { backgroundColor: lamp },
                ]}
              >
                <RNText style={[styles.intentText, { color: intent === 'plan' ? onLamp : inkSoft }]}>
                  Future »
                </RNText>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {/* Fluid Native Bottom Sheet for Calendar Selection */}
      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={shortDate}
      >
        <MonthGrid
          label={l.month ?? 'Month'}
          value={activeDate}
          today={todayDateObj}
          min={min}
          max={max}
          locale={loc}
          onChange={handleSelectDate}
        />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
  },
  nanoBadge: {
    width: 36,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  nanoMonthBar: {
    width: '100%',
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nanoMonthText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  nanoDayText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  compactCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 8,
  },
  compactStepBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactChevronText: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 20,
  },
  compactDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  intentPip: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  compactDateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  fullContainer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    gap: 8,
    minWidth: 260,
  },
  fullTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fullDateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fullDateHeading: {
    fontSize: 14,
    fontWeight: '700',
  },
  calendarSvgBtn: {
    padding: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  intentSwitchboard: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 2,
  },
  intentTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intentText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
