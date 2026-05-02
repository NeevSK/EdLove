import { cssInterop } from 'nativewind';
import React from 'react';
import {
  type FlatListProps,
  type KeyboardAvoidingViewProps,
  type PressableProps,
  type RefreshControlProps,
  FlatList as RNFlatList,
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  Pressable as RNPressable,
  RefreshControl as RNRefreshControl,
  ScrollView as RNScrollView,
  View as RNView,
  type ScrollViewProps,
  type ViewProps,
} from 'react-native';
import Animated from 'react-native-reanimated';

cssInterop(RNView, { className: 'style' });
cssInterop(RNScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(RNPressable, { className: 'style' });
cssInterop(RNFlatList, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(RNRefreshControl, { className: 'style' });
cssInterop(RNKeyboardAvoidingView, { className: 'style' });
cssInterop(Animated.View, { className: 'style' });

export const View = React.forwardRef<RNView, ViewProps & { className?: string }>(
  ({ className, ...props }, ref) => <RNView {...props} ref={ref} className={className} />,
);
View.displayName = 'View';

export const ScrollView = React.forwardRef<
  RNScrollView,
  ScrollViewProps & { className?: string; contentContainerClassName?: string }
>(({ className, contentContainerClassName, ...props }, ref) => (
  <RNScrollView
    {...props}
    ref={ref}
    className={className}
    contentContainerClassName={contentContainerClassName}
  />
));
ScrollView.displayName = 'ScrollView';

export const Pressable = React.forwardRef<RNView, PressableProps & { className?: string }>(
  ({ className, ...props }, ref) => <RNPressable {...props} ref={ref} className={className} />,
);
Pressable.displayName = 'Pressable';

export const FlatList = React.forwardRef<
  RNFlatList,
  FlatListProps<any> & {
    className?: string;
    contentContainerClassName?: string;
  }
>(({ className, contentContainerClassName, ...props }, ref) => (
  <RNFlatList
    {...props}
    ref={ref}
    className={className}
    contentContainerClassName={contentContainerClassName}
  />
));
export type FlatList = RNFlatList;
FlatList.displayName = 'FlatList';

export const RefreshControl = React.forwardRef<
  RNRefreshControl,
  RefreshControlProps & { className?: string }
>(({ className, ...props }, ref) => (
  <RNRefreshControl {...props} ref={ref} className={className} />
));
RefreshControl.displayName = 'RefreshControl';

// Redefine AnimatedView to ensure TypeScript knows about the className prop (via cssInterop)
// and handles Reanimated's special entering/exiting/layout props.
export const AnimatedView = Animated.View;

export const KeyboardAvoidingView = React.forwardRef<
  RNKeyboardAvoidingView,
  KeyboardAvoidingViewProps & { className?: string }
>(({ className, ...props }, ref) => (
  <RNKeyboardAvoidingView {...props} ref={ref} className={className} />
));
KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';
