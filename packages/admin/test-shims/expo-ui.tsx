import React from 'react';

const host = (name: string) =>
  React.forwardRef<unknown, Record<string, unknown>>(({ children, ...props }, ref) =>
    React.createElement(name, { ...props, ref }, children),
  );

export const Circle = host('Circle');
export const Defs = host('Defs');
export const Image = host('ExpoImage');
export const LinearGradient = host('LinearGradient');
export const Path = host('Path');
export const Rect = host('Rect');
export const Svg = host('Svg');

export default LinearGradient;
