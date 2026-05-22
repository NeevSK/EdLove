import { type FormConfig, type FormFieldConfig, FormManager } from '../manager/FormManager';
import { ValidationEngine } from '../validation/ValidationEngine';

export interface HydratedFieldDefinition {
  name: string;
  label?: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: unknown;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  scaleType?: 'emoji' | 'numeric';
  validate?: string;
  validators?: Array<(value: unknown) => { isValid: boolean; error?: string }>;
  [key: string]: unknown;
}

export interface HydrationPayload {
  fields?: HydratedFieldDefinition[] | Record<string, HydratedFieldDefinition>;
  [key: string]: unknown;
}

export class FormHydrator {
  /**
   * Creates a FormManager from a raw JSON object.
   * Handles mapping validator names to ValidationEngine calls.
   */
  static hydrate<T extends Record<string, unknown>>(
    json: HydrationPayload,
    onSubmit: (values: T) => Promise<void> | void,
  ): FormManager<T> {
    const fields: Record<string, FormFieldConfig<unknown>> = {};

    // Handle both array of fields and object-based fields mapping for compatibility
    const jsonFields = Array.isArray(json.fields)
      ? json.fields
      : json.fields
        ? Object.entries(json.fields).map(([name, f]) => ({
            ...(f as HydratedFieldDefinition),
            name,
          }))
        : [];

    jsonFields.forEach((field) => {
      fields[field.name] = {
        ...field,
        validators: field.validate ? [FormHydrator.mapValidator(field.validate)] : undefined,
      };
    });

    const config: FormConfig<T> = {
      fields: fields as FormConfig<T>['fields'],
      onSubmit,
    };

    return new FormManager<T>(config as FormConfig<T>);
  }

  private static mapValidator(
    validatorName: string,
  ): (val: unknown) => { isValid: boolean; error?: string } {
    const validatorMap: Record<string, (value: unknown) => { isValid: boolean; error?: string }> = {
      email: (val: unknown) => ValidationEngine.email(String(val ?? '')),
      nonEmpty: (val: unknown) => ValidationEngine.nonEmpty(String(val ?? ''), 'Field'),
      number: (val: unknown) => ValidationEngine.number(val),
    };

    return validatorMap[validatorName] || (() => ({ isValid: true }));
  }
}
