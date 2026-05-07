import { cssInterop } from 'nativewind';
import React from 'react';
import { type ImageProps, Image as RNImage } from 'react-native';

cssInterop(RNImage, { className: 'style' });

export const Image = React.forwardRef<RNImage, ImageProps & { className?: string }>(
  ({ className, ...props }, ref) => <RNImage {...props} ref={ref} className={className} />,
);
