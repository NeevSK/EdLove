import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from '@repo/ui/components/ui/form-control';
import { cn } from '@repo/ui/utils/classNames';
import type { ReactNode } from 'react';
import React from 'react';

export interface FormFieldProps {
  id?: string;
  label: ReactNode;
  children: ReactNode;
  helperText?: ReactNode;
  errorText?: ReactNode;
  isDisabled?: boolean;
  className?: string;
}

/** A compact field contract that keeps label, help, and error semantics consistent. */
export function FormField({
  id,
  label,
  children,
  helperText,
  errorText,
  isDisabled,
  className,
}: FormFieldProps) {
  const isInvalid = Boolean(errorText);

  return (
    <FormControl id={id} isDisabled={isDisabled} isInvalid={isInvalid} className={cn(className)}>
      <FormControlLabel>
        <FormControlLabelText>{label}</FormControlLabelText>
      </FormControlLabel>
      {children}
      {isInvalid ? (
        <FormControlError>
          <FormControlErrorText>{errorText}</FormControlErrorText>
        </FormControlError>
      ) : helperText ? (
        <FormControlHelper>
          <FormControlHelperText>{helperText}</FormControlHelperText>
        </FormControlHelper>
      ) : null}
    </FormControl>
  );
}
