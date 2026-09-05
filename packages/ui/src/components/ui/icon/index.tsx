import React from 'react';
import type { View } from 'react-native';
import { useCssElement } from 'react-native-css';

const iconMapping = { className: 'style' } as const;

const DynamicIcon = ({
  component: Component,
  ...props
}: { component: React.ComponentType<any> } & Record<string, any>) =>
  useCssElement(Component, props, iconMapping);

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
 * Sovereign Icon Primitive.
 *
 * The dynamic SVG component is wrapped once per `as` component. This keeps
 * NativeWind v5 styling local to the actual SVG implementation without
 * globally mutating the react-native-svg base component.
 */
export const Icon = React.forwardRef<View, IIconProps>(
  (
    { as: As, size = 'md', className, color, fill = 'none', strokeWidth = 2, style, ...props },
    ref,
  ) => {
    const iconSize = typeof size === 'number' ? size : sizeMap[size] || 20;
    const Component = As as React.ComponentType<any> | undefined;
    if (!Component) return null;

    return (
      <DynamicIcon
        component={Component}
        {...props}
        ref={ref}
        size={iconSize}
        color={color}
        fill={fill}
        strokeWidth={strokeWidth}
        className={className}
        style={style}
        aria-hidden="true"
        focusable={false}
      />
    );
  },
);

Icon.displayName = 'Icon';
