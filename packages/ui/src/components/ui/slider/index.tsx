import RNSlider, { type SliderProps as RNSliderProps } from '@react-native-community/slider';
import React from 'react';
import { styled } from 'react-native-css';
import { useTheme } from '@repo/ui/hooks/useTheme';

const StyledSlider = styled(RNSlider as React.ComponentType<any>);

/**
 * Slider Component
 *
 * A high-impact, hardened value picker.
 * Optimized for platform-native interaction and premium design tokens.
 */
export interface ISliderProps extends RNSliderProps {
  className?: string;
  minValue?: number;
  maxValue?: number;
}

export const Slider = React.forwardRef<any, ISliderProps>(
  ({ className, minValue, maxValue, ...props }, ref) => {
    const { accent } = useTheme();

    return (
      <StyledSlider
        {...props}
        ref={ref}
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
