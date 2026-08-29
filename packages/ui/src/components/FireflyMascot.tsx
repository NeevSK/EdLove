import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G, Rect } from 'react-native-svg';

export interface FireflyMascotProps {
  size?: number;
  mode?: 'glowing' | 'resting' | 'offline';
}

/**
 * Humane Firefly Mascot vector illustration.
 * Embodies the product's gentle, guidance-focused soul in empty, resting, and offline states.
 */
export function FireflyMascot({ size = 120, mode = 'glowing' }: FireflyMascotProps) {
  const isGlowing = mode === 'glowing';
  const isOffline = mode === 'offline';
  
  const glowColor = isOffline ? 'rgba(160, 140, 120, 0.4)' : isGlowing ? '#FFC107' : '#D4843A';
  const bodyColor = '#2A2421';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {/* Soft Ambient Light Halo */}
        <Circle
          cx="100"
          cy="115"
          r={isGlowing ? '55' : '40'}
          fill={glowColor}
          opacity={isGlowing ? '0.25' : '0.12'}
        />

        {/* Wings */}
        <G opacity="0.85">
          <Path
            d="M 90 85 C 60 40, 30 70, 85 95 Z"
            fill="rgba(255, 255, 255, 0.6)"
            stroke="rgba(255, 255, 255, 0.8)"
            strokeWidth="2"
          />
          <Path
            d="M 110 85 C 140 40, 170 70, 115 95 Z"
            fill="rgba(255, 255, 255, 0.6)"
            stroke="rgba(255, 255, 255, 0.8)"
            strokeWidth="2"
          />
        </G>

        {/* Antennae */}
        <Path
          d="M 94 75 Q 85 55 75 58"
          fill="none"
          stroke={bodyColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Path
          d="M 106 75 Q 115 55 125 58"
          fill="none"
          stroke={bodyColor}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Head */}
        <Circle cx="100" cy="80" r="14" fill={bodyColor} />
        {/* Cute Eyes */}
        <Circle cx="95" cy="78" r="2.5" fill="#FFFFFF" />
        <Circle cx="105" cy="78" r="2.5" fill="#FFFFFF" />

        {/* Thorax */}
        <Rect x="90" y="92" width="20" height="16" rx="8" fill={bodyColor} />

        {/* Glowing Abdomen (The Light Source) */}
        <Path
          d="M 88 108 C 88 140, 112 140, 112 108 Z"
          fill={glowColor}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
