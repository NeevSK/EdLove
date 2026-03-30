import React from 'react';
import { VStack, Box, SanctuaryInput, SanctuaryButton } from '@repo/ui';
import { useForm } from '@repo/core';
import type { FormManager } from '@repo/core';


interface NativeFormProps<T extends Record<string, any>> {
  manager: FormManager<T>;
  submitLabel?: string;
}

/**
 * A reusable React Native form component that uses the shared FormManager.
 */
export default function NativeForm<T extends Record<string, any>>({
  manager,
  submitLabel = 'Submit'
}: NativeFormProps<T>) {
  const state = useForm(manager);
  const config = manager.getConfig();

  return (
    <VStack space="md" width="100%"
      {(Object.keys(config.fields) as (keyof T)[]).map((fieldName) => {
        const field = config.fields[fieldName];
        return (
          <Box key={fieldName as string}
            <SanctuaryInput
              label={field.label}
              placeholder={field.placeholder}
              value={(state.values[fieldName] as string) || ''}
              onChangeText={(val) => manager.setFieldValue(fieldName, val as any)}
              error={state.errors[fieldName]}
              isInvalid={!!state.errors[fieldName]}
              type={field.type === 'password' ? 'password' : 'text'}
              keyboardType={
                field.type === 'email' ? 'email-address' : 
                field.type === 'number' ? 'numeric' : 'default'
              }
              multiline={field.type === 'textarea'}
              numberOfLines={field.type === 'textarea' ? 4 : 1}
            /
          </Box
        );
      })}

      <SanctuaryButton
        onPress={() => manager.submit()}
        isLoading={state.isSubmitting}
        isDisabled={state.isSubmitting}
        fullWidth
      
        {submitLabel}
      </SanctuaryButton

      {state.submitError && (
        <Box sx={{ marginTop: '$2' }}
          {/* You could add a specialized error alert component here */}
        </Box
      )}
    </VStack
  );
}
