import type { FormConfig } from '../../types';

export type { FormConfig };

export type FormState<T extends Record<string, any>> = {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  submitError: string | null;
  submitSuccess: boolean;
};

export class FormManager<T extends Record<string, any>> {
  private state: FormState<T>;
  private subscribers: Set<(state: FormState<T>) => void> = new Set();
  public config: FormConfig<T>;

  constructor(config: FormConfig<T>) {
    this.config = config;

    const initialValues = {} as T;
    for (const key in config.fields) {
      (initialValues as Record<string, any>)[key] = config.fields[key].defaultValue ?? '';
    }

    this.state = {
      values: initialValues,
      errors: {},
      isSubmitting: false,
      isDirty: false,
      isValid: true,
      submitError: null,
      submitSuccess: false,
    };
  }

  public getState(): FormState<T> {
    return { ...this.state };
  }

  public getConfig(): FormConfig<T> {
    return this.config;
  }

  public subscribe(callback: (state: FormState<T>) => void): () => void {
    this.subscribers.add(callback);
    callback(this.state);
    return () => this.subscribers.delete(callback);
  }

  private notify() {
    this.subscribers.forEach((cb) => cb(this.state));
  }

  public setFieldValue<K extends keyof T>(field: K, value: T[K]) {
    this.state.values[field] = value;
    this.state.isDirty = true;
    this.validateField(field);
    this.notify();
  }

  public validateField(field: keyof T): boolean {
    const fieldConfig = this.config.fields[field];
    const value = this.state.values[field];

    // 1. Check required
    if (fieldConfig.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      this.state.errors[field] = `${fieldConfig.label} is required`;
    } else if (fieldConfig.validators) {
      // 2. Run custom validators
      let errorFound = false;
      for (const validator of fieldConfig.validators) {
        const result = validator(value);
        if (!result.isValid) {
          this.state.errors[field] = result.error;
          errorFound = true;
          break;
        }
      }
      if (!errorFound) {
        delete this.state.errors[field];
      }
    } else {
      delete this.state.errors[field];
    }

    this.state.isValid = Object.keys(this.state.errors).length === 0;
    return !this.state.errors[field];
  }

  public validate(): boolean {
    let allValid = true;
    for (const field in this.config.fields) {
      if (!this.validateField(field)) {
        allValid = false;
      }
    }
    this.state.isValid = allValid;
    this.notify();
    return allValid;
  }

  public async submit() {
    if (!this.validate()) return;

    this.state.isSubmitting = true;
    this.state.submitError = null;
    this.state.submitSuccess = false;
    this.notify();

    try {
      await this.config.onSubmit(this.state.values);
      this.state.submitSuccess = true;
    } catch (err) {
      this.state.submitError = err instanceof Error ? err.message : 'An error occurred';
      if (this.config.onError) this.config.onError(this.state.submitError);
    } finally {
      this.state.isSubmitting = false;
      this.notify();
    }
  }

  public reset() {
    const initialValues = {} as T;
    for (const key in this.config.fields) {
      (initialValues as Record<string, any>)[key] = this.config.fields[key].defaultValue ?? '';
    }

    this.state = {
      values: initialValues,
      errors: {},
      isSubmitting: false,
      isDirty: false,
      isValid: true,
      submitError: null,
      submitSuccess: false,
    };
    this.notify();
  }
}
