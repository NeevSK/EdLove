import { styled } from 'nativewind';
import React, { type ComponentType } from 'react';
import { ScrollView as RNScrollView, type ScrollViewProps } from 'react-native';

const StyledScrollView = styled(RNScrollView as ComponentType<any>, {
  contentContainerClassName: 'contentContainerStyle',
});

export interface IScrollViewProps extends ScrollViewProps {
  className?: string;
  contentContainerClassName?: string;
}

const ScrollView = React.forwardRef<any, IScrollViewProps>(
  ({ className, contentContainerClassName, ...props }, ref) => (
    <StyledScrollView {...props} ref={ref} {...({ className, contentContainerClassName } as any)} />
  ),
);

ScrollView.displayName = 'ScrollView';

export { ScrollView };
