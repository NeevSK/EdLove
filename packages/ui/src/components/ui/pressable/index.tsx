import { sensoryFeedback, type SensoryEvent } from '@repo/ui/sensory';
import { styled } from 'nativewind';
import React, { type ComponentType } from 'react';
import { Platform, type PressableProps, Pressable as RNPressable } from 'react-native';

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
  /**
   * Sensory tactile/acoustic feedback on press-in.
   * Defaults to 'press'. Set to false to disable feedback for high-frequency or nested handlers.
   */
  sensory?: SensoryEvent | boolean;
}

const Pressable = ({
  ref,
  className,
  href,
  hrefAttrs,
  onPress,
  onPressIn,
  style,
  disabled,
  sensory = 'press',
  ...props
}: IPressableProps & { ref?: any }) => {
  const resolvedStyle =
    Platform.OS === 'web' && !disabled
      ? typeof style === 'function'
        ? (state: any) => [{ cursor: 'pointer' }, style(state)]
        : [{ cursor: 'pointer' }, style]
      : style;

  const handlePressIn = (event: any) => {
    if (!disabled && sensory !== false) {
      const eventType: SensoryEvent = typeof sensory === 'string' ? sensory : 'press';
      sensoryFeedback.emit(eventType);
    }
    onPressIn?.(event);
  };

  return (
    <StyledRNPressable
      {...props}
      ref={ref}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPress={onPress}
      style={resolvedStyle}
      {...({ className, href, hrefAttrs } as any)}
    />
  );
};

Pressable.displayName = 'Pressable';

export { Pressable };
