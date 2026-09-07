import React from 'react';

const host = (name: string) =>
  React.forwardRef<unknown, Record<string, unknown>>(({ children, ...props }, ref) =>
    React.createElement(name, { ...props, ref }, children),
  );

export const Image = host('ExpoImage');
export const LinearGradient = host('LinearGradient');
export const Svg = host('Svg');
export const Circle = host('Circle');
export const Defs = host('Defs');
export const Ellipse = host('Ellipse');
export const G = host('G');
export const Line = host('Line');
export const Path = host('Path');
export const Polygon = host('Polygon');
export const RadialGradient = host('RadialGradient');
export const Rect = host('Rect');
export const Stop = host('Stop');
export const Text = host('SvgText');
export const ExecutionEnvironment = {
  Standalone: 'standalone',
  StoreClient: 'storeClient',
};

export const expoConfig = {};
export const appOwnership = null;

export default Svg;
