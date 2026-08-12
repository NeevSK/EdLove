import React from 'react';
import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';
import { styled } from 'nativewind';

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
