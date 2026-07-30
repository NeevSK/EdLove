import {
  LinearGradient as ExpoLinearGradient,
  type LinearGradientProps,
} from 'expo-linear-gradient';
import { cssInterop } from 'react-native-css-interop';
import React from 'react';

cssInterop(ExpoLinearGradient, { className: 'style' });

export const LinearGradient = React.forwardRef<any, LinearGradientProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <ExpoLinearGradient {...props} ref={ref} {...({ className } as any)} />
  ),
);

LinearGradient.displayName = 'LinearGradient';

