import React from 'react';
import { View, type ViewProps } from 'react-native';
import { cssInterop } from 'nativewind';

const StyledView = View;

cssInterop(StyledView, {
  className: {
    target: 'style',
  },
});

export interface IHStackProps extends ViewProps {
  className?: string;
  space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  reversed?: boolean;
}

const HStack = React.forwardRef<View, IHStackProps>(
  ({ className, space, reversed, ...props }, ref) => {
    const spaceClass = space ? `gap-${space}` : '';
    const reversedClass = reversed ? 'flex-row-reverse' : 'flex-row';

    const Component = StyledView as any;

    return (
      <Component
        {...props}
        ref={ref}
        className={`${reversedClass} items-center ${spaceClass} ${className || ''}`}
      />
    );
  },
);

HStack.displayName = 'HStack';

export { HStack };
