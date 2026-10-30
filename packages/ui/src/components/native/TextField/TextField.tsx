import { type ComponentRef, type Ref, useId, useState } from 'react';
import {
  Text as RNText,
  TextInput,
  type TextInputFocusEvent,
  type TextInputProps,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import type { FieldContract } from '../../../theme/contracts';
import { useErrorFeedback } from '../../../theme/native/feedback';
import { useLivingStyle } from '../../../theme/native/motion';
import { glowStyle, radiusStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import type { FieldState } from '../../../theme/types';

export interface TextFieldProps extends FieldContract, Omit<TextInputProps, 'style' | 'editable'> {
  disabled?: boolean;
  ref?: Ref<ComponentRef<typeof TextInput>>;
}

/**
 * A labelled text input. In most worlds it is a written line (an underline
 * and serif ink), in some a soft box; the contract is the same.
 */
export function TextField({
  label,
  hint,
  error,
  disabled = false,
  onFocus,
  onBlur,
  value,
  multiline,
  ref,
  ...rest
}: TextFieldProps) {
  const { world, language } = useWorldContext();
  const r = world.recipes.field;
  const [focused, setFocused] = useState(false);
  const shake = useErrorFeedback(error);
  const nativeId = useId();

  const state: FieldState = disabled ? 'disabled' : error ? 'error' : focused ? 'focus' : 'rest';
  const s = r.states[state];
  const empty = value === undefined || value === '';
  // The edge lives on the wrapper so its colour can glide between states.
  const underline = r.form === 'underline';
  const lineWidth = underline
    ? { borderBottomWidth: s.edge.width }
    : { borderWidth: s.edge.width, ...radiusStyle(r.radius) };
  const light = useLivingStyle(
    underline ? { borderBottomColor: s.edge.color } : { borderColor: s.edge.color },
  );

  return (
    <View style={{ gap: 6 }}>
      <RNText nativeID={`${nativeId}-label`} style={typeStyle(r.label, language, world)}>
        {label}
      </RNText>
      <Animated.View style={[lineWidth, light, glowStyle(s.glow), shake]}>
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityLabelledBy={`${nativeId}-label`}
          accessibilityHint={error ?? hint}
          accessibilityState={{ disabled }}
          editable={!disabled}
          value={value}
          multiline={multiline}
          placeholderTextColor={r.placeholder.color}
          onFocus={(e: TextInputFocusEvent) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e: TextInputFocusEvent) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
          style={[
            typeStyle(r.value, language, world),
            empty && r.placeholder.italic && language === 'en' ? { fontStyle: 'italic' } : null,
            {
              minHeight: r.minHeight,
              paddingHorizontal: r.paddingX,
              paddingVertical: 6,
              backgroundColor: r.fill ?? undefined,
              opacity: disabled ? 0.6 : 1,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            underline ? null : radiusStyle(r.radius),
          ]}
        />
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
