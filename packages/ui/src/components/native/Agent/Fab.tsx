import {
  Pressable,
  Text as RNText,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import type { ActionFabContract, FabMenuContract } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { usePressMotion } from '../../../theme/native/motion';
import { glowStyle, shadowStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
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
 * The floating action: one lit control in the world's lamp, pressed with the
 * world's motion and light. A quiet signal marks that something needs the
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
  if (hidden) return null;
  const t = world.tokens;
  const name = signal && signalLabel ? `${label}, ${signalLabel}` : label;
  return (
    <Animated.View style={[press.style, style]}>
      <Pressable
        role="button"
        accessibilityLabel={name}
        onPressIn={() => {
          press.pressIn();
          feedback('press');
        }}
        onPressOut={press.pressOut}
        onPress={onPress}
        style={[
          styles.fab,
          { backgroundColor: t.lamp },
          shadowStyle(world.recipes.surface.raised.shadow),
          glowStyle(world.recipes.button.variants.primary.glow),
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.round,
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
    borderRadius: FAB / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  round: { borderRadius: FAB / 2 },
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
