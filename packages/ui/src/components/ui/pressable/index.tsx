import { styled } from 'nativewind';
import type { ComponentType } from 'react';
import React from 'react';
import { type PressableProps, Pressable as RNPressable } from 'react-native';

// NativeWind v5's recursive styled() inference hits TS2590 for Pressable's
// conditional props. Narrow only the input component boundary; the public
// wrapper below retains the explicit PressableProps/ref contract.
const StyledRNPressable = styled(RNPressable as ComponentType<PressableProps>);

export interface IPressableProps extends PressableProps {
  className?: string;
  href?: string;
  hrefAttrs?: {
    target?: string;
    rel?: string;
    download?: string;
  };
}

const Pressable = React.forwardRef<any, IPressableProps>(
  ({ className, href, hrefAttrs, ...props }, ref) => (
    <StyledRNPressable
      {...props}
      ref={ref}
      {...({ className, href, hrefAttrs } as any)}
    />
  ),
);

Pressable.displayName = 'Pressable';

export { Pressable };
