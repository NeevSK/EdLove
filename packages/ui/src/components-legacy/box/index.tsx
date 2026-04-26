import { cssInterop } from 'nativewind';
import React from 'react';
import { View, type ViewProps } from 'react-native';

const StyledView = View;

cssInterop(StyledView, {
  className: {
    target: 'style',
  },
});

export interface IBoxProps extends ViewProps {
  className?: string;
}

const Box = React.forwardRef<View, IBoxProps>(({ className, ...props }, ref) => {
  const Component = StyledView as any;
  return <Component {...props} ref={ref} className={className} />;
});

Box.displayName = 'Box';

export { Box };
