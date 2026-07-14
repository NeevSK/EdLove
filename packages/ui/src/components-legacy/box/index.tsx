import { cssInterop } from 'react-native-css-interop';
import React from 'react';
import type { View, ViewProps } from 'react-native';
import { View as PrimitiveView } from '../../primitives';

const StyledView = PrimitiveView;

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

