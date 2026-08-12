import React from 'react';
import {
  type FlatListProps,
  FlatList as RNFlatList,
  SectionList as RNSectionList,
  type SectionListProps,
} from 'react-native';
import { styled } from 'react-native-css';

const StyledFlatList = styled(RNFlatList as React.ComponentType<any>, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
const StyledSectionList = styled(RNSectionList as React.ComponentType<any>, {
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
  <StyledFlatList
    {...(props as any)}
    ref={ref}
    className={className}
    contentContainerClassName={contentContainerClassName}
  />
));

export const SectionList = React.forwardRef<
  RNSectionList,
  SectionListProps<any> & {
    className?: string;
    contentContainerClassName?: string;
  }
>(({ className, contentContainerClassName, ...props }, ref) => (
  <StyledSectionList
    {...(props as any)}
    ref={ref}
    className={className}
    contentContainerClassName={contentContainerClassName}
  />
));

FlatList.displayName = 'FlatList';
SectionList.displayName = 'SectionList';
