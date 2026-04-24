import React from 'react';
import { Pressable as RNPressable, type PressableProps } from 'react-native';
import { cssInterop } from 'nativewind';

cssInterop(RNPressable, { className: 'style' });

export interface IPressableProps extends PressableProps {
  className?: string;
}

const Pressable = React.forwardRef<any, IPressableProps>(({ className, ...props }, ref) => (
  <RNPressable {...props} ref={ref} {...({ className } as any)} />
));

Pressable.displayName = 'Pressable';

export { Pressable };
