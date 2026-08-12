import React from 'react';
import { TextInput as RNTextInput, type TextInputProps } from 'react-native';
import { styled } from 'react-native-css';

const StyledTextInput = styled(RNTextInput as React.ComponentType<any>);

export interface ITextInputProps extends TextInputProps {
  className?: string;
}

const TextInput = React.forwardRef<any, ITextInputProps>(({ className, ...props }, ref) => (
  <StyledTextInput {...props} ref={ref} className={className} />
));

TextInput.displayName = 'TextInput';

export { TextInput };
