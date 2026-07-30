import { cssInterop } from 'react-native-css-interop';
import React from 'react';
import { Text as RNText, type TextProps } from 'react-native';

const StyledText = RNText;

cssInterop(StyledText, {
  className: {
    target: 'style',
  },
});

export interface ITextProps extends TextProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  bold?: boolean;
}

const Text = React.forwardRef<RNText, ITextProps>(
  ({ className, size = 'md', bold, ...props }, ref) => {
    // Mapping size to tailwind classes if needed,
    // or just relying on className from the consumer.
    const sizeClass = size ? `text-${size}` : '';
    const weightClass = bold ? 'font-bold' : '';

    return (
      <StyledText
        {...props}
        ref={ref}
        className={`${sizeClass} ${weightClass} ${className || ''}`}
      />
    );
  },
);

Text.displayName = 'Text';

export { Text };

