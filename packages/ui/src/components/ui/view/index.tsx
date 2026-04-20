import React from 'react';
import { 
    View as RNView, 
    ScrollView as RNScrollView, 
    Pressable as RNPressable, 
    FlatList as RNFlatList,
    RefreshControl as RNRefreshControl,
    KeyboardAvoidingView as RNKeyboardAvoidingView,
    type ViewProps, 
    type ScrollViewProps, 
    type PressableProps,
    type FlatListProps,
    type RefreshControlProps,
    type KeyboardAvoidingViewProps
} from 'react-native';
import { cssInterop } from 'nativewind';
import Animated from 'react-native-reanimated';

cssInterop(RNView, { className: 'style' });
cssInterop(RNScrollView, { 
    className: 'style',
    contentContainerClassName: 'contentContainerStyle' 
});
cssInterop(RNPressable, { className: 'style' });
cssInterop(RNFlatList, { 
    className: 'style',
    contentContainerClassName: 'contentContainerStyle'
});
cssInterop(RNRefreshControl, { className: 'style' });
cssInterop(RNKeyboardAvoidingView, { className: 'style' });
cssInterop(Animated.View, { className: 'style' });

export const View = React.forwardRef<RNView, ViewProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <RNView {...props} ref={ref} className={className} />
  )
);
View.displayName = 'View';

export const ScrollView = React.forwardRef<RNScrollView, ScrollViewProps & { className?: string; contentContainerClassName?: string }>(
  ({ className, contentContainerClassName, ...props }, ref) => (
    <RNScrollView {...props} ref={ref} className={className} contentContainerClassName={contentContainerClassName} />
  )
);
ScrollView.displayName = 'ScrollView';

export const Pressable = React.forwardRef<RNView, PressableProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <RNPressable {...props} ref={ref} className={className} />
  )
);
Pressable.displayName = 'Pressable';

export const FlatList = React.forwardRef<RNFlatList, FlatListProps<any> & { className?: string; contentContainerClassName?: string }>(
    ({ className, contentContainerClassName, ...props }, ref) => (
      <RNFlatList {...props} ref={ref as any} className={className} contentContainerClassName={contentContainerClassName} />
    )
);
FlatList.displayName = 'FlatList';

export const RefreshControl = React.forwardRef<RNRefreshControl, RefreshControlProps & { className?: string }>(
    ({ className, ...props }, ref) => (
      <RNRefreshControl {...props} ref={ref as any} className={className} />
    )
);
RefreshControl.displayName = 'RefreshControl';

// Redefine AnimatedView to ensure TypeScript knows about the className prop (via cssInterop)
// and handles Reanimated's special entering/exiting/layout props.
export const AnimatedView = Animated.View as any; 

export const KeyboardAvoidingView = React.forwardRef<RNKeyboardAvoidingView, KeyboardAvoidingViewProps & { className?: string }>(
    ({ className, ...props }, ref) => (
      <RNKeyboardAvoidingView {...props} ref={ref as any} className={className} />
    )
);
KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';
