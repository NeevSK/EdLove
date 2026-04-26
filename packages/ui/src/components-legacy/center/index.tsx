import { cssInterop } from 'nativewind';
import React from 'react';
import { View, type ViewProps } from 'react-native';

const StyledView = View;

cssInterop(StyledView, {
  className: {
    target: 'style',
  },
});

export interface ICenterProps extends ViewProps {
  className?: string;
}

const Center = React.forwardRef<View, ICenterProps>(({ className, ...props }, ref) => {
  const Component = StyledView as any;
  return (
    <Component {...props} ref={ref} className={`items-center justify-center ${className || ''}`} />
  );
});

Center.displayName = 'Center';

export { Center };
