import React from 'react';
import { View, type ViewProps } from 'react-native';
import { cssInterop } from 'nativewind';

const StyledView = View;

cssInterop(StyledView, {
  className: {
    target: 'style',
  },
});

export interface IVStackProps extends ViewProps {
  className?: string;
  space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  reversed?: boolean;
}

const VStack = React.forwardRef<View, IVStackProps>(
  ({ className, space, reversed, ...props }, ref) => {
    const spaceClass = space ? `gap-${space}` : '';
    const reversedClass = reversed ? 'flex-col-reverse' : 'flex-col';
    
    const Component = StyledView as any;

    return (
      <Component
        {...props}
        ref={ref}
        className={`${reversedClass} ${spaceClass} ${className || ''}`}
      />
    );
  }
);

VStack.displayName = 'VStack';

export { VStack };
