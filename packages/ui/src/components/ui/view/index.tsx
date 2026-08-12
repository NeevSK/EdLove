import React from 'react';
import type { ComponentType } from 'react';
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
import { styled } from 'nativewind';

const StyledView = styled(RNView);
const StyledScrollView = styled(RNScrollView as ComponentType<any>, {
  contentContainerClassName: 'contentContainerStyle',
});
const StyledPressable = styled(RNPressable as ComponentType<any>);
const StyledFlatList = styled(RNFlatList as ComponentType<any>, {
  contentContainerClassName: 'contentContainerStyle',
});
const StyledRefreshControl = styled(RNRefreshControl);
const StyledKeyboardAvoidingView = styled(RNKeyboardAvoidingView);
const StyledAnimatedView = styled(Animated.View as ComponentType<any>);

export const View = React.forwardRef<RNView, ViewProps & { className?: string }>(
  ({ className, ...props }, ref) => <StyledView {...props} ref={ref} className={className} />,
);
View.displayName = 'View';

export const ScrollView = React.forwardRef<
  RNScrollView,
  ScrollViewProps & { className?: string; contentContainerClassName?: string }
>(({ className, contentContainerClassName, ...props }, ref) => (
  <StyledScrollView
    {...props}
    ref={ref}
    className={className}
    contentContainerClassName={contentContainerClassName}
  />
));
ScrollView.displayName = 'ScrollView';

export const Pressable = React.forwardRef<RNView, PressableProps & { className?: string }>(
  ({ className, ...props }, ref) => <StyledPressable {...props} ref={ref} className={className} />,
);
Pressable.displayName = 'Pressable';

export const FlatList = React.forwardRef<
  RNFlatList,
  FlatListProps<any> & {
    className?: string;
    contentContainerClassName?: string;
  }
>(({ className, contentContainerClassName, ...props }, ref) => (
  <StyledFlatList
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
  <StyledRefreshControl {...props} ref={ref} className={className} />
));
RefreshControl.displayName = 'RefreshControl';

// Keep the public animated primitive while routing className through the v5 adapter.
export const AnimatedView: React.ComponentType<any> = StyledAnimatedView;

export const KeyboardAvoidingView = React.forwardRef<
  RNKeyboardAvoidingView,
  KeyboardAvoidingViewProps & { className?: string }
>(({ className, ...props }, ref) => (
  <StyledKeyboardAvoidingView {...props} ref={ref} className={className} />
));
KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';
