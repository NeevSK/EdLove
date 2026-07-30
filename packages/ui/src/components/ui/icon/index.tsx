import { cssInterop } from 'react-native-css-interop';
import React from 'react';
import type { View } from 'react-native';
import { Svg } from 'react-native-svg';

// We ensure SVG components work with NativeWind v4
cssInterop(Svg, { className: 'style' });

export interface IIconProps {
  as?: React.ElementType;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  color?: string;
  fill?: string;
  strokeWidth?: number;
  style?: any;
}

const sizeMap: Record<string, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

/**
 * Sovereign Icon Primitive (Hardened v4)
 *
 * An elegant wrapper for Lucide and custom SVG icons.
 * Features:
 * - NativeWind v4 class support
 * - Semantic sizing (xs -> xl)
 * - Accessibility defaults (aria-hidden)
 * - Type-safe 'as' prop
 */
export const Icon = React.forwardRef<View, IIconProps>(
  (
    { as: As, size = 'md', className, color, fill = 'none', strokeWidth = 2, style, ...props },
    ref,
  ) => {
    if (!As) return null;

    const iconSize = typeof size === 'number' ? size : sizeMap[size] || 20;
    const Component = As as any;

    return (
      <Component
        {...props}
        ref={ref}
        size={iconSize}
        color={color}
        fill={fill}
        strokeWidth={strokeWidth}
        className={className}
        style={style}
        // Modern Accessibility
        aria-hidden="true"
        focusable={false}
      />
    );
  },
);

Icon.displayName = 'Icon';

