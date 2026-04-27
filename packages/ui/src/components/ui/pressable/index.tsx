import { cssInterop } from 'nativewind';
import React from 'react';
import { type PressableProps, Pressable as RNPressable } from 'react-native';

cssInterop(RNPressable, { className: 'style' });

export interface IPressableProps extends PressableProps {
  className?: string;
  href?: string;
  hrefAttrs?: {
    target?: string;
    rel?: string;
    download?: string;
  };
}

const Pressable = React.forwardRef<any, IPressableProps>(
  ({ className, href, hrefAttrs, ...props }, ref) => (
    <RNPressable
      {...props}
      ref={ref}
      {...({ className, href, hrefAttrs } as any)}
    />
  ),
);

Pressable.displayName = 'Pressable';

export { Pressable };
