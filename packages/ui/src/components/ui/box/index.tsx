import { cssInterop } from 'nativewind';
import React from 'react';
import { type StyleProp, View, type ViewProps, type ViewStyle } from 'react-native';

cssInterop(View, { className: 'style' });

export interface IBoxProps extends ViewProps {
  className?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  sx?: StyleProp<ViewStyle>;
}

const Box = React.forwardRef<View, IBoxProps>(({ className, sx, style, ...props }, ref) => {
  const StyledView = View as any;
  return <StyledView {...props} ref={ref} className={className} style={[sx, style]} />;
});

Box.displayName = 'Box';

export { Box };
