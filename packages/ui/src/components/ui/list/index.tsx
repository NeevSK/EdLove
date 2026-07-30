import { cssInterop } from 'react-native-css-interop';
import React from 'react';
import {
  type FlatListProps,
  FlatList as RNFlatList,
  SectionList as RNSectionList,
  type SectionListProps,
} from 'react-native';

cssInterop(RNFlatList, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(RNSectionList, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

export const FlatList = React.forwardRef<
  RNFlatList,
  FlatListProps<any> & {
    className?: string;
    contentContainerClassName?: string;
  }
>(({ className, contentContainerClassName, ...props }, ref) => (
  <RNFlatList {...(props as any)} ref={ref} className={className} />
));

export const SectionList = React.forwardRef<
  RNSectionList,
  SectionListProps<any> & {
    className?: string;
    contentContainerClassName?: string;
  }
>(({ className, contentContainerClassName, ...props }, ref) => (
  <RNSectionList
    {...(props as any)}
    ref={ref}
    className={className}
    contentContainerStyle={props.contentContainerStyle}
  />
));

FlatList.displayName = 'FlatList';
SectionList.displayName = 'SectionList';

