export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'select'
  | 'textarea'
  | 'number'
  | 'heading'
  | 'divider'
  | 'slider'
  | 'likert';

export interface FormField {
  id: string;
  name: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  scaleType?: 'emoji' | 'numeric';
  order: number;
  config?: Record<string, any>;
  conditions?: any[];
}

export interface FieldDefinition {
  id: string;
  name: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: any;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  scaleType?: 'emoji' | 'numeric';
  config?: Record<string, any>;
}

export interface FormPage {
  id: string;
  title?: string;
  fields: FormField[];
  conditions?: any[];
}

export interface FormSettings {
  isPublished?: boolean;
  category?: string;
  slug?: string;
  [key: string]: any;
}

export interface FormSchema {
  v: '1.0';
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  pages: FormPage[];
  settings: FormSettings;
  createdAt: string;
  updatedAt: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  responderId?: string;
  tenantId: string;
  data: Record<string, any>;
  submittedAt: string;
}
