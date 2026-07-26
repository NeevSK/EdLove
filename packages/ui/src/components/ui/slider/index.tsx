import RNSlider, { type SliderProps as RNSliderProps } from '@react-native-community/slider';
import { cssInterop } from 'react-native-css-interop';
import React from 'react';
import { useTheme } from '@/hooks/useTheme';

/**
 * Slider Component
 *
 * A high-impact, hardened value picker.
 * Optimized for platform-native interaction with design system color integration.
 */

cssInterop(RNSlider, { className: 'style' });

export interface ISliderProps extends RNSliderProps {
  className?: string;
  minValue?: number;
  maxValue?: number;
}

export const Slider = React.forwardRef<any, ISliderProps>(
  ({ className, minValue, maxValue, ...props }, ref) => {
    const { accent } = useTheme();

    return (
      <RNSlider
        {...props}
        ref={ref as any}
        minimumValue={minValue ?? props.minimumValue ?? 0}
        maximumValue={maxValue ?? props.maximumValue ?? 100}
        minimumTrackTintColor={accent?.action || '#D4843A'}
        maximumTrackTintColor="#E9E9EA"
        thumbTintColor={accent?.action || '#D4843A'}
        className={className}
      />
    );
  },
);

Slider.displayName = 'Slider';

export { Slider as default };

