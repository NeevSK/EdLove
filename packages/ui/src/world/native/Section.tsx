import { LinearGradient } from 'expo-linear-gradient';
import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import {
  Text as RNText,
  type StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import { alpha } from '../color';
import type { SectionDensity, SectionRecipe } from '../types';
import { InnerFrame, surfaceStyle } from './Surface';
import { glowStyle, radiusStyle, shadowStyle, typeStyle } from './style';
import { useWorldContext } from './WorldContext';

export interface SectionProps {
  /** Short name of the group. Announced as a heading. */
  title: string;
  /** Optional human sentence that opens a calm section ("What stays with you"). */
  voice?: string;
  /** `dense` for working screens, `calm` for quiet ones. The world picks the boundary for each. */
  density?: SectionDensity;
  /** This group needs the person. Each boundary shows it in its own way (a lit knot, warmer light). */
  signal?: boolean;
  /** Draw the closing rule under the last section of a page (margin boundary). */
  last?: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function withDividers(children: ReactNode, r: SectionRecipe): ReactNode {
  const items = Children.toArray(children).filter(isValidElement);
  if (!r.rowDivider) return items;
  const divider = r.rowDivider;
  return items.map((child, i) => (
    <Fragment key={child.key ?? i}>
      {i > 0 ? <View style={{ height: divider.width, backgroundColor: divider.color }} /> : null}
      {child}
    </Fragment>
  ));
}

/**
 * Holds a group of rows together. The *how* (a margin, a thread, a leaf,
 * a pool of light, a box) belongs to the world; the reading order, heading
 * and content stay identical in every world, so the plain path never changes.
 */
export function Section({
  title,
  voice,
  density = 'dense',
  signal = false,
  last = false,
  children,
  style,
}: SectionProps) {
  const { world, language } = useWorldContext();
  const r = world.recipes.section[density];
  const t = world.tokens;
  const { width } = useWindowDimensions();

  const titleStyle = [
    typeStyle(r.title, language, world),
    signal && r.kind !== 'thread' ? { color: t.lampDeep } : null,
  ];
  const heading = (
    <RNText accessibilityRole="header" style={titleStyle}>
      {title}
    </RNText>
  );
  const voiceLine = voice ? (
    <RNText style={[typeStyle(r.voice, language, world), { marginTop: 2, marginBottom: 10 }]}>
      {voice}
    </RNText>
  ) : null;
  const body = withDividers(children, r);

  switch (r.kind) {
    case 'margin': {
      const side = width >= r.marginMinWidth;
      return (
        <View
          style={[
            {
              paddingVertical: r.paddingY,
              paddingHorizontal: r.paddingX,
              borderTopWidth: r.rule.width,
              borderTopColor: r.rule.color,
              flexDirection: side ? 'row' : 'column',
              columnGap: 12,
              rowGap: 6,
            },
            last ? { borderBottomWidth: r.rule.width, borderBottomColor: r.rule.color } : null,
            style,
          ]}
        >
          <View style={side ? { width: r.marginWidth, paddingTop: 2 } : undefined}>{heading}</View>
          <View style={{ flex: side ? 1 : undefined, minWidth: 0 }}>
            {voiceLine}
            {body}
          </View>
        </View>
      );
    }
    case 'thread': {
      const x = r.paddingX + 9;
      return (
        <View
          style={[
            { paddingLeft: r.paddingX + 32, paddingRight: r.paddingX, paddingBottom: 26 },
            style,
          ]}
        >
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: x,
              top: 0,
              bottom: 0,
              width: r.thread.width,
              backgroundColor: r.thread.color,
            }}
          />
          <View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                left: x - r.thread.knot / 2 + 0.5,
                top: 7,
                width: r.thread.knot,
                height: r.thread.knot,
                borderRadius: r.thread.knot,
              },
              signal
                ? [
                    { backgroundColor: r.thread.knotLit },
                    glowStyle({ color: t.glow, radius: 16, opacity: 0.6 }),
                  ]
                : { backgroundColor: t.ground, borderWidth: 1.25, borderColor: r.thread.color },
            ]}
          />
          <View style={{ marginBottom: 8 }}>{heading}</View>
          {voiceLine}
          {body}
        </View>
      );
    }
    case 'leaves': {
      return (
        <View
          style={[
            {
              marginHorizontal: 14,
              marginBottom: 14,
              paddingTop: 16,
              paddingBottom: 14,
              paddingLeft: 38,
              paddingRight: 18,
              backgroundColor: r.leaf.fill,
              ...radiusStyle(r.leaf.radius),
              ...shadowStyle(r.leaf.shadow),
            },
            style,
          ]}
        >
          {[{ top: 18 }, { bottom: 18 }].map((pos, i) => (
            <View
              key={i}
              pointerEvents="none"
              style={[styles.hole, pos, { backgroundColor: r.leaf.hole }]}
            />
          ))}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            {heading}
            {signal ? (
              <View
                style={[
                  styles.dot,
                  { backgroundColor: t.lamp },
                  glowStyle({ color: t.glow, radius: 10, opacity: 0.6 }),
                ]}
              />
            ) : null}
          </View>
          {voiceLine}
          {body}
        </View>
      );
    }
    case 'light': {
      const strength = signal ? r.wash.litOpacity : r.wash.opacity;
      return (
        <View style={[{ paddingTop: 22, paddingBottom: 24, paddingHorizontal: r.paddingX }, style]}>
          <LinearGradient
            pointerEvents="none"
            colors={[alpha(r.wash.color, strength), alpha(r.wash.color, 0)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.85, y: 0.9 }}
            style={StyleSheet.absoluteFill}
          />
          {heading}
          {voiceLine ?? <View style={{ height: 8 }} />}
          {body}
        </View>
      );
    }
    case 'boxes': {
      return (
        <View style={[{ marginHorizontal: 16, marginBottom: 16 }, style]}>
          <View style={{ marginBottom: 8, marginHorizontal: 6 }}>{heading}</View>
          <View style={surfaceStyle(r.box)}>
            <InnerFrame recipe={r.box} />
            {voiceLine}
            {body}
          </View>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  hole: {
    position: 'absolute',
    left: 15,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
