import React from 'react';
import { View, type ViewProps } from 'react-native';

export const Center = React.forwardRef<View, ViewProps & { className?: string }>(
  ({ className, ...props }, ref) => {
    const Component = View as any;
    return (
      <Component {...props} ref={ref} className={`items-center justify-center ${className || ''}`} />
    );
  }
);

Center.displayName = 'Center';
