import { cssInterop } from 'react-native-css-interop';
import React from 'react';
import { ScrollView as RNScrollView, type ScrollViewProps } from 'react-native';

cssInterop(RNScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

export interface IScrollViewProps extends ScrollViewProps {
  className?: string;
  contentContainerClassName?: string;
}

const ScrollView = React.forwardRef<any, IScrollViewProps>(
  ({ className, contentContainerClassName, ...props }, ref) => (
    <RNScrollView {...props} ref={ref} {...({ className, contentContainerClassName } as any)} />
  ),
);

ScrollView.displayName = 'ScrollView';

export { ScrollView };

