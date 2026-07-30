import { cssInterop } from 'react-native-css-interop';
import React from 'react';
import type { View, ViewProps } from 'react-native';
import { View as PrimitiveView } from '@repo/ui/primitives';

const StyledView = PrimitiveView;

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

