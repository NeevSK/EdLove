import {
  LinearGradient as ExpoLinearGradient,
  type LinearGradientProps,
} from 'expo-linear-gradient';
import React from 'react';
import { styled } from 'react-native-css';

const StyledLinearGradient = styled(ExpoLinearGradient as React.ComponentType<any>);

export const LinearGradient = React.forwardRef<any, LinearGradientProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <StyledLinearGradient {...props} ref={ref} className={className} />
  ),
);

LinearGradient.displayName = 'LinearGradient';
