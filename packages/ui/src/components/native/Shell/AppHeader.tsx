import { type ComponentRef, useEffect, useRef } from 'react';
import { Pressable, Text as RNText, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { alpha, mix } from '../../../theme/color';
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
export function HeaderActionButton({ action }: { action: HeaderAction }) {
  const { world, language } = useWorldContext();
  const t = world.tokens;
  const name =
    action.badge !== undefined && action.badgeLabel
      ? `${action.label}, ${action.badgeLabel}`
      : action.label;
  const fill =
    action.badgeTone === 'danger' ? t.danger : action.badgeTone === 'quiet' ? t.inkFaint : t.lamp;
  const ink = action.badgeTone === 'danger' ? t.onDanger : t.onLamp;
  // The app's familiar round well, warming toward the lamp while its toggle is open.
  const well = useLivingStyle({
    backgroundColor: action.expanded ? mix(t.sunken, t.lamp, 0.2) : t.sunken,
  });
  return (
    <Animated.View style={[styles.action, styles.well, well]}>
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
            // A count in a small mark grows a little with large text, then the mark grows.
            maxFontSizeMultiplier={1.3}
            style={[
              typeStyle(world.recipes.text.label, language, world, 10),
              { color: ink, textTransform: 'none' },
            ]}
          >
            {action.badge > 9 ? '9+' : action.badge}
          </RNText>
        </View>
      ) : null}
    </Animated.View>
  );
}

/** The person's photo in the header, opening their profile or "You" sheet. */
export function HeaderAvatar({
  name,
  src,
  label,
  onPress,
  size = 'sm',
}: {
  name: string;
  src?: string;
  label: string;
  onPress: () => void;
  size?: 'sm' | 'md';
}) {
  const feedback = useFeedback();
  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={() => {
        feedback('press');
        onPress();
      }}
    >
      <Avatar name={name} src={src} size={size} />
    </Pressable>
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
  subtitle,
  status,
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

  const pill = perspective ? (
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
  ) : null;
  const heading = (
    <RNText
      accessibilityRole="header"
      numberOfLines={1}
      style={[titleStyle, perspective?.beside ? { flexShrink: 1 } : null]}
    >
      {title}
    </RNText>
  );

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
        {avatar ? <HeaderAvatar {...avatar} /> : null}
        <View style={styles.identity}>
          {status ? (
            <View
              accessibilityLiveRegion="polite"
              accessibilityLabel={status.label}
              accessible
              style={styles.status}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      status.tone === 'offline'
                        ? t.inkFaint
                        : status.tone === 'attention'
                          ? t.danger
                          : t.lamp,
                  },
                ]}
              />
              <RNText
                numberOfLines={1}
                style={[
                  typeStyle(world.recipes.text.caption, language, world),
                  { color: t.inkSoft },
                ]}
              >
                {status.label}
              </RNText>
            </View>
          ) : null}
          {eyebrow && !compact && !status ? (
            <RNText numberOfLines={1} style={typeStyle(world.recipes.text.label, language, world)}>
              {eyebrow}
            </RNText>
          ) : null}
          {perspective && !perspective.beside ? (
            pill
          ) : perspective?.beside ? (
            <View style={styles.besideRow}>
              {heading}
              {pill}
            </View>
          ) : (
            heading
          )}
          {subtitle ? (
            <RNText
              numberOfLines={1}
              style={[typeStyle(world.recipes.text.caption, language, world), { color: t.inkSoft }]}
            >
              {subtitle}
            </RNText>
          ) : null}
        </View>
        {actions.length > 0 || trailing ? (
          <View style={[styles.row, { gap: 4 }]}>
            {actions.map((a) => (
              <HeaderActionButton key={a.key} action={a} />
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
  besideRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 0 },
  action: { position: 'relative' },
  well: { borderRadius: 999 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
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
    minHeight: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: { minHeight: 44, paddingHorizontal: 14, paddingVertical: 10 },
});
