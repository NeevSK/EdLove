/**
 * Where Tutii rests in each world. Tutii stays the same character everywhere;
 * the perch and the light change (docs/Core/design/2026-10-26-world-model.md).
 *
 * Drawn in the same 220 × 164 box as Tutii's feedback scene, along its lower
 * edge, so Tutii sits on it. Lines use the world's ornament, lit parts its lamp.
 */

import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import type { WorldId, WorldTokens } from '../types';
import { useWorld } from './WorldContext';

type Draw = (t: WorldTokens) => ReactNode;

const W = 1.6;

const PERCHES: Readonly<Record<WorldId, Draw>> = {
  // The clay lamp.
  sanctuary: (t) => (
    <G>
      <Path d="M76 136 Q110 162 144 136 Z" fill={t.ornament} opacity={0.85} />
      <Path d="M144 136 L156 131" stroke={t.ornament} strokeWidth={W} strokeLinecap="round" />
      <Ellipse cx={158} cy={127} rx={3} ry={5} fill={t.lamp} />
    </G>
  ),
  // A lotus pad on still water.
  wewa: (t) => (
    <G>
      <Path
        d="M110 148 L133 138.5 A46 11 0 1 0 149.8 142.5 Z"
        fill={t.ornament}
        fillOpacity={0.4}
        stroke={t.ornament}
        strokeWidth={W}
      />
      <Path
        d="M40 156 Q60 152 80 156 M140 156 Q160 152 180 156"
        stroke={t.line}
        strokeWidth={W}
        fill="none"
      />
    </G>
  ),
  // A lace window: an arch with a lattice of dots.
  ratna: (t) => (
    <G stroke={t.ornament} strokeWidth={W} fill="none">
      <Path d="M70 162 V126 A40 26 0 0 1 150 126 V162" />
      {[86, 98, 110, 122, 134].map((x) => (
        <Circle key={x} cx={x} cy={152} r={1.6} fill={t.ornament} />
      ))}
    </G>
  ),
  // A branch with two leaves.
  kele: (t) => (
    <G>
      <Path
        d="M30 150 Q110 132 190 146"
        stroke={t.ornament}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <Path d="M58 146 q-6 -14 8 -18 q2 12 -8 18 Z" fill={t.lamp} />
      <Path d="M164 144 q10 -10 20 -4 q-8 10 -20 4 Z" fill={t.lamp} opacity={0.8} />
    </G>
  ),
  // A silver oak, tall and narrow, standing over the tea rows.
  tea: (t) => (
    <G>
      <Path
        d="M178 162 V104 M178 128 L166 116 M178 118 L190 106"
        stroke={t.ornament}
        strokeWidth={W}
        strokeLinecap="round"
        fill="none"
      />
      <Ellipse cx={178} cy={100} rx={11} ry={22} fill={t.ornament} opacity={0.4} />
      <Path
        d="M30 156 q12 -8 24 0 q12 -8 24 0 q12 -8 24 0 q12 -8 24 0 q12 -8 24 0"
        stroke={t.lamp}
        strokeWidth={W}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M44 162 q10 -6 20 0 q10 -6 20 0 q10 -6 20 0 q10 -6 20 0"
        stroke={t.lamp}
        strokeWidth={W}
        strokeLinecap="round"
        fill="none"
        opacity={0.6}
      />
    </G>
  ),
  // A niche in the temple wall: a doubled arch frame.
  kandyan: (t) => (
    <G stroke={t.ornament} fill="none">
      <Path d="M66 162 V128 Q110 96 154 128 V162" strokeWidth={W * 1.5} />
      <Path d="M74 162 V131 Q110 106 146 131 V162" strokeWidth={W * 0.8} />
      <Rect x={60} y={158} width={100} height={4} fill={t.ornament} />
    </G>
  ),
  // A brass lamp stand.
  angampora: (t) => (
    <G fill={t.ornament}>
      <Rect x={84} y={146} width={52} height={5} />
      <Rect x={106} y={151} width={8} height={9} />
      <Rect x={92} y={160} width={36} height={4} />
      <Circle cx={88} cy={141} r={3.5} fill={t.lamp} />
      <Circle cx={132} cy={141} r={3.5} fill={t.lamp} />
    </G>
  ),
  // A torch pole with its flame.
  perahera: (t) => (
    <G>
      <Line
        x1={168}
        y1={164}
        x2={168}
        y2={104}
        stroke={t.ornament}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path d="M168 102 q-8 -10 0 -22 q8 12 0 22 Z" fill={t.lamp} />
      <Path d="M70 154 H150" stroke={t.ornament} strokeWidth={W} />
    </G>
  ),
  // A rose stem with a leaf and thorns.
  rosa: (t) => (
    <G>
      <Path
        d="M40 156 Q110 136 184 150"
        stroke={t.ornament}
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
      <Path d="M150 146 q8 -14 22 -12 q-6 14 -22 12 Z" fill={t.ornament} opacity={0.7} />
      <Path
        d="M80 148 l-3 -6 M118 142 l2 -6"
        stroke={t.ornament}
        strokeWidth={W}
        strokeLinecap="round"
      />
      <Circle cx={184} cy={148} r={5} fill={t.lamp} />
    </G>
  ),
  // The spire over the city line.
  colombo: (t) => (
    <G stroke={t.ornament} strokeWidth={W} fill="none">
      <Path d="M20 162 V148 H44 V140 H62 V154 H158 V138 H176 V150 H200 V162" />
      <Path d="M182 150 L188 90 L194 150" />
      <Circle cx={188} cy={86} r={2.4} fill={t.lamp} stroke="none" />
    </G>
  ),
  // A floodlight on its mast.
  spark: (t) => (
    <G>
      <Path d="M176 92 L120 160 L150 160 Z" fill={t.glow} opacity={0.18} />
      <Line x1={186} y1={164} x2={186} y2={96} stroke={t.ink} strokeWidth={3} />
      <Rect x={170} y={86} width={22} height={10} fill={t.lamp} transform="rotate(-24 181 91)" />
      <Path d="M60 160 H150" stroke={t.ink} strokeWidth={W} />
    </G>
  ),
};

/** The active world's perch, filling the scene box it is placed in. */
export function Perch({ width, height }: { width: number; height: number }) {
  const world = useWorld();
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 220 164"
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      {PERCHES[world.id](world.tokens)}
    </Svg>
  );
}
