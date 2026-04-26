// View implementation

import { cssInterop } from 'nativewind';
import React from 'react';
import {
  type PressableProps,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  View as RNView,
  type ScrollViewProps,
  type ViewProps,
} from 'react-native';

cssInterop(RNView, { className: 'style' });
cssInterop(RNScrollView, { className: 'style' });
cssInterop(RNPressable, { className: 'style' });

export const View = React.forwardRef<RNView, ViewProps & { className?: string }>(
  ({ className, ...props }, ref) => {
    const Component = RNView as any;
    return <Component {...props} ref={ref} className={className} />;
  },
);

export const ScrollView = React.forwardRef<RNScrollView, ScrollViewProps & { className?: string }>(
  ({ className, ...props }, ref) => {
    const Component = RNScrollView as any;
    return <Component {...props} ref={ref} className={className} />;
  },
);

export const Pressable = React.forwardRef<any, PressableProps & { className?: string }>(
  ({ className, ...props }, ref) => {
    const Component = RNPressable as any;
    return <Component {...props} ref={ref} className={className} />;
  },
);
