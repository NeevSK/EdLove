import { styled } from 'nativewind';
import React from 'react';
import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';

const StyledActivityIndicator = styled(ActivityIndicator as React.ComponentType<any>);

export const Spinner = React.forwardRef<
  ActivityIndicator,
  ActivityIndicatorProps & { className?: string }
>(({ className, color, ...props }, ref) => (
  <StyledActivityIndicator
    {...props}
    ref={ref}
    className={`text-phase-accent ${className || ''}`}
    color={color}
  />
));

Spinner.displayName = 'Spinner';
