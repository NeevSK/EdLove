import { type ComponentRef, useEffect, useRef } from 'react';
import { Pressable, Text as RNText, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { alpha } from '../../../theme/color';
import type { AppHeaderContract, HeaderAction, KitIconProps } from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { useLivingStyle, useWorldMotion } from '../../../theme/native/motion';
import {
  edgeStyle,
  glowStyle,
  radiusStyle,
  shadowStyle,
  typeStyle,
} from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { gapFor } from '../../../tokens/space';
import { ChipPaint, chipFrame } from '../Chip/Chip';
import { IconButton } from '../IconButton/IconButton';
import { Avatar } from '../Status/Status';

/** The default glyphs for the leading control when the screen passes none. */
function Chevron({ size = 22, color }: KitIconProps) {
  return (
    <RNText style={{ fontSize: size, lineHeight: size + 2, color }} aria-hidden>
      ‹
    </RNText>
  );
}
function Lines({ size = 22, color }: KitIconProps) {
  return (
    <RNText style={{ fontSize: size * 0.9, lineHeight: size + 2, color }} aria-hidden>
      ≡
    </RNText>
  );
}

export interface AppHeaderProps extends AppHeaderContract {
  /** Glyphs for back and menu; the app passes its icon set. */
  icons?: { back?: HeaderAction['icon']; menu?: HeaderAction['icon'] };
}

/** An action with its count or dot, the mark said as part of its name. */
function Action({ action }: { action: HeaderAction }) {
  const { world, language } = useWorldContext();
  const t = world.tokens;
  const name =
    action.badge !== undefined && action.badgeLabel
      ? `${action.label}, ${action.badgeLabel}`
      : action.label;
  const fill =
    action.badgeTone === 'danger' ? t.danger : action.badgeTone === 'quiet' ? t.inkFaint : t.lamp;
  const ink = action.badgeTone === 'danger' ? t.onDanger : t.onLamp;
  return (
    <View style={styles.action}>
      <IconButton
        icon={action.icon}
        label={name}
        variant="quiet"
        onPress={action.onPress}
        accessibilityState={
          action.expanded === undefined ? undefined : { expanded: action.expanded }
        }
      />
      {action.badge === 'dot' ? (
        <View
          pointerEvents="none"
          style={[
            styles.dot,
            { backgroundColor: fill, borderColor: t.ground },
            action.badgeTone === 'lamp' || action.badgeTone === undefined
              ? glowStyle(world.recipes.row.signal.glow)
              : null,
          ]}
        />
      ) : action.badge !== undefined && action.badge > 0 ? (
        <View
          pointerEvents="none"
          style={[styles.count, { backgroundColor: fill, borderColor: t.ground }]}
        >
          <RNText
            style={[
              typeStyle(world.recipes.text.label, language, world, 10),
              { color: ink, textTransform: 'none' },
            ]}
          >
            {action.badge > 9 ? '9+' : action.badge}
          </RNText>
        </View>
      ) : null}
    </View>
  );
}

/**
 * The header every screen shares. Placement is the app's own: the leading
 * control and identity on the left, actions on the right, search opening
 * underneath. It lifts with a gliding hairline when content scrolls under it.
 * Safe areas and any scene behind it belong to the screen frame.
 */
export function AppHeader({
  title,
  eyebrow,
  leading,
  avatar,
  perspective,
  actions = [],
  search,
  trailing,
  raised = false,
  ruled = false,
  compact = false,
  icons,
}: AppHeaderProps) {
  const { world, language } = useWorldContext();
  const { animates, duration } = useWorldMotion();
  const feedback = useFeedback();
  const t = world.tokens;
  const chip = world.recipes.chip;
  const edge = useLivingStyle({ borderBottomColor: raised || ruled ? t.line : alpha(t.line, 0) });
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  useEffect(() => {
    if (search?.open) input.current?.focus();
  }, [search?.open]);

  const titleStyle = typeStyle(world.recipes.text.title, language, world, compact ? 17 : undefined);

  return (
    <Animated.View
      style={[
        styles.header,
        {
          gap: compact ? 6 : gapFor('inside') + 2,
          paddingVertical: compact ? 6 : 10,
          borderBottomWidth: world.definition.style.lineWeight,
        },
        edge,
        raised ? shadowStyle(world.recipes.surface.raised.shadow) : null,
      ]}
    >
      <View style={[styles.row, { gap: gapFor('inside') }]}>
        {leading ? (
          <IconButton
            icon={leading.kind === 'back' ? (icons?.back ?? Chevron) : (icons?.menu ?? Lines)}
            label={leading.label}
            variant="quiet"
            onPress={leading.onPress}
          />
        ) : null}
        {avatar ? (
          <Pressable
            role="button"
            accessibilityLabel={avatar.label}
            hitSlop={6}
            onPress={() => {
              feedback('press');
              avatar.onPress();
            }}
          >
            <Avatar name={avatar.name} src={avatar.src} size="sm" />
          </Pressable>
        ) : null}
        <View style={styles.identity}>
          {eyebrow && !compact ? (
            <RNText numberOfLines={1} style={typeStyle(world.recipes.text.label, language, world)}>
              {eyebrow}
            </RNText>
          ) : null}
          {perspective ? (
            <Pressable
              role="button"
              accessibilityLabel={perspective.label}
              accessibilityHint={perspective.switchLabel}
              disabled={!perspective.onPress}
              onPress={() => {
                feedback('select');
                perspective.onPress?.();
              }}
              style={[chipFrame(chip, chip.rest), styles.pill]}
            >
              <ChipPaint recipe={chip} selected={false} />
              <RNText
                numberOfLines={1}
                style={[typeStyle(chip.label, language, world), { color: chip.rest.ink }]}
              >
                {perspective.label}
              </RNText>
              {perspective.onPress ? (
                <RNText aria-hidden style={{ color: t.inkSoft }}>
                  ▾
                </RNText>
              ) : null}
            </Pressable>
          ) : (
            <RNText accessibilityRole="header" numberOfLines={1} style={titleStyle}>
              {title}
            </RNText>
          )}
        </View>
        {actions.length > 0 || trailing ? (
          <View style={[styles.row, { gap: 4 }]}>
            {actions.map((a) => (
              <Action key={a.key} action={a} />
            ))}
            {trailing}
          </View>
        ) : null}
      </View>
      {search?.open ? (
        <Animated.View
          entering={animates ? FadeIn.duration(duration.micro) : undefined}
          exiting={animates ? FadeOut.duration(duration.micro) : undefined}
        >
          <TextInput
            ref={input}
            accessibilityLabel={search.label}
            placeholder={search.placeholder}
            placeholderTextColor={world.recipes.field.placeholder.color}
            value={search.value}
            onChangeText={search.onChange}
            returnKeyType="search"
            style={[
              typeStyle(world.recipes.field.value, language, world, 16),
              styles.search,
              { backgroundColor: t.sunken, color: t.ink },
              radiusStyle(world.recipes.field.radius),
              edgeStyle(world.recipes.field.states.rest.edge),
            ]}
          />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  identity: { flex: 1, gap: 2, minWidth: 0 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  action: { position: 'relative' },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  count: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: { minHeight: 44, paddingHorizontal: 14, paddingVertical: 10 },
});
