import React from 'react';
import { ScrollView as RNScrollView, type ScrollViewProps } from 'react-native';
import { cssInterop } from 'nativewind';

cssInterop(RNScrollView, { className: 'style' });

export interface IScrollViewProps extends ScrollViewProps {
  className?: string;
}

const ScrollView = React.forwardRef<any, IScrollViewProps>(
  ({ className, ...props }, ref) => (
    <RNScrollView {...props} ref={ref} {...({ className } as any)} />
  )
);

ScrollView.displayName = 'ScrollView';

export { ScrollView };
