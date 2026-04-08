import React from 'react';
import { View, type ViewProps } from 'react-native';
import { cssInterop } from 'nativewind';

cssInterop(View, { className: 'style' });

export interface IProgressProps extends ViewProps {
  className?: string;
  value?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const Progress = React.forwardRef<View, IProgressProps>(
  ({ className, value = 0, size = 'md', children, ...props }, ref) => {
    const heightMap = {
      xs: 'h-1',
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
      xl: 'h-5',
    };

    return (
      <View
        {...props}
        ref={ref}
        className={`bg-phase-interactive/10 rounded-full overflow-hidden w-full ${heightMap[size]} ${className || ''}`}
      >
        {children}
      </View>
    );
  }
);

export const ProgressFilledTrack = React.forwardRef<View, ViewProps & { className?: string; value?: number }>(
  ({ className, value, ...props }, ref) => (
    <View
      {...props}
      ref={ref}
      style={{ width: `${value || 0}%` }}
      className={`h-full bg-phase-accent rounded-full ${className || ''}`}
    />
  )
);

Progress.displayName = 'Progress';
ProgressFilledTrack.displayName = 'ProgressFilledTrack';

export { Progress };
