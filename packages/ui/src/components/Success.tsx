/**
 * Success.tsx — two deliberately different tiers of "it worked."
 *
 * Per the motion plan, these are NOT the same component at different sizes.
 * Using the branded heart-glow for every trivial save would burn out its
 * meaning fast — so trivial actions get a plain, generic, fast checkmark
 * (Layer 0 tokens only, no brand asset), and only real milestones get the
 * heart-glow treatment. Reach for <SuccessCheck> by default; reach for
 * <SuccessGlow> deliberately, not habitually.
 *
 * Platform note: Uses platform-specific animation implementations.
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { duration, easing, nativeEasing, scale as scaleTokens, color } from './motion';

// Conditional imports for Reanimated
let Animated: any = null;
try {
  Animated = require('react-native-reanimated');
} catch (e) {
  // Reanimated not available
}

const AnimatedView = Animated?.createAnimatedComponent(View) || View;

// ---------------------------------------------------------------------------
// Trivial tier — a field saved, an item checked off, a setting toggled.
// Plain, fast, no brand ceremony. duration.micro (~150ms), settles once,
// does not loop, does not reference the mark.
// ---------------------------------------------------------------------------
export function SuccessCheck({ size = 22, className, style }: { size?: number; className?: string; style?: any }) {
  // Web implementation using CSS animations
  if (Platform.OS === 'web') {
    return (
      <div className={className} style={{ width: size, height: size, ...(style || {}) }}>
        <style>{`
          @keyframes success-check {
            0% { opacity: 0; transform: scale(${scaleTokens.enter}); }
            100% { opacity: 1; transform: scale(${scaleTokens.rest}); }
          }
          .success-check-animated svg {
            animation: success-check ${duration.micro}ms cubic-bezier(0.33, 1, 0.42, 0) forwards;
          }
        `}</style>
        <div className="success-check-animated">
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Circle cx={12} cy={12} r={11} fill={color.neutral.warmGray100} />
            <Path
              d="M7 12.5L10.2 15.7L17 8.5"
              stroke={color.brand.orange}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </div>
      </div>
    );
  }

  // Native implementation
  return (
    <AnimatedView
      className={className}
      style={[
        { width: size, height: size },
        ...(Animated ? {
          animationName: {
            '0%': { opacity: 0, transform: [{ scale: scaleTokens.enter }] },
            '100%': { opacity: 1, transform: [{ scale: scaleTokens.rest }] },
          },
          animationDuration: duration.micro,
          animationTimingFunction: nativeEasing.decelerate,
          animationFillMode: 'forwards',
        } as any : {}),
        style,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx={12} cy={12} r={11} fill={color.neutral.warmGray100} />
        <Path
          d="M7 12.5L10.2 15.7L17 8.5"
          stroke={color.brand.orange}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </AnimatedView>
  );
}

// ---------------------------------------------------------------------------
// Meaningful tier — first connection made, a session booked, a reflection
// saved. The real traced heart, reserved for the moments that earn it.
// duration.meaningful (~520ms), a compressed echo of the splash's heart-
// glow finale: a soft warm bloom plus a couple of drifting motes, not the
// full multi-second sequence — this is a UI moment, not a ceremony.
// ---------------------------------------------------------------------------
const HEART_PATH =
  'M 180.53,282.52 L 194.23,283.61 L 207.10,286.35 L 216.14,289.64 L 228.74,296.76 L 234.22,301.15 L 244.63,312.65 L 252.58,326.62 L 255.86,335.94 L 259.97,324.98 L 266.27,314.02 L 271.48,307.45 L 282.98,297.04 L 295.58,289.92 L 303.53,286.90 L 318.05,283.61 L 331.47,282.79 L 328.46,308.27 L 323.80,328.27 L 318.05,345.52 L 308.73,366.07 L 300.24,380.31 L 286.54,398.39 L 271.48,413.73 L 256.96,425.24 L 255.59,425.51 L 244.08,416.75 L 227.65,400.86 L 215.05,385.25 L 202.99,365.80 L 193.41,344.70 L 187.10,324.98 L 182.45,303.06 Z';

const MOTE_OFFSETS: Array<{ dx: number; dy: number; delayFrac: number }> = [
  { dx: -34, dy: -40, delayFrac: 0 },
  { dx: 30, dy: -36, delayFrac: 0.12 },
  { dx: -6, dy: -46, delayFrac: 0.22 },
];

function Mote({ dx, dy, delayMs }: { dx: number; dy: number; delayMs: number }) {
  // Web implementation
  if (Platform.OS === 'web') {
    return (
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: color.brand.peach,
          animation: `mote-drift ${duration.meaningful}ms cubic-bezier(0.33, 1, 0.42, 0) forwards`,
          animationDelay: `${delayMs}ms`,
        }}
      >
        <style>{`
          @keyframes mote-drift {
            0% { opacity: 0; transform: translate(0, 0); }
            35% { opacity: 0.85; }
            100% { opacity: 0; transform: translate(${dx}px, ${dy}px); }
          }
        `}</style>
      </div>
    );
  }

  // Native implementation
  if (!Animated) return null;

  return (
    <AnimatedView
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: color.brand.peach,
        animationName: {
          '0%': { opacity: 0, transform: [{ translateX: 0 }, { translateY: 0 }] },
          '35%': { opacity: 0.85 },
          '100%': { opacity: 0, transform: [{ translateX: dx }, { translateY: dy }] },
        },
        animationDuration: duration.meaningful,
        animationDelay: delayMs,
          animationTimingFunction: nativeEasing.decelerate,
        animationFillMode: 'forwards',
      } as any}
    />
  );
}

export function SuccessGlow({ size = 64, className, style }: { size?: number; className?: string; style?: any }) {
  // Re-mountable key lets a screen retrigger the moment (e.g. on repeated saves).
  const [playKey, setPlayKey] = useState(0);
  useEffect(() => setPlayKey((k) => k + 1), []);

  // Web implementation
  if (Platform.OS === 'web') {
    return (
      <div 
        className={className}
        style={{ ...styles.glowWrap, width: size, height: size, ...(style || {}) }} 
        key={playKey}
      >
        <style>{`
          @keyframes success-glow {
            0% { opacity: 0; transform: scale(0.7); }
            55% { opacity: 0.9; transform: scale(1.08); }
            100% { opacity: 1; transform: scale(1); }
          }
          .success-glow-animated svg {
            animation: success-glow ${duration.meaningful}ms cubic-bezier(0.33, 1, 0.42, 0) forwards;
          }
        `}</style>
        <div className="success-glow-animated" style={{ position: 'absolute', inset: 0 }}>
          <Svg width={size} height={size} viewBox="164 267 183 175">
            <Path d={HEART_PATH} fill={color.brand.peach} />
          </Svg>
        </div>
        {MOTE_OFFSETS.map((m, i) => (
          <Mote key={i} dx={m.dx} dy={m.dy} delayMs={duration.meaningful * 0.3 + m.delayFrac * duration.meaningful} />
        ))}
      </div>
    );
  }

  // Native implementation
  return (
    <View style={[styles.glowWrap, { width: size, height: size }, style]} key={playKey} className={className}>
      <AnimatedView
        style={{
          position: 'absolute',
          inset: 0,
          ...(Animated ? {
            animationName: {
              '0%': { opacity: 0, transform: [{ scale: 0.7 }] },
              '55%': { opacity: 0.9, transform: [{ scale: 1.08 }] },
              '100%': { opacity: 1, transform: [{ scale: 1 }] },
            },
            animationDuration: duration.meaningful,
          animationTimingFunction: nativeEasing.decelerate,
            animationFillMode: 'forwards',
          } as any : {}),
        }}
      >
        <Svg width={size} height={size} viewBox="164 267 183 175">
          <Path d={HEART_PATH} fill={color.brand.peach} />
        </Svg>
      </AnimatedView>
      {MOTE_OFFSETS.map((m, i) => (
        <Mote key={i} dx={m.dx} dy={m.dy} delayMs={duration.meaningful * 0.3 + m.delayFrac * duration.meaningful} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  glowWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
