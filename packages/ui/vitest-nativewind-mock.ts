import React from 'react';

export function styled<T extends React.ElementType>(
  component: T,
  _options?: Record<string, string>,
): React.ComponentType<React.ComponentProps<T>> {
  return function StyledComponent(props: React.ComponentProps<T>) {
    const { className: _className, ...nativeProps } = props as React.ComponentProps<T> & {
      className?: string;
    };
    return React.createElement(component, nativeProps);
  };
}

export function cssInterop(): void {}
export function useCssElement<T extends React.ElementType>(
  component: T,
  props: React.ComponentProps<T>,
  _mapping?: Record<string, string>,
) {
  return React.createElement(component, props);
}
export function remapProps(): void {}
export function vars(): Record<string, never> {
  return {};
}

export const useColorScheme = () => ({ colorScheme: 'light' as const });
export const useUnstableNativeVariable = () => undefined;
export const styledComponent = (component: React.ComponentType<unknown>) => component;
