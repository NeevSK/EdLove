import { type ComponentRef, type Ref, useEffect, useId, useRef, useState } from 'react';
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
import {
  closeKeypad,
  echoTyping,
  openKeypad,
  setTypingFocus,
  updateKeypadValue,
} from '../Keyboard/focus';

export interface TextFieldProps extends FieldContract, Omit<TextInputProps, 'style' | 'editable'> {
  disabled?: boolean;
  ref?: Ref<ComponentRef<typeof TextInput>>;
  /**
   * Use the app's own keypad (marks, PINs, amounts) instead of the phone's keyboard: a flat pad
   * upright, a side panel by the chosen hand when the phone is on its side.
   */
  keypad?: 'number' | 'decimal';
}

/**
 * A labelled text input. In most worlds it is a written line (an underline
 * and serif ink), in some a soft box; the contract is the same.
 *
 * While it has focus it tells the typing bar (and the keypad) its name and value, so a phone held
 * sideways, where the keyboard hides most of the screen, still shows what is being typed. Android's
 * full-screen landscape edit box is turned off for the same reason.
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
  keypad,
  onChangeText,
  secureTextEntry,
  maxLength,
  ...rest
}: TextFieldProps) {
  const { world, language } = useWorldContext();
  const r = world.recipes.field;
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const setRefs = (node: ComponentRef<typeof TextInput> | null) => {
    inputRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as { current: ComponentRef<typeof TextInput> | null }).current = node;
  };
  // Keep the echo and the keypad in step with the value the screen holds.
  useEffect(() => {
    if (!focused) return;
    echoTyping(label, value ?? '');
    if (keypad) updateKeypadValue(value ?? '');
  }, [focused, keypad, label, value]);
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
          ref={setRefs}
          accessibilityLabel={label}
          accessibilityLabelledBy={`${nativeId}-label`}
          accessibilityHint={error ?? hint}
          accessibilityState={{ disabled }}
          editable={!disabled}
          value={value}
          multiline={multiline}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          placeholderTextColor={r.placeholder.color}
          // The world stays in view while typing sideways; the typing bar echoes the words.
          disableFullscreenUI
          showSoftInputOnFocus={keypad ? false : undefined}
          onChangeText={onChangeText}
          onFocus={(e: TextInputFocusEvent) => {
            setFocused(true);
            setTypingFocus({ label, value: value ?? '', secret: secureTextEntry });
            if (keypad) {
              openKeypad({
                label,
                value: value ?? '',
                secret: secureTextEntry,
                kind: keypad,
                maxLength,
                onChange: (next) => onChangeText?.(next),
                onDone: () => inputRef.current?.blur(),
              });
            }
            onFocus?.(e);
          }}
          onBlur={(e: TextInputFocusEvent) => {
            setFocused(false);
            setTypingFocus(null);
            if (keypad) closeKeypad(label);
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
