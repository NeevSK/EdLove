/**
 * INPUT VALIDATION UTILITIES
 *
 * Comprehensive validation functions for form inputs.
 * Prevents invalid data from reaching the API and provides user-friendly error messages.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validators = {
  /**
   * Validates email format
   */
  email: (email: string): ValidationResult => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.trim().length === 0) {
      return { isValid: false, error: 'Email is required' };
    }
    if (!regex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }
    return { isValid: true };
  },

  /**
   * Validates password strength
   * Requirements: min 8 chars, uppercase, lowercase, number
   */
  password: (password: string): ValidationResult => {
    if (!password) {
      return { isValid: false, error: 'Password is required' };
    }
    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, error: 'Password must contain an uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, error: 'Password must contain a lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, error: 'Password must contain a number' };
    }
    return { isValid: true };
  },

  /**
   * Validates non-empty string
   */
  nonEmpty: (value: string, fieldName: string = 'Field'): ValidationResult => {
    if (!value || value.trim().length === 0) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    return { isValid: true };
  },

  /**
   * Validates maximum length
   */
  maxLength: (value: string, max: number, fieldName: string = 'Field'): ValidationResult => {
    if (value.length > max) {
      return { isValid: false, error: `${fieldName} must be less than ${max} characters` };
    }
    return { isValid: true };
  },

  /**
   * Validates minimum length
   */
  minLength: (value: string, min: number, fieldName: string = 'Field'): ValidationResult => {
    if (value.length < min) {
      return { isValid: false, error: `${fieldName} must be at least ${min} characters` };
    }
    return { isValid: true };
  },

  /**
   * Validates numeric range
   */
  numberRange: (
    value: number,
    min: number,
    max: number,
    fieldName: string = 'Value',
  ): ValidationResult => {
    if (isNaN(value)) {
      return { isValid: false, error: `${fieldName} must be a number` };
    }
    if (value < min || value > max) {
      return { isValid: false, error: `${fieldName} must be between ${min} and ${max}` };
    }
    return { isValid: true };
  },

  /**
   * Validates date format
   */
  date: (dateString: string): ValidationResult => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Invalid date format' };
    }
    return { isValid: true };
  },

  /**
   * Validates mood score (1-5)
   */
  mood: (score: number): ValidationResult => {
    return validators.numberRange(score, 1, 5, 'Mood score');
  },

  /**
   * Validates grade level (1-13 for Sri Lankan system)
   */
  gradeLevel: (grade: number): ValidationResult => {
    return validators.numberRange(grade, 1, 13, 'Grade level');
  },

  /**
   * Validates marks (0-100)
   */
  marks: (marks: number): ValidationResult => {
    return validators.numberRange(marks, 0, 100, 'Marks');
  },

  /**
   * Validates phone number (Sri Lankan format)
   */
  phoneNumber: (phone: string): ValidationResult => {
    const regex = /^(\+94[0-9]{9}|0[0-9]{9})$/;
    if (!phone || phone.trim().length === 0) {
      return { isValid: false, error: 'Phone number is required' };
    }
    const cleanPhone = phone.replace(/\s/g, '');
    if (!regex.test(cleanPhone)) {
      return {
        isValid: false,
        error: 'Invalid phone number format. Use +94XXXXXXXXX or 0XXXXXXXXX',
      };
    }
    return { isValid: true };
  },

  /**
   * Validates URL format
   */
  url: (url: string): ValidationResult => {
    try {
      new URL(url);
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  },
};

/**
 * Validates multiple form fields at once
 */
export function validateForm<T extends Record<string, any>>(
  values: T,
  rules: Partial<Record<keyof T, (value: any) => ValidationResult>>,
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } {
  const errors: Partial<Record<keyof T, string>> = {};
  let isValid = true;

  for (const [field, validator] of Object.entries(rules)) {
    if (validator) {
      const result = validator(values[field]);
      if (!result.isValid) {
        errors[field as keyof T] = result.error;
        isValid = false;
      }
    }
  }

  return { isValid, errors };
}

/**
 * Validates a single field with multiple validators
 */
export function validateWithRules<T>(
  value: T,
  validators: Array<(value: T) => ValidationResult>,
): ValidationResult {
  for (const validator of validators) {
    const result = validator(value);
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
}
