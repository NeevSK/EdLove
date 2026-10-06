import { styled } from 'nativewind';
import React from 'react';
import { View, type ViewProps } from 'react-native';

const StyledView = styled(View);

export const Center = React.forwardRef<any, ViewProps & { className?: string }>(
  ({ className, children, ...props }, ref) => {
    return (
      <StyledView {...props} ref={ref} className={`items-center justify-center ${className || ''}`}>
        {children}
      </StyledView>
    );
  },
);

Center.displayName = 'Center';
