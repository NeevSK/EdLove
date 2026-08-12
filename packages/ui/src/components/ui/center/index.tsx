import React from 'react';
import { View, type ViewProps } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);

export const Center = React.forwardRef<View, ViewProps & { className?: string }>(
  ({ className, ...props }, ref) => {
    return (
      <StyledView
        {...props}
        ref={ref}
        className={`items-center justify-center ${className || ''}`}
      />
    );
  },
);

Center.displayName = 'Center';
