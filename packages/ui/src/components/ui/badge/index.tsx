import React from 'react';
import { type TextProps, type ViewProps, View as RNView } from 'react-native';
import { Text } from '@repo/ui/components/ui/text';
import { View } from '@repo/ui/components/ui/view';

export interface IBadgeProps extends ViewProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'solid';
  action?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted';
}

const Badge = React.forwardRef<RNView, IBadgeProps>(({ className, ...props }, ref) => (
  <View {...props} ref={ref} className={className} />
));

export interface IBadgeTextProps extends TextProps { className?: string }

const BadgeText = React.forwardRef<any, IBadgeTextProps>(({ className, ...props }, ref) => (
  <Text {...props} ref={ref} className={className} />
));

Badge.displayName = 'Badge';
BadgeText.displayName = 'BadgeText';
export { Badge, BadgeText };
