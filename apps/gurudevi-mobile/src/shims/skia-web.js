/**
 * Self-Healing Web Shim for @shopify/react-native-skia
 */
import React from 'react';
import bridge from './universal-bridge';

const _View = (props) => React.createElement('div', props, props.children);
const Group = (props) => React.createElement('div', props, props.children);
const Canvas = (props) => React.createElement('div', props, props.children);
const BackdropBlur = (props) =>
  React.createElement('div', {
    ...props,
    style: { ...(props.style || {}), backdropFilter: `blur(10px)` },
  });

// Components usually returned as null or simple divs
const NoOpComponent = () => null;

const Skia = bridge('Skia', {
  Color: () => '#000000',
  Paint: () => ({}),
  Font: () => ({}),
  Path: {
    Make: () => ({
      moveTo: () => {},
      lineTo: () => {},
      quadTo: () => {},
      cubicTo: () => {},
      close: () => {},
      simplify: () => true,
      toSVGString: () => '',
    }),
  },
});

const skiaShim = bridge('@shopify/react-native-skia', {
  Skia,
  Canvas,
  Group,
  BackdropBlur,
  Circle: NoOpComponent,
  Rect: NoOpComponent,
  Path: NoOpComponent,
  Image: NoOpComponent,
  Text: NoOpComponent,
  DropShadow: NoOpComponent,
  Blur: NoOpComponent,
  LinearGradient: NoOpComponent,
  RadialGradient: NoOpComponent,
  SweepGradient: NoOpComponent,
  ImageShader: NoOpComponent,
  ColorMatrix: NoOpComponent,
  BackdropFilter: NoOpComponent,
  Mask: NoOpComponent,
  Fill: NoOpComponent,
  FitBox: NoOpComponent,
  Box: NoOpComponent,
  BoxShadow: NoOpComponent,
  mix: (value, x, y) => x * (1 - value) + y * value,
  useFont: () => null,
  useImage: () => null,
  usePath: () => null,
  useValue: (v) => ({ current: v }),
  useComputedValue: (_v) => ({ current: null }),
});

export { BackdropBlur, Canvas, Group, Skia };

export default skiaShim;
