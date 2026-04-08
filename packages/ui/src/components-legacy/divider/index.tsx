import React from 'react';
import { Text as RNText, View, ActivityIndicator, type TextProps, type ViewProps, type ActivityIndicatorProps } from 'react-native';
import { cssInterop } from 'nativewind';

cssInterop(ActivityIndicator, { className: 'style' });

export const Heading = React.forwardRef<RNText, TextProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <RNText 
      {...props} 
      ref={ref} 
      className={`font-bold text-xl ${className || ''}`} 
    />
  )
);

export const Divider = ({ className, ...props }: ViewProps & { className?: string }) => (
  <View {...props} className={`h-[1px] w-full bg-border ${className || ''}`} />
);

export const Spinner = ({ className, ...props }: ActivityIndicatorProps & { className?: string }) => (
  <ActivityIndicator {...props} className={className} />
);
