import RNSlider, { type SliderProps as RNSliderProps } from '@react-native-community/slider';
import { useTheme } from '@repo/ui/hooks/useTheme';
import { tokens } from '@repo/ui/tokens';
import React from 'react';
import { styled } from 'react-native-css';

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
  ref?: React.Ref<any>;
}

export const Slider = ({ className, minValue, maxValue, ref, ...props }: ISliderProps) => {
  const { accent } = useTheme();

  return (
    <StyledSlider
      {...props}
      ref={ref}
      minimumValue={minValue ?? props.minimumValue ?? 0}
      maximumValue={maxValue ?? props.maximumValue ?? 100}
      minimumTrackTintColor={accent?.action || tokens.colors.primary}
      maximumTrackTintColor={tokens.colors.border}
      thumbTintColor={accent?.action || tokens.colors.primary}
      className={className}
    />
  );
};

Slider.displayName = 'Slider';

export { Slider as default };
