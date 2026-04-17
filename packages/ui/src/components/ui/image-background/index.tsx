import React from 'react';
import { ImageBackground as RNImageBackground, type ImageBackgroundProps } from 'react-native';
import { cssInterop } from 'nativewind';

cssInterop(RNImageBackground, { className: 'style' });

export const ImageBackground = React.forwardRef<any, ImageBackgroundProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <RNImageBackground {...props} ref={ref} {...({ className } as any)} />
  )
);

ImageBackground.displayName = 'ImageBackground';
