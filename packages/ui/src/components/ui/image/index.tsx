import React from 'react';
import { Image as RNImage, type ImageProps } from 'react-native';
import { cssInterop } from 'nativewind';

cssInterop(RNImage, { className: 'style' });

export const Image = React.forwardRef<RNImage, ImageProps & { className?: string }>(
  ({ className, ...props }, ref) => <RNImage {...props} ref={ref} {...({ className } as any)} />,
);

Image.displayName = 'Image';
