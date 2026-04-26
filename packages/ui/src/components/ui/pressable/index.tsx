import { cssInterop } from 'nativewind';
import React from 'react';
import { type PressableProps, Pressable as RNPressable } from 'react-native';

cssInterop(RNPressable, { className: 'style' });

export interface IPressableProps extends PressableProps {
  className?: string;
}

const Pressable = React.forwardRef<any, IPressableProps>(({ className, ...props }, ref) => (
  <RNPressable {...props} ref={ref} {...({ className } as any)} />
));

Pressable.displayName = 'Pressable';

export { Pressable };
