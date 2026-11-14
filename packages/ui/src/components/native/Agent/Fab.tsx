import {
  Pressable,
  Text as RNText,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { ActionFabContract, FabMenuContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { useFocusRing } from '../../../theme/native/focus';
import { usePressMotion, useWorldMotion } from '../../../theme/native/motion';
import { glowStyle, radiusStyle, shadowStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { fitRadius } from '../../../theme/shellMarks';
import { iconSize } from '../../../tokens/sizes';
import { gapFor } from '../../../tokens/space';
import { groupFabActions } from '../../shared/agent';
import { Group } from '../Group/Group';
import { Row } from '../Row/Row';
import { Sheet } from '../Sheet/Sheet';

const FAB = 56;

export interface ActionFabProps extends ActionFabContract {
  /** Where it sits; the screen places it (above tabs, inside safe area). */
  style?: StyleProp<ViewStyle>;
}

/**
 * The floating action: one lit control in the world's lamp and in the world's
 * control shape (Classic's circle, Kele's leaf, Spark's cut corner), pressed with
 * the world's motion and light. A quiet signal marks that something needs the
 * person; its words are part of the name.
 */
export function ActionFab({
  label,
  icon: Glyph,
  onPress,
  signal,
  signalLabel,
  hidden,
  style,
}: ActionFabProps) {
  const { world, language } = useWorldContext();
  const feedback = useFeedback();
  const press = usePressMotion();
  const focusRing = useFocusRing();
  const m = useWorldMotion();
  // Tucked away (reading, typing): it shrinks and slips down, and comes back the world's way.
  const away = useSharedValue(hidden ? 1 : 0);
  useEffect(() => {
    away.set(m.animates ? withTiming(hidden ? 1 : 0, m.timing()) : hidden ? 1 : 0);
  }, [hidden, m, away]);
  const tuck = useAnimatedStyle(() => ({
    opacity: 1 - away.get(),
    transform: [{ translateY: away.get() * 28 }, { scale: 1 - away.get() * 0.4 }],
  }));
  const t = world.tokens;
  const shape = radiusStyle(fitRadius(world.definition.style.corner.control, FAB));
  const name = signal && signalLabel ? `${label}, ${signalLabel}` : label;
  return (
    <Animated.View
      pointerEvents={hidden ? 'none' : 'auto'}
      accessibilityElementsHidden={hidden}
      importantForAccessibility={hidden ? 'no-hide-descendants' : 'auto'}
      style={[style, tuck]}
    >
      <Animated.View style={press.style}>
        <Pressable
          role="button"
          accessibilityLabel={name}
          onFocus={focusRing.onFocus}
          onBlur={focusRing.onBlur}
          onPressIn={() => {
            press.pressIn();
            feedback('press');
          }}
          onPressOut={press.pressOut}
          onPress={onPress}
          style={[
            styles.fab,
            shape,
            { backgroundColor: t.lamp },
            shadowStyle(world.recipes.surface.raised.shadow),
            glowStyle(world.recipes.button.variants.primary.glow),
            focusRing.ring,
          ]}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              shape,
              { backgroundColor: press.light.color },
              press.light.style,
            ]}
          />
          {Glyph ? (
            <Glyph size={iconSize.lg} color={t.onLamp} aria-hidden />
          ) : (
            <RNText
              style={[typeStyle(world.recipes.text.title, language, world), { color: t.onLamp }]}
            >
              +
            </RNText>
          )}
          {signal ? (
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[
                styles.signal,
                { backgroundColor: world.recipes.row.signal.color, borderColor: t.lamp },
                glowStyle(world.recipes.row.signal.glow),
              ]}
            />
          ) : null}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

export type FabMenuProps = FabMenuContract;

/**
 * What the floating action opens: a sheet of named actions, the primary one
 * lit, a destructive one in danger words. Choosing closes the sheet first, so
 * focus returns before the action runs.
 */
export function FabMenu({ open, onClose, label, actions }: FabMenuProps) {
  const { world } = useWorldContext();
  return (
    <Sheet open={open} onClose={onClose} title={label}>
      <View style={{ gap: gapFor('between') }}>
        {groupFabActions(actions).map((section) => (
          <Group key={section.group ?? ''} label={section.group}>
            {section.actions.map((a) => (
              <Row
                key={a.key}
                label={a.label}
                note={a.hint}
                accessory={
                  a.icon ? (
                    <a.icon
                      size={iconSize.md}
                      color={
                        a.tone === 'danger'
                          ? world.tokens.danger
                          : a.tone === 'lamp'
                            ? world.tokens.lampDeep
                            : world.tokens.inkSoft
                      }
                      aria-hidden
                    />
                  ) : undefined
                }
                onPress={() => {
                  onClose();
                  a.onPress();
                }}
              />
            ))}
          </Group>
        ))}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: FAB,
    height: FAB,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signal: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
});
