import React from 'react';
import { type ImageProps, Image as RNImage } from 'react-native';
import { styled } from 'nativewind';

const StyledImage = styled(RNImage as React.ComponentType<any>);

export const Image = React.forwardRef<RNImage, ImageProps & { className?: string }>(
  ({ className, ...props }, ref) => <StyledImage {...props} ref={ref} className={className} />,
);

Image.displayName = 'Image';
