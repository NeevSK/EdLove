import type { ComponentRef, ReactNode, Ref } from 'react';
import { Pressable, Text as RNText, type StyleProp, View, type ViewStyle } from 'react-native';
import { glowStyle, typeStyle } from './style';
import { useWorldContext } from './WorldContext';

export interface RowProps {
  label: string;
  /** The current value, shown at the end of the row ("Comfortable", "Only here"). */
  detail?: string;
  /** A quiet sentence under the row explaining what the setting means. */
  note?: string;
  /** A control at the end of the row (a switch, a segmented choice). */
  accessory?: ReactNode;
  onPress?: () => void;
  /** This row needs the person: a small lit dot and the value in the lamp colour. */
  signal?: boolean;
  /** Words a screen reader adds when `signal` is on (already translated), e.g. "needs you". */
  signalLabel?: string;
  /** Show the "goes somewhere" mark. Defaults to true for pressable rows without an accessory. */
  chevron?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  ref?: Ref<ComponentRef<typeof View>>;
}

/** One line of a list or a settings group. Dividers come from the Section around it. */
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

  const body = (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: r.gap,
        }}
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
                    { textAlign: 'right', flexShrink: 1 },
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
        style={({ pressed }) => [container, pressed ? { opacity: 0.7 } : null, style]}
      >
        {body}
      </Pressable>
    );
  }
  return (
    <View ref={ref} style={[container, style]}>
      {body}
    </View>
  );
}
