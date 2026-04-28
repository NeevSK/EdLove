import { cssInterop } from 'nativewind';
import React from 'react';
import { View, type ViewProps } from 'react-native';

cssInterop(View, { className: 'style' });

interface IDividerProps extends ViewProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Divider = React.forwardRef<View, IDividerProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => {
    const orientationClasses = orientation === 'horizontal' ? 'w-full h-[1px]' : 'h-full w-[1px]';
    return (
      <View
        {...props}
        ref={ref}
        className={`${orientationClasses} bg-phase-surface ${className || ''}`}
      />
    );
  },
);

Divider.displayName = 'Divider';
