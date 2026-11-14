import { useEffect, useState } from 'react';
import { Image, Text as RNText, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { AvatarContract, BadgeContract, ProgressContract } from '../../../theme/contracts';
import { useWorldMotion } from '../../../theme/native/motion';
import { edgeStyle, radiusStyle, typeStyle } from '../../../theme/native/style';
import { useWorld, useWorldContext } from '../../../theme/native/WorldContext';
import { initialsOf } from '../../shared/initials';

export interface ProgressProps extends ProgressContract {
  style?: StyleProp<ViewStyle>;
}

/** How far something has got, in the world's lamp on its sunken track. */
export function Progress({ value, label, style }: ProgressProps) {
  const r = useWorld().recipes.status.progress;
  const { animates } = useWorldMotion();
  const sweep = useSharedValue(0);
  const known = value !== undefined;
  const now = known ? Math.round(Math.min(1, Math.max(0, value)) * 100) : undefined;

  useEffect(() => {
    if (known || !animates) {
      sweep.set(0);
      return;
    }
    sweep.set(withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }), -1, false));
    return () => cancelAnimation(sweep);
  }, [known, animates, sweep]);

  const moving = useAnimatedStyle(() => ({ left: `${sweep.get() * 70}%` }));

  return (
    <View
      accessible
      role="progressbar"
      accessibilityLabel={label}
      accessibilityValue={known ? { min: 0, max: 100, now } : undefined}
      aria-busy={!known}
      style={[{ height: r.height, borderRadius: r.height / 2, backgroundColor: r.track, overflow: 'hidden' }, style]}
    >
      {known ? (
        <View style={{ width: `${now}%`, height: '100%', backgroundColor: r.fill, borderRadius: r.height / 2 }} />
      ) : (
        <Animated.View
          style={[{ position: 'absolute', width: '30%', height: '100%', backgroundColor: r.fill, borderRadius: r.height / 2 }, moving]}
        />
      )}
    </View>
  );
}

export interface BadgeProps extends BadgeContract {
  style?: StyleProp<ViewStyle>;
}

/** A short status or count ("New", "3"). Not interactive. */
export function Badge({ label, tone = 'neutral', style }: BadgeProps) {
  const { world, language } = useWorldContext();
  const s = world.recipes.status;
  const b = s.badge[tone];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: b.fill },
        radiusStyle(s.badgeRadius),
        b.edge ? edgeStyle(b.edge) : null,
        style,
      ]}
    >
      <RNText numberOfLines={1} style={[typeStyle(world.recipes.text.caption, language, world), { color: b.ink }]}>
        {label}
      </RNText>
    </View>
  );
}

const AVATAR = { sm: 28, md: 40, lg: 64 } as const;

export interface AvatarProps extends AvatarContract {
  style?: StyleProp<ViewStyle>;
}

/** A person: their photo, or their initials on the world's paper with its ornament ring. */
export function Avatar({ name, src, size = 'md', style }: AvatarProps) {
  const { world, language } = useWorldContext();
  const a = world.recipes.status.avatar;
  const d = AVATAR[size];
  const [failed, setFailed] = useState(false);
  const photo = src && !failed;

  return (
    <View
      accessible
      role="img"
      accessibilityLabel={name}
      style={[
        styles.avatar,
        { width: d, height: d, borderRadius: d / 2, backgroundColor: a.fill },
        edgeStyle(a.edge),
        style,
      ]}
    >
      {photo ? (
        <Image source={{ uri: src }} onError={() => setFailed(true)} style={StyleSheet.absoluteFill} />
      ) : (
        <RNText
          style={[
            typeStyle(world.recipes.text.label, language, world),
            { color: a.ink, fontSize: Math.round(d * 0.38), lineHeight: Math.round(d * 0.5) },
          ]}
        >
          {initialsOf(name)}
        </RNText>
      )}
    </View>
  );
}

/** A quiet line between groups, in the world's hairline. */
export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const line = useWorld().tokens.line;
  return <View role="separator" style={[{ height: StyleSheet.hairlineWidth * 2, backgroundColor: line }, style]} />;
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, minHeight: 20, justifyContent: 'center' },
  avatar: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
