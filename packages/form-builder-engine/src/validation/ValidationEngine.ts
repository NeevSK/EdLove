import type { FormSchema } from '../schema/FormSchema';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const ValidationEngine = {
  email(email: string): ValidationResult {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.trim().length === 0) {
      return { isValid: false, error: 'Email is required' };
    }
    if (!regex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }
    return { isValid: true };
  },

  nonEmpty(value: string, fieldName: string = 'Field'): ValidationResult {
    if (!value || value.trim().length === 0) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    return { isValid: true };
  },

  number(value: unknown): ValidationResult {
    const num = Number(value);
    if (value === undefined || value === null || value === '' || Number.isNaN(num)) {
      return { isValid: false, error: 'Must be a number' };
    }
    return { isValid: true };
  },

  validateField(
    value: unknown,
    required: boolean,
    validatorName?: 'email' | 'nonEmpty' | 'number',
    label: string = 'Field',
  ): ValidationResult {
    // 1. Check required
    if (
      required &&
      (value === undefined || value === null || (typeof value === 'string' && value.trim() === ''))
    ) {
      return { isValid: false, error: `${label} is required` };
    }

    if (value === undefined || value === null || value === '') {
      return { isValid: true };
    }

    // 2. Map & run validator
    if (validatorName) {
      if (validatorName === 'email') {
        return this.email(String(value));
      }
      if (validatorName === 'nonEmpty') {
        return this.nonEmpty(String(value), label);
      }
      if (validatorName === 'number') {
        return this.number(value);
      }
    }

    return { isValid: true };
  },

  validateForm(
    payload: Record<string, unknown>,
    schema: FormSchema
  ): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    for (const page of schema.pages) {
      for (const field of page.fields) {
        // Skip purely visual layout elements
        if (field.type === 'heading' || field.type === 'divider') {
          continue;
        }

        const value = payload[field.name];
        
        // Auto-select helper validator based on field type
        let validatorName: 'email' | 'nonEmpty' | 'number' | undefined = undefined;
        if (field.type === 'email') {
          validatorName = 'email';
        } else if (field.type === 'number') {
          validatorName = 'number';
        } else if (field.required) {
          validatorName = 'nonEmpty';
        }

        const result = this.validateField(
          value,
          field.required,
          validatorName,
          field.label || field.name
        );

        if (!result.isValid && result.error) {
          errors[field.name] = result.error;
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

