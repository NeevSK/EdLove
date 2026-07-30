import { cssInterop } from 'react-native-css-interop';
import React from 'react';
import type { View, ViewProps } from 'react-native';
import { View as PrimitiveView } from '@repo/ui/primitives';

const StyledView = PrimitiveView;

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

