import { cssInterop } from 'react-native-css-interop';
import type React from 'react';
import { createContext, useContext } from 'react';
import { Text as RNText, type TextProps, type ViewProps } from 'react-native';
import { View } from '@repo/ui/primitives';

cssInterop(View, { className: 'style' });
cssInterop(RNText, { className: 'style' });

export interface IFormControlProps extends ViewProps {
  isInvalid?: boolean;
  isDisabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

type FormControlContextType = Pick<IFormControlProps, 'isInvalid' | 'isDisabled'>;

const FormControlContext = createContext<FormControlContextType>({});

export const FormControl = ({
  isInvalid,
  isDisabled,
  className,
  children,
  ...props
}: ViewProps & {
  isInvalid?: boolean;
  isDisabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <FormControlContext.Provider value={{ isInvalid, isDisabled }}>
      <View {...props} className={`w-full ${className || ''}`}>
        {children}
      </View>
    </FormControlContext.Provider>
  );
};

export const useFormControl = () => useContext(FormControlContext);

export const FormControlLabel = ({ className, ...props }: ViewProps & { className?: string }) => (
  <View {...props} className={`mb-2 ${className || ''}`} />
);

export const FormControlLabelText = ({
  className,
  ...props
}: TextProps & { className?: string }) => (
  <RNText {...props} className={`text-sm font-medium text-textSecondary ${className || ''}`} />
);

export const FormControlError = ({ className, ...props }: ViewProps & { className?: string }) => {
  const { isInvalid } = useFormControl();
  if (!isInvalid) return null;
  return <View {...props} className={`mt-1 flex-row items-center gap-1 ${className || ''}`} />;
};

export const FormControlErrorIcon = ({ as: Icon, className, color, size, ...props }: any) => {
  const { isInvalid } = useFormControl();
  if (!isInvalid || !Icon) return null;
  return <Icon {...props} size={size || 16} color={color || '#EF4444'} className={className} />;
};

export const FormControlErrorText = ({
  className,
  ...props
}: TextProps & { className?: string }) => (
  <RNText {...props} className={`text-xs text-error ${className || ''}`} />
);

export const FormControlHelper = ({ className, ...props }: ViewProps & { className?: string }) => (
  <View {...props} className={`mt-1 ${className || ''}`} />
);

export const FormControlHelperText = ({
  className,
  ...props
}: TextProps & { className?: string }) => (
  <RNText {...props} className={`mt-1 text-xs text-textSecondary ${className || ''}`} />
);

