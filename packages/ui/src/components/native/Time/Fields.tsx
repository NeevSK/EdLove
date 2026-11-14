import { useId, useState } from 'react';
import { Pressable, Text as RNText, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import type { DateFieldContract, TimeFieldContract } from '../../../theme/contracts';
import { useErrorFeedback, useFeedback } from '../../../theme/native/feedback';
import { useLivingStyle } from '../../../theme/native/motion';
import { glowStyle, radiusStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import type { FieldState } from '../../../theme/types';
import { formatDay, formatTime, parseTime, toTime } from '../../shared/time';
import { Button } from '../Button/Button';
import { Inline } from '../Layout/Layout';
import { Sheet } from '../Sheet/Sheet';
import { MonthGrid } from './MonthGrid';
import { TimeDial } from './TimeDial';
import { useTimeWords } from './words';

interface PickerFieldProps {
  label: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  shown: string;
  empty: boolean;
  open: boolean;
  onOpen: () => void;
  action: string;
}

/** A field that opens a sheet: drawn like a text field, its edge warming while open. */
function PickerField({
  label,
  hint,
  error,
  disabled,
  shown,
  empty,
  open,
  onOpen,
  action,
}: PickerFieldProps) {
  const { world, language } = useWorldContext();
  const r = world.recipes.field;
  const shake = useErrorFeedback(error);
  const id = useId();
  const state: FieldState = disabled ? 'disabled' : error ? 'error' : open ? 'focus' : 'rest';
  const s = r.states[state];
  const underline = r.form === 'underline';
  const light = useLivingStyle(
    underline ? { borderBottomColor: s.edge.color } : { borderColor: s.edge.color },
  );
  return (
    <View style={styles.field}>
      <RNText nativeID={`${id}-label`} style={typeStyle(r.label, language, world)}>
        {label}
      </RNText>
      <Animated.View
        style={[
          underline
            ? { borderBottomWidth: s.edge.width }
            : { borderWidth: s.edge.width, ...radiusStyle(r.radius) },
          light,
          glowStyle(s.glow),
          shake,
        ]}
      >
        <Pressable
          role="button"
          accessibilityLabel={`${label}, ${shown}`}
          accessibilityHint={error ?? hint ?? action}
          accessibilityState={{ disabled, expanded: open }}
          disabled={disabled}
          onPress={onOpen}
          style={[
            styles.box,
            {
              minHeight: r.minHeight,
              paddingHorizontal: r.paddingX,
              backgroundColor: r.fill ?? undefined,
              opacity: disabled ? 0.6 : 1,
            },
            underline ? null : radiusStyle(r.radius),
          ]}
        >
          <RNText
            style={[
              typeStyle(r.value, language, world),
              empty ? { color: r.placeholder.color } : null,
              empty && r.placeholder.italic && language === 'en' ? { fontStyle: 'italic' } : null,
            ]}
          >
            {shown}
          </RNText>
        </Pressable>
      </Animated.View>
      {error ? (
        <RNText
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={typeStyle(r.error, language, world)}
        >
          {error}
        </RNText>
      ) : hint ? (
        <RNText style={typeStyle(r.hint, language, world)}>{hint}</RNText>
      ) : null}
    </View>
  );
}

export type DateFieldProps = DateFieldContract;

/** A day, chosen from the kit's month in a sheet; the field reads the day in words. */
export function DateField({
  label,
  hint,
  error,
  value,
  onChange,
  min,
  max,
  activity,
  disabled,
  locale,
  labels,
}: DateFieldProps) {
  const { locale: loc, l } = useTimeWords(locale, labels);
  const [open, setOpen] = useState(false);
  return (
    <>
      <PickerField
        label={label}
        hint={hint}
        error={error}
        disabled={disabled}
        shown={value ? formatDay(value, loc, 'long') : l.noDate}
        empty={!value}
        open={open}
        onOpen={() => setOpen(true)}
        action={l.chooseDate}
      />
      <Sheet open={open} onClose={() => setOpen(false)} title={label}>
        <MonthGrid
          label={label}
          value={value}
          onChange={(date) => {
            setOpen(false);
            onChange(date);
          }}
          min={min}
          max={max}
          activity={activity}
          locale={loc}
          labels={labels}
        />
        {value ? (
          <Button
            label={l.clear}
            variant="quiet"
            onPress={() => {
              setOpen(false);
              onChange(null);
            }}
          />
        ) : null}
      </Sheet>
    </>
  );
}

export type TimeFieldProps = TimeFieldContract;

/** A wall-clock time, set on the kit's dial in a sheet; nothing changes until Done. */
export function TimeField({
  label,
  hint,
  error,
  value,
  onChange,
  step = 5,
  min,
  max,
  disabled,
  locale,
  labels,
}: TimeFieldProps) {
  const { locale: loc, l } = useTimeWords(locale, labels);
  const feedback = useFeedback();
  const [open, setOpen] = useState(false);
  const start = () => {
    const now = new Date();
    const at = Math.round((now.getHours() * 60 + now.getMinutes()) / step) * step;
    const lo = parseTime(min) ?? 0;
    const hi = parseTime(max) ?? 24 * 60 - 1;
    return toTime(Math.min(hi, Math.max(lo, at)));
  };
  const [draft, setDraft] = useState(value ?? start());
  return (
    <>
      <PickerField
        label={label}
        hint={hint}
        error={error}
        disabled={disabled}
        shown={value ? formatTime(value, loc) : l.noTime}
        empty={!value}
        open={open}
        onOpen={() => {
          setDraft(value ?? start());
          setOpen(true);
        }}
        action={l.chooseTime}
      />
      <Sheet open={open} onClose={() => setOpen(false)} title={label}>
        <TimeDial
          value={draft}
          onChange={setDraft}
          step={step}
          min={min}
          max={max}
          locale={loc}
          l={l}
        />
        <Inline gap="between" justify="end">
          {value ? (
            <Button
              label={l.clear}
              variant="quiet"
              onPress={() => {
                setOpen(false);
                onChange(null);
              }}
            />
          ) : null}
          <Button
            label={l.done}
            onPress={() => {
              feedback('commit');
              setOpen(false);
              onChange(draft);
            }}
          />
        </Inline>
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  box: { justifyContent: 'center', paddingVertical: 6 },
});
