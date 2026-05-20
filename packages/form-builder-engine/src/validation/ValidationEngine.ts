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

  number(value: any): ValidationResult {
    const num = Number(value);
    if (value === undefined || value === null || value === '' || Number.isNaN(num)) {
      return { isValid: false, error: 'Must be a number' };
    }
    return { isValid: true };
  },

  validateField(
    value: any,
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
        return this.email(value);
      }
      if (validatorName === 'nonEmpty') {
        return this.nonEmpty(value, label);
      }
      if (validatorName === 'number') {
        return this.number(value);
      }
    }

    return { isValid: true };
  },
};
