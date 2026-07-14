import { cssInterop } from 'react-native-css-interop';
import React from 'react';
import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';

cssInterop(ActivityIndicator, { className: 'style' });

export const Spinner = React.forwardRef<
  ActivityIndicator,
  ActivityIndicatorProps & { className?: string }
>(({ className, color, ...props }, ref) => (
  <ActivityIndicator
    {...props}
    ref={ref}
    className={`text-phase-accent ${className || ''}`}
    color={color} // Keep native color support if explicitly passed
  />
));

Spinner.displayName = 'Spinner';

