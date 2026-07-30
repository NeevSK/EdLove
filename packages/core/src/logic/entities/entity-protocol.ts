import type { FormConfig } from '@repo/core/logic/forms/form-manager';

export type EntityType =
  | 'user'
  | 'group'
  | 'school'
  | 'classroom'
  | 'social_link'
  | 'community_group';

export type EntityMode = 'view' | 'public' | 'create' | 'edit' | 'preview' | 'compact';

export interface EntityDefinition<_T = any> {
  type: EntityType;
  id?: string;
  schema?: any; // Structured metadata
  formConfig?: FormConfig;
  components?: {
    view?: string; // Standard full view
    public?: string; // Public-facing profile
    edit?: string; // Multi-step or custom editor
    create?: string; // Multi-step or custom creator
  };
  permissions?: {
    canEdit: boolean;
    canDelete: boolean;
    canShare: boolean;
  };
}

export interface EntityInstance<T = any> {
  id: string;
  type: EntityType;
  definition: EntityDefinition<T>;
  data: T;
  metadata?: {
    created_at?: string;
    updated_at?: string;
    owner_id?: string;
  };
}
