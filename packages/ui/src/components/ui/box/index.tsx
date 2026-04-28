import { cssInterop } from 'nativewind';
import React from 'react';
import { View, type ViewProps } from 'react-native';

cssInterop(View, { className: 'style' });

export interface IBoxProps extends ViewProps {
  className?: string;
}

const Box = React.forwardRef<View, IBoxProps>(({ className, ...props }, ref) => {
  const StyledView = View as any;
  return <StyledView {...props} ref={ref} className={className} />;
});

Box.displayName = 'Box';

export { Box };
