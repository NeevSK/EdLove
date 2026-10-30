import type { ComponentRef, Ref } from 'react';
import {
  Pressable,
  Text as RNText,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import type { RowContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { usePressMotion } from '../../../theme/native/motion';
import { glowStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { ROW_STACKS_BELOW } from '../../../tokens/sizes';
import { gapFor } from '../../../tokens/space';
import { useContainerWidth } from '../Layout/useContainerWidth';

export interface RowProps extends RowContract {
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  ref?: Ref<ComponentRef<typeof View>>;
}

/**
 * One line of a list or a settings group. Dividers come from the Section or
 * Group around it. When its own width is narrow, the detail moves under the
 * label rather than squeezing it; a pressable row brightens while held.
 */
export function Row({
  label,
  detail,
  note,
  accessory,
  onPress,
  signal = false,
  signalLabel,
  chevron,
  accessibilityHint,
  style,
  ref,
}: RowProps) {
  const { world, language } = useWorldContext();
  const r = world.recipes.row;
  const showChevron = chevron ?? (!!onPress && !accessory);
  const feedback = useFeedback();
  const press = usePressMotion();
  const { width, onLayout } = useContainerWidth();
  const stacked = !accessory && !!detail && width < ROW_STACKS_BELOW;

  const body = (
    <>
      <View
        style={
          stacked
            ? { gap: gapFor('inside', 'compact') }
            : {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: r.gap,
              }
        }
      >
        <RNText style={[typeStyle(r.label, language, world), { flexShrink: 1 }]}>{label}</RNText>
        {accessory ??
          (detail || showChevron ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
              {signal ? (
                <View
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  style={[
                    {
                      width: r.signal.size,
                      height: r.signal.size,
                      borderRadius: r.signal.size,
                      backgroundColor: r.signal.color,
                    },
                    glowStyle(r.signal.glow),
                  ]}
                />
              ) : null}
              {detail ? (
                <RNText
                  numberOfLines={2}
                  style={[
                    typeStyle(r.detail, language, world),
                    { textAlign: stacked ? 'left' : 'right', flexShrink: 1 },
                    signal ? { color: world.tokens.lampDeep } : null,
                  ]}
                >
                  {detail}
                </RNText>
              ) : null}
              {showChevron ? (
                <RNText
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                  style={{ color: r.chevron, fontSize: 18, lineHeight: 20 }}
                >
                  ›
                </RNText>
              ) : null}
            </View>
          ) : null)}
      </View>
      {note ? <RNText style={typeStyle(r.note, language, world)}>{note}</RNText> : null}
    </>
  );

  const container: ViewStyle = {
    minHeight: r.minHeight,
    paddingVertical: r.paddingY,
    justifyContent: 'center',
    gap: 3,
  };
  const a11yLabel = [label, detail, signal ? signalLabel : undefined].filter(Boolean).join(', ');

  if (onPress) {
    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        accessibilityHint={accessibilityHint ?? note}
        onPress={onPress}
        onPressIn={() => {
          press.pressIn();
          feedback('press');
        }}
        onPressOut={press.pressOut}
        onLayout={onLayout}
        style={({ pressed }) => [container, pressed ? { opacity: 0.7 } : null, style]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: press.light.color },
            press.light.style,
          ]}
        />
        {body}
      </Pressable>
    );
  }
  return (
    <View ref={ref} onLayout={onLayout} style={[container, style]}>
      {body}
    </View>
  );
}
