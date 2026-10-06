import { styled } from 'nativewind';
import React from 'react';
import {
  type ImageProps,
  type ImageSourcePropType,
  Image,
  StyleSheet,
  View,
  type ViewProps,
} from 'react-native';

const StyledView = styled(View);
const StyledImage = styled(Image as React.ComponentType<any>);

export interface IImageBackgroundProps extends ViewProps {
  source: ImageSourcePropType;
  resizeMode?: ImageProps['resizeMode'];
  imageStyle?: ImageProps['style'];
  imageClassName?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ImageBackground = React.forwardRef<
  any,
  IImageBackgroundProps
>(
  (
    {
      source,
      resizeMode = 'cover',
      imageStyle,
      imageClassName,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => (
    <StyledView {...props} ref={ref} style={style} className={className}>
      <StyledImage
        source={source}
        resizeMode={resizeMode}
        style={[StyleSheet.absoluteFill, imageStyle]}
        className={imageClassName}
      />
      {children}
    </StyledView>
  ),
);

ImageBackground.displayName = 'ImageBackground';
