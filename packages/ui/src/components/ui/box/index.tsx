import { styled } from 'nativewind';
import React from 'react';
import { type StyleProp, View, type ViewProps, type ViewStyle } from 'react-native';

// Standard primitive: use the NativeWind v5 adapter directly.
const StyledView = styled(View);

export interface IBoxProps extends ViewProps {
  className?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  sx?: StyleProp<ViewStyle>;
}

const Box = React.forwardRef<View, IBoxProps>(
  ({ className, sx, style, children, ...props }, ref) => (
    <StyledView {...props} ref={ref} className={className} style={[sx, style]}>
      {children}
    </StyledView>
  ),
);

Box.displayName = 'Box';

export { Box };
