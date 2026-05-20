import { type FormConfig, FormManager } from '../manager/FormManager';
import { ValidationEngine } from '../validation/ValidationEngine';

export class FormHydrator {
  /**
   * Creates a FormManager from a raw JSON object.
   * Handles mapping validator names to ValidationEngine calls.
   */
  static hydrate<T extends Record<string, any>>(
    json: any,
    onSubmit: (values: T) => Promise<void> | void,
  ): FormManager<T> {
    const fields: any = {};

    // Handle both array of fields and object-based fields mapping for compatibility
    const jsonFields = Array.isArray(json.fields)
      ? json.fields
      : json.fields
        ? Object.entries(json.fields).map(([name, f]: [string, any]) => ({ name, ...f }))
        : [];

    jsonFields.forEach((field: any) => {
      fields[field.name] = {
        ...field,
        validators: field.validate ? [FormHydrator.mapValidator(field.validate)] : undefined,
      };
    });

    const config: FormConfig<T> = {
      fields,
      onSubmit,
    };

    return new FormManager<T>(config);
  }

  private static mapValidator(
    validatorName: string,
  ): (val: any) => { isValid: boolean; error?: string } {
    const validatorMap: Record<string, any> = {
      email: ValidationEngine.email,
      nonEmpty: (val: any) => ValidationEngine.nonEmpty(val, 'Field'),
      number: ValidationEngine.number,
    };

    return validatorMap[validatorName] || ((_: any) => ({ isValid: true }));
  }
}
