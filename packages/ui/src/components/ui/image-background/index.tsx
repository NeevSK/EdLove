import { styled } from 'nativewind';
import React from 'react';
import { type ImageBackgroundProps, ImageBackground as RNImageBackground } from 'react-native';

const StyledImageBackground = styled(RNImageBackground as React.ComponentType<any>);

export const ImageBackground = React.forwardRef<
  RNImageBackground,
  ImageBackgroundProps & { className?: string }
>(({ className, ...props }, ref) => (
  <StyledImageBackground {...props} ref={ref} className={className} />
));

ImageBackground.displayName = 'ImageBackground';
