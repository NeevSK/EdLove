import React from 'react';

const host = (name: string) =>
  React.forwardRef<unknown, Record<string, unknown>>(({ children, ...props }, ref) =>
    React.createElement(name, { ...props, ref }, children),
  );

export const Canvas = host('Canvas');
export const Rect = host('Rect');
export const Circle = host('Circle');
export const Path = host('Path');
export const Group = host('Group');
export const Paint = host('Paint');
export const Shader = host('Shader');
export const ImageShader = host('ImageShader');
export const LinearGradient = host('LinearGradient');
export const RadialGradient = host('RadialGradient');
export const BlurMask = host('BlurMask');
export const vec = (x = 0, y = 0) => ({ x, y });
export const Skia = {
  Path: {
    Make: () => ({
      moveTo: () => {},
      lineTo: () => {},
      close: () => {},
    }),
  },
};
