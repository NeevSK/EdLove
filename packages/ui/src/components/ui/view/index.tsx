import React from 'react';
import { View as RNView, ScrollView as RNScrollView, Pressable as RNPressable, type ViewProps, type ScrollViewProps, type PressableProps } from 'react-native';
import { cssInterop } from 'nativewind';

cssInterop(RNView, { className: 'style' });
cssInterop(RNScrollView, { className: 'style' });
cssInterop(RNPressable, { className: 'style' });

export const View = React.forwardRef<RNView, ViewProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <RNView {...props} ref={ref} className={className} />
  )
);
View.displayName = 'View';

export const ScrollView = React.forwardRef<RNScrollView, ScrollViewProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <RNScrollView {...props} ref={ref} className={className} />
  )
);
ScrollView.displayName = 'ScrollView';

export const Pressable = React.forwardRef<RNView, PressableProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <RNPressable {...props} ref={ref} className={className} />
  )
);
Pressable.displayName = 'Pressable';
