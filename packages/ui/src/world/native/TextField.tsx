import { type ComponentRef, type Ref, useId, useState } from 'react';
import {
  Text as RNText,
  TextInput,
  type TextInputFocusEvent,
  type TextInputProps,
  View,
} from 'react-native';
import type { FieldState } from '../types';
import { glowStyle, radiusStyle, typeStyle } from './style';
import { useWorldContext } from './WorldContext';

export interface TextFieldProps extends Omit<TextInputProps, 'style' | 'editable'> {
  /** Always visible above the field, and the field's accessible name. */
  label: string;
  /** Quiet help under the field. */
  hint?: string;
  /** When set, the field shows its error state and this message, and announces it. */
  error?: string;
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
  const nativeId = useId();

  const state: FieldState = disabled ? 'disabled' : error ? 'error' : focused ? 'focus' : 'rest';
  const s = r.states[state];
  const empty = value === undefined || value === '';
  const lineStyle =
    r.form === 'underline'
      ? { borderBottomWidth: s.edge.width, borderBottomColor: s.edge.color }
      : { borderWidth: s.edge.width, borderColor: s.edge.color, ...radiusStyle(r.radius) };

  return (
    <View style={{ gap: 6 }}>
      <RNText nativeID={`${nativeId}-label`} style={typeStyle(r.label, language)}>
        {label}
      </RNText>
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
          typeStyle(r.value, language),
          empty && r.placeholder.italic && language === 'en' ? { fontStyle: 'italic' } : null,
          {
            minHeight: r.minHeight,
            paddingHorizontal: r.paddingX,
            paddingVertical: 6,
            backgroundColor: r.fill ?? undefined,
            opacity: disabled ? 0.6 : 1,
            textAlignVertical: multiline ? 'top' : 'center',
          },
          lineStyle,
          glowStyle(s.glow),
        ]}
      />
      {error ? (
        <RNText
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={typeStyle(r.error, language)}
        >
          {error}
        </RNText>
      ) : hint ? (
        <RNText style={typeStyle(r.hint, language)}>{hint}</RNText>
      ) : null}
    </View>
  );
}
