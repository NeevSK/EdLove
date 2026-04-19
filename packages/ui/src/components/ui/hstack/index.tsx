import React from 'react';
import { View, type ViewProps } from 'react-native';

export interface IHStackProps extends ViewProps {
  className?: string;
  space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | string;
  reversed?: boolean;
}

const spaceMap: Record<string, string> = {
  'xs': 'gap-1', // 4px
  'sm': 'gap-2', // 8px
  'md': 'gap-2.5', // 9px breathing space
  'lg': 'gap-6', // 24px
  'xl': 'gap-8', // 32px
};

export const HStack = React.forwardRef<View, IHStackProps>(
  ({ className, space, reversed, ...props }, ref) => {
    const gapClass = space ? (spaceMap[space] || `gap-${space}`) : '';
    const Component = View as any;
    return (
      <Component
        {...props}
        ref={ref}
        className={`flex-row ${reversed ? 'flex-row-reverse' : ''} ${gapClass} ${className || ''}`}
      />
    );
  }
);

HStack.displayName = 'HStack';
