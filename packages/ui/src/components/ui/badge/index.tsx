import { cssInterop } from 'react-native-css-interop';
import React from 'react';
import { Text, type TextProps, View, type ViewProps } from 'react-native';

cssInterop(View, { className: 'style' });
cssInterop(Text, { className: 'style' });

export interface IBadgeProps extends ViewProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'solid';
  action?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted';
}

const Badge = React.forwardRef<View, IBadgeProps>(({ className, ...props }, ref) => {
  return <View {...props} ref={ref} className={className} />;
});

export interface IBadgeTextProps extends TextProps {
  className?: string;
}

const BadgeText = React.forwardRef<Text, IBadgeTextProps>(({ className, ...props }, ref) => {
  return <Text {...props} ref={ref} className={className} />;
});

Badge.displayName = 'Badge';
BadgeText.displayName = 'BadgeText';

export { Badge, BadgeText };

