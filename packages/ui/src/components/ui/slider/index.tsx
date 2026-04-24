import React from 'react';
import { View as RNView } from 'react-native';
import RNSlider, { type SliderProps as RNSliderProps } from '@react-native-community/slider';
import { cssInterop } from 'nativewind';

/**
 * Slider Implementation (Hardened v3)
 *
 * Supports both:
 * 1. Native Slider (via @react-native-community/slider)
 * 2. Composite Slider (for custom designs like form-builder)
 */

// 1. Native Slider with NativeWind support
cssInterop(RNSlider, { className: 'style' });

export interface ISliderProps extends RNSliderProps {
  className?: string;
  minValue?: number;
  maxValue?: number;
}

export const Slider = React.forwardRef<RNSlider, ISliderProps>(
  ({ className, minValue, maxValue, ...props }, ref) => (
    <RNSlider
      {...(props as any)}
      ref={ref}
      minimumValue={minValue ?? props.minimumValue}
      maximumValue={maxValue ?? props.maximumValue}
    />
  ),
);

// 2. Composite Components (Legacy support for form-builder)
const View = RNView as any;

export const SliderTrack = ({ children, className }: any) => (
  <View
    {...({
      className: `h-1 w-full bg-phase-surface border border-phase-surface rounded-full overflow-hidden ${className || ''}`,
    } as any)}
  >
    {children}
  </View>
);

export const SliderFilledTrack = ({ className, style, width = '0%' }: any) => (
  <View
    {...({
      style: { ...style, width },
      className: `h-full bg-phase-accent ${className || ''}`,
    } as any)}
  />
);

export const SliderThumb = ({ className, style }: any) => (
  <View
    {...({
      style,
      className: `w-5 h-5 bg-white border border-phase-accent rounded-full shadow-sm absolute ${className || ''}`,
    } as any)}
  />
);

Slider.displayName = 'Slider';
SliderTrack.displayName = 'SliderTrack';
SliderFilledTrack.displayName = 'SliderFilledTrack';
SliderThumb.displayName = 'SliderThumb';
