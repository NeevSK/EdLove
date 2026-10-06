import { styled } from 'nativewind';
import React from 'react';
import { type ImageProps, Image as RNImage } from 'react-native';

const StyledImage = styled(RNImage as React.ComponentType<any>);

export const Image = React.forwardRef<any, ImageProps & { className?: string }>(
  ({ className, ...props }, ref) => <StyledImage {...props} ref={ref} className={className} />,
);

Image.displayName = 'Image';
