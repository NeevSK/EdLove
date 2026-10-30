import type { ComponentRef, ReactNode, Ref } from 'react';
import {
  type GestureResponderEvent,
  Pressable,
  type PressableProps,
  Text as RNText,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import type { CardContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { usePressMotion } from '../../../theme/native/motion';
import { radiusStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { iconSize, WIDE_CARD_STACKS_BELOW } from '../../../tokens/sizes';
import { useContainerWidth } from '../Layout/useContainerWidth';
import { InnerFrame, surfaceStyle } from '../Surface/Surface';

export interface CardProps
  extends CardContract,
    Omit<PressableProps, 'children' | 'style' | 'disabled'> {
  style?: StyleProp<ViewStyle>;
  ref?: Ref<ComponentRef<typeof View>>;
}

/** Media sizes in a wide card, by card size. */
const WIDE_MEDIA = { sm: 64, md: 88, lg: 112 } as const;

/**
 * A held thing to open or choose: a lesson, a class, a world. The shape says
 * how media and words share it; a wide card stacks when its space is narrow.
 * Pressable cards feel and light like controls.
 */
export function Card({
  title,
  meta,
  shape = 'tile',
  size = 'md',
  media,
  icon: Glyph,
  selected = false,
  disabled = false,
  onPress,
  onPressIn,
  onPressOut,
  style,
  ref,
  accessibilityHint,
  ...rest
}: CardProps) {
  const { world, language } = useWorldContext();
  const r = world.recipes.card;
  const feedback = useFeedback();
  const press = usePressMotion();
  const { width, onLayout } = useContainerWidth();
  const radius = r.radius[shape];
  const stacked = shape === 'wide' && width < WIDE_CARD_STACKS_BELOW;
  const ink = shape === 'square' && media ? r.veilInk : undefined;

  const words: ReactNode = (
    <View style={{ gap: 2, flexShrink: 1 }}>
      <RNText
        numberOfLines={shape === 'pill' ? 1 : 2}
        style={[typeStyle(r.title, language, world), ink ? { color: ink } : null]}
      >
        {title}
      </RNText>
      {meta && shape !== 'pill' ? (
        <RNText
          numberOfLines={1}
          style={[typeStyle(r.meta, language, world), ink ? { color: ink } : null]}
        >
          {meta}
        </RNText>
      ) : null}
    </View>
  );

  const glyph = Glyph ? (
    <Glyph size={iconSize[size === 'lg' ? 'lg' : 'md']} color={world.tokens.ink} aria-hidden />
  ) : null;

  let body: ReactNode;
  if (shape === 'pill') {
    body = (
      <View style={[styles.row, { gap: r.gap, paddingHorizontal: r.padding * 1.25 }]}>
        {glyph}
        {words}
      </View>
    );
  } else if (shape === 'square') {
    body = (
      <View style={{ aspectRatio: 1 }}>
        {media ? <View style={StyleSheet.absoluteFill}>{media}</View> : null}
        <View
          style={[
            styles.foot,
            { padding: r.padding, gap: r.gap },
            media ? { backgroundColor: r.veil } : null,
          ]}
        >
          {media ? null : glyph}
          {words}
        </View>
      </View>
    );
  } else if (shape === 'wide' && !stacked) {
    body = (
      <View style={[styles.row, { gap: r.gap * 1.5, padding: r.padding }]}>
        {media ? (
          <View
            style={[
              { width: WIDE_MEDIA[size], height: WIDE_MEDIA[size], overflow: 'hidden' },
              radiusStyle(r.radius.tile),
            ]}
          >
            {media}
          </View>
        ) : (
          glyph
        )}
        {words}
      </View>
    );
  } else {
    body = (
      <View>
        {media ? <View style={{ aspectRatio: 4 / 3, overflow: 'hidden' }}>{media}</View> : null}
        <View style={{ padding: r.padding, gap: r.gap }}>
          {media ? null : glyph}
          {words}
        </View>
      </View>
    );
  }

  const shell: StyleProp<ViewStyle> = [
    surfaceStyle(r.surface, true),
    radiusStyle(radius),
    { overflow: 'hidden', minHeight: shape === 'pill' ? 44 : undefined, justifyContent: 'center' },
    disabled ? { opacity: world.recipes.button.disabledOpacity } : null,
  ];
  const ring = selected ? (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        radiusStyle(radius),
        { borderWidth: r.selectedEdge.width, borderColor: r.selectedEdge.color },
      ]}
    />
  ) : null;

  if (!onPress) {
    return (
      <View ref={ref} onLayout={onLayout} style={[shell, style]}>
        <InnerFrame recipe={r.surface} />
        {body}
        {ring}
      </View>
    );
  }

  return (
    <Animated.View
      pointerEvents={disabled ? 'none' : 'box-none'}
      onLayout={onLayout}
      style={[press.style, style]}
    >
      <Pressable
        ref={ref}
        role="button"
        accessibilityLabel={title}
        accessibilityHint={accessibilityHint ?? meta}
        accessibilityState={{ selected, disabled }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={(e: GestureResponderEvent) => {
          press.pressIn();
          feedback('press');
          onPressIn?.(e);
        }}
        onPressOut={(e: GestureResponderEvent) => {
          press.pressOut();
          onPressOut?.(e);
        }}
        style={shell}
        {...rest}
      >
        <InnerFrame recipe={r.surface} />
        {body}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: press.light.color },
            press.light.style,
          ]}
        />
        {ring}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  foot: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
