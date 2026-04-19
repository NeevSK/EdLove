import React from 'react';
import { View } from 'react-native';

export interface IIconProps {
  as?: any;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  color?: string;
  fill?: string;
  strokeWidth?: number;
  style?: any;
}

const sizeMap: Record<string, number> = {
  'xs': 12,
  'sm': 16,
  'md': 20,
  'lg': 24,
  'xl': 32,
};

export const Icon = React.forwardRef<View, IIconProps>(
  ({ as: As, size = 'md', className, color, fill, strokeWidth = 2, style, ...props }, ref) => {
    if (!As) return null;

    const iconSize = typeof size === 'number' ? size : (sizeMap[size] || 20);

    const Component = As as any;
    return (
      <Component {...props} ref={ref} size={iconSize} color={color} fill={fill} strokeWidth={strokeWidth} className={className} style={style} />
    );
  }
);

Icon.displayName = 'Icon';
