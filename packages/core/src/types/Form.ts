import type { ValidationResult } from '../logic/utils/validators';

export type FieldType = 'text' | 'email' | 'password' | 'select' | 'textarea' | 'number';

export interface FormFieldConfig<T = any> {
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  defaultValue?: T;
  options?: { label: string; value: string }[];
  validators?: Array<(value: any) => ValidationResult>;
}

export interface FieldDefinition extends FormFieldConfig {
  id: string;
  name: string;
}

export interface FormConfig<T extends Record<string, any> = any> {
  fields: { [K in keyof T]: FormFieldConfig<T[K]> };
  onSubmit: (values: T) => Promise<void> | void;
  onError?: (error: string) => void;
}

export interface DynamicFormConfig {
  fields: {
    [key: string]: {
      label: string;
      type: FieldType;
      placeholder?: string;
      required?: boolean;
      options?: { label: string; value: string }[];
    };
  };
}

export interface FormTemplate {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  config: FieldDefinition[];
  is_published: boolean;
  slug?: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface FormResponse {
  id: string;
  template_id: string;
  responder_id?: string;
  data: Record<string, any>;
  submitted_at: string;
}
