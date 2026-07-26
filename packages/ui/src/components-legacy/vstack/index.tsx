import { cssInterop } from 'react-native-css-interop';
import React from 'react';
import type { View, ViewProps } from 'react-native';
import { View as PrimitiveView } from '@/primitives';

const StyledView = PrimitiveView;

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
  },
);

VStack.displayName = 'VStack';

export { VStack };

