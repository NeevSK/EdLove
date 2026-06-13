import type {
  FormManager,
  FormState,
  MultiStepFormManager,
} from '@intuitui-labs/form-builder-engine/core';
import {
  Box,
  Button,
  ButtonText,
  Divider,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Pressable,
  Spinner,
  Text,
  Textarea,
  TextareaInput,
  VStack,
} from '@repo/ui/primitives';

import { Info } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';

interface NativeFormProps<T extends Record<string, any>> {
  manager?: FormManager<T>;
  multiStepManager?: MultiStepFormManager<T>;
  submitLabel?: string;
}

export default function NativeForm<T extends Record<string, any>>({
  manager,
  multiStepManager,
  submitLabel = 'Submit',
}: NativeFormProps<T>) {
  const activeManager = multiStepManager ? multiStepManager.getFormManager() : manager;

  if (!activeManager) {
    throw new Error('NativeForm requires either a manager or a multiStepManager prop.');
  }

  const [state, setState] = useState<FormState<T>>(() => activeManager.getState());
  const [currentPageIndex, setCurrentPageIndex] = useState(
    multiStepManager ? multiStepManager.getCurrentPageIndex() : 0,
  );

  useEffect(() => {
    setState(activeManager.getState());
    const unsubManager = activeManager.subscribe((next) => {
      setState({ ...next });
    });

    let unsubMulti: (() => void) | undefined;
    if (multiStepManager) {
      unsubMulti = multiStepManager.subscribe((m) => {
        setCurrentPageIndex(m.getCurrentPageIndex());
      });
    }

    return () => {
      unsubManager();
      if (unsubMulti) unsubMulti();
    };
  }, [activeManager, multiStepManager]);

  const fieldsToRender = useMemo(() => {
    if (multiStepManager) {
      const page = multiStepManager.getCurrentPage();
      return page.fields;
    }
    const config = activeManager.getConfig();
    return Object.keys(config.fields).map((name) => ({
      name,
      ...config.fields[name],
    }));
  }, [activeManager, multiStepManager, currentPageIndex]);

  const handleNextOrSubmit = () => {
    const run = async () => {
      if (multiStepManager) {
        if (multiStepManager.isLastStep()) {
          await multiStepManager.submit();
        } else {
          multiStepManager.nextStep();
        }
      } else {
        await activeManager.submit();
      }
    };
    void run();
  };

  const isLastStep = multiStepManager ? multiStepManager.isLastStep() : true;
  const showBackButton = multiStepManager && !multiStepManager.isFirstStep();

  return (
    <VStack className="w-full gap-10">
      {/* Pagination / Step Indicator */}
      {multiStepManager && (
        <VStack className="gap-2">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Step {currentPageIndex + 1} of {multiStepManager.getTotalPages()}
          </Text>
          <HStack className="gap-1.5 w-full">
            {multiStepManager.getPages().map((_, idx) => (
              <Box
                key={idx}
                className={`h-1.5 flex-1 rounded-full ${
                  idx <= currentPageIndex ? 'bg-teal-600' : 'bg-slate-100'
                }`}
              />
            ))}
          </HStack>
        </VStack>
      )}

      {fieldsToRender.map((field: any) => {
        const fieldName = field.name as keyof T;
        const value = (state.values as Record<string, any>)[fieldName as string];
        const error = (state.errors as Record<string, any>)[fieldName as string];

        // 1. Layout: Headings
        if (field.type === 'heading') {
          return (
            <Box key={fieldName as string} className="pt-4 first:pt-0">
              <Heading size="md" className="flex-row items-center gap-3">
                {field.label}
              </Heading>
            </Box>
          );
        }

        // 2. Layout: Dividers
        if (field.type === 'divider') {
          return <Divider key={fieldName as string} className="w-full bg-slate-100" />;
        }

        return (
          <VStack key={fieldName as string} className="w-full gap-3 group">
            {field.label && (
              <HStack className="items-center justify-between">
                <Text className="text-[13px] font-bold uppercase tracking-wider text-slate-500 group-focus-within:text-teal-700">
                  {field.label}
                </Text>
                {field.required && (
                  <Box className="bg-teal-50 px-2 py-0.5 rounded-full">
                    <Text className="text-[10px] font-bold text-teal-600">REQUIRED</Text>
                  </Box>
                )}
              </HStack>
            )}

            {renderField(fieldName, field, value, activeManager, error)}

            {error && (
              <HStack className="items-center gap-2">
                <Icon as={Info} size="xs" className="text-rose-600" />
                <Text className="text-xs font-bold text-rose-600">{String(error)}</Text>
              </HStack>
            )}
          </VStack>
        );
      })}

      <HStack className="pt-6 gap-4 w-full">
        {showBackButton && (
          <Button
            onPress={() => multiStepManager.prevStep()}
            variant="outline"
            className="h-[64px] flex-1 rounded-2xl border-slate-200"
          >
            <ButtonText className="text-lg font-bold text-slate-700">Back</ButtonText>
          </Button>
        )}

        <Button
          onPress={handleNextOrSubmit}
          isDisabled={state.isSubmitting}
          className={`h-[64px] rounded-2xl bg-teal-700 shadow-lg active:scale-[0.98] ${
            showBackButton ? 'flex-[2]' : 'w-full'
          }`}
        >
          {state.isSubmitting ? (
            <HStack className="items-center gap-3">
              <Spinner size="small" className="text-white" />
              <ButtonText className="text-lg font-bold text-white">Broadcasting...</ButtonText>
            </HStack>
          ) : (
            <ButtonText className="text-lg font-bold text-white">
              {isLastStep ? submitLabel : 'Next Step'}
            </ButtonText>
          )}
        </Button>
      </HStack>

      {state.submitError && (
        <HStack className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 items-center gap-3">
          <Icon as={Info} size="sm" className="text-rose-700" />
          <Text className="text-sm font-medium text-rose-700">{String(state.submitError)}</Text>
        </HStack>
      )}
    </VStack>
  );
}

function renderField<T extends Record<string, any>>(
  name: keyof T,
  field: any,
  value: any,
  manager: FormManager<T>,
  error: any,
) {
  const commonClass = `w-full rounded-2xl border bg-white px-5 py-4 text-base font-medium text-slate-900 ${
    error ? 'border-rose-300' : 'border-slate-200'
  }`;

  switch (field.type) {
    case 'textarea':
      return (
        <Textarea className={`min-h-[120px] ${commonClass}`}>
          <TextareaInput
            placeholder={field.placeholder}
            value={value || ''}
            onChangeText={(val) => manager.setFieldValue(name, val as any)}
            className="text-base"
          />
        </Textarea>
      );
    case 'select':
      return (
        <Box className={commonClass}>
          <Text className="text-slate-400">
            {value
              ? field.options?.find((o: any) => o.value === value)?.label
              : field.placeholder || 'Please select...'}
          </Text>
        </Box>
      );
    case 'slider':
      return (
        <VStack className="space-y-4 py-2 px-1">
          <HStack className="w-full h-2 bg-slate-100 rounded-lg" />
          <HStack className="justify-between px-1">
            <Text className="text-[11px] font-bold text-slate-400">MIN</Text>
            <Box className="bg-teal-50 px-2 py-0.5 rounded-md">
              <Text className="text-[11px] font-bold text-teal-700 uppercase">
                LEVEL {value || field.defaultValue || 3}
              </Text>
            </Box>
            <Text className="text-[11px] font-bold text-slate-400">MAX</Text>
          </HStack>
        </VStack>
      );
    case 'likert': {
      const max = 5;
      const isEmoji = field.scaleType === 'emoji';
      const emojis = ['😫', '🙁', '😐', '🙂', '😊'];

      return (
        <HStack className="items-center justify-between gap-2 py-2">
          {Array.from({ length: max }).map((_, i) => {
            const val = i + 1;
            const isSelected = (value || field.defaultValue) === val;
            return (
              <Pressable
                key={val}
                onPress={() => manager.setFieldValue(name, val as any)}
                className={`flex-1 items-center justify-center p-4 rounded-2xl border-2 ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50 shadow-sm'
                    : 'border-slate-100 bg-slate-50'
                }`}
              >
                {isEmoji ? (
                  <Text className={`text-2xl mb-1 ${isSelected ? '' : 'opacity-50'}`}>
                    {emojis[i]}
                  </Text>
                ) : (
                  <Text
                    className={`text-lg font-bold ${isSelected ? 'text-teal-700' : 'text-slate-400'}`}
                  >
                    {val}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </HStack>
      );
    }
    default:
      return (
        <Input className={commonClass}>
          <InputField
            type={field.type === 'number' ? 'number' : 'text'}
            placeholder={field.placeholder}
            value={value || ''}
            onChangeText={(val) =>
              manager.setFieldValue(name, (field.type === 'number' ? parseFloat(val) : val) as any)
            }
            className="text-base"
          />
        </Input>
      );
  }
}
