import { cssInterop } from 'nativewind';
import React from 'react';
import { type ImageBackgroundProps, ImageBackground as RNImageBackground } from 'react-native';

cssInterop(RNImageBackground, { className: 'style' });

export const ImageBackground = React.forwardRef<any, ImageBackgroundProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <RNImageBackground {...props} ref={ref} {...({ className } as any)} />
  ),
);

ImageBackground.displayName = 'ImageBackground';
