import React from 'react';
import { 
    View as RNView, 
    ScrollView as RNScrollView, 
    Pressable as RNPressable, 
    FlatList as RNFlatList,
    RefreshControl as RNRefreshControl,
    type ViewProps, 
    type ScrollViewProps, 
    type PressableProps,
    type FlatListProps,
    type RefreshControlProps
} from 'react-native';
import { cssInterop } from 'nativewind';
import Animated from 'react-native-reanimated';

cssInterop(RNView, { className: 'style' });
cssInterop(RNScrollView, { className: 'style' });
cssInterop(RNPressable, { className: 'style' });
cssInterop(RNFlatList, { className: 'style' });
cssInterop(RNRefreshControl, { className: 'style' });
cssInterop(Animated.View, { className: 'style' });

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

export const FlatList = React.forwardRef<RNFlatList, FlatListProps<any> & { className?: string }>(
    ({ className, ...props }, ref) => (
      <RNFlatList {...props} ref={ref as any} className={className} />
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
// Using 'as any' here as a surgical fix because Reanimated types are complex, 
// but in a full repo we'd use a more precise intersection type.
