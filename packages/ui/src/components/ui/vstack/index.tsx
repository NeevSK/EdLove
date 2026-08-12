import React from 'react';
import { type StyleProp, View, type ViewProps, type ViewStyle } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);

export interface IVStackProps extends ViewProps {
  className?: string;
  space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | string;
  reversed?: boolean;
  children?: React.ReactNode;
  sx?: StyleProp<ViewStyle>;
}

const spaceMap: Record<string, string> = {
  xs: 'gap-1', // 4px
  sm: 'gap-2', // 8px
  md: 'gap-2.5', // 9px breathing space
  lg: 'gap-6', // 24px
  xl: 'gap-8', // 32px
};

export const VStack = React.forwardRef<View, IVStackProps>(
  ({ className, space, reversed, sx, style, children, ...props }, ref) => {
    const gapClass = space ? spaceMap[space] || `gap-${space}` : '';
    return (
      <StyledView
        {...props}
        ref={ref}
        className={`flex-col ${reversed ? 'flex-col-reverse' : ''} ${gapClass} ${className || ''}`}
        style={[sx, style]}
      >
        {children}
      </StyledView>
    );
  },
);

VStack.displayName = 'VStack';
