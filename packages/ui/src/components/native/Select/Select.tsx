import { useId, useState } from 'react';
import { Pressable, Text as RNText, type StyleProp, View, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import type { SelectContract } from '../../../theme/contracts';
import { useErrorFeedback } from '../../../theme/native/feedback';
import { glowStyle, radiusStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import type { FieldState } from '../../../theme/types';
import { RadioGroup } from '../Radio/RadioGroup';
import { Sheet } from '../Sheet/Sheet';

export interface SelectProps<V extends string = string> extends SelectContract<V> {
  style?: StyleProp<ViewStyle>;
}

/**
 * Choose one option from a list too long to show. Looks like the world's text
 * field; pressing it opens a sheet of choices, and choosing closes the sheet.
 */
export function Select<V extends string = string>({
  value,
  onChange,
  label,
  options,
  placeholder,
  hint,
  error,
  disabled,
  style,
}: SelectProps<V>) {
  const { world, language } = useWorldContext();
  const r = world.recipes.field;
  const [open, setOpen] = useState(false);
  const shake = useErrorFeedback(error);
  const labelId = useId();
  const chosen = options.find((o) => o.value === value);

  const state: FieldState = disabled ? 'disabled' : error ? 'error' : open ? 'focus' : 'rest';
  const s = r.states[state];
  const lineStyle =
    r.form === 'underline'
      ? { borderBottomWidth: s.edge.width, borderBottomColor: s.edge.color }
      : { borderWidth: s.edge.width, borderColor: s.edge.color, ...radiusStyle(r.radius) };

  return (
    <View style={[{ gap: 6 }, style]}>
      <RNText nativeID={`${labelId}-label`} style={typeStyle(r.label, language, world)}>
        {label}
      </RNText>
      <Animated.View style={shake}>
        <Pressable
          role="combobox"
          aria-expanded={open}
          aria-disabled={disabled}
          accessibilityLabel={label}
          accessibilityLabelledBy={`${labelId}-label`}
          accessibilityValue={{ text: chosen?.label ?? placeholder ?? '' }}
          accessibilityHint={error ?? hint}
          disabled={disabled}
          onPress={() => setOpen(true)}
          style={[
            {
              minHeight: r.minHeight,
              paddingHorizontal: r.paddingX,
              backgroundColor: r.fill ?? undefined,
              opacity: disabled ? 0.6 : 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            },
            lineStyle,
            glowStyle(s.glow),
          ]}
        >
          <RNText
            numberOfLines={1}
            style={[
              typeStyle(r.value, language, world),
              { flex: 1 },
              chosen
                ? null
                : {
                    color: r.placeholder.color,
                    fontStyle: r.placeholder.italic && language === 'en' ? 'italic' : 'normal',
                  },
            ]}
          >
            {chosen?.label ?? placeholder ?? ''}
          </RNText>
          <RNText
            aria-hidden
            style={[typeStyle(r.value, language, world), { color: world.tokens.inkSoft }]}
          >
            ⌄
          </RNText>
        </Pressable>
      </Animated.View>
      {error ? (
        <RNText
          role="alert"
          accessibilityLiveRegion="polite"
          style={typeStyle(r.error, language, world)}
        >
          {error}
        </RNText>
      ) : hint ? (
        <RNText style={typeStyle(r.hint, language, world)}>{hint}</RNText>
      ) : null}
      <Sheet open={open} onClose={() => setOpen(false)} title={label}>
        <RadioGroup
          label={label}
          value={value}
          options={options}
          onChange={(next) => {
            onChange(next);
            setOpen(false);
          }}
        />
      </Sheet>
    </View>
  );
}
