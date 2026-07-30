import { cssInterop } from 'react-native-css-interop';
import React from 'react';
import { TextInput as RNTextInput, type TextInputProps } from 'react-native';

cssInterop(RNTextInput, { className: 'style' });

export interface ITextInputProps extends TextInputProps {
  className?: string;
}

const TextInput = React.forwardRef<any, ITextInputProps>(({ className, ...props }, ref) => (
  <RNTextInput {...props} ref={ref} {...({ className } as any)} />
));

TextInput.displayName = 'TextInput';

export { TextInput };

