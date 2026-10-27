import { AnalyticsEngine, type FieldAnalytics } from '@intuitui-labs/form-builder-engine/analytics';
import type { FormAnalytics, FormStorage } from '@intuitui-labs/form-builder-engine/ports';
import type {
  FieldDefinition,
  FormPage,
  FormResponse,
  FormSchema,
} from '@intuitui-labs/form-builder-engine/schema';
import { CanonicalAccountIdSchema } from '@repo/core/logic/schemas/identity.schema';
import { APIError } from '@repo/core/types/API';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * SupabaseFormsAdapter
 *
 * Implements the FormStorage and FormAnalytics ports for the Supabase backend.
 * Provides offline-compatible schemas and aggregated reporting pipelines.
 */
export class SupabaseFormsAdapter implements FormStorage, FormAnalytics {
  constructor(private supabase: SupabaseClient) {}

  private async currentAccountId(): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.rpc('get_my_id');
      const account = CanonicalAccountIdSchema.nullable().safeParse(data);
      if (error || !account.success) throw new Error('Unresolved account');
      return account.data;
    } catch {
      throw new APIError(
        'Form account resolution is unavailable.',
        'IDENTITY_RESOLUTION_UNAVAILABLE',
      );
    }
  }

  // ─── FormStorage Port Implementation ───────────────────────────────────────

  private parseFormConfig(
    rawConfig: unknown,
    baseTemplate: { is_published: boolean; slug?: string | null; category?: string | null },
  ): {
    pages: FormPage[];
    settings: FormSchema['settings'];
    affordanceConfig?: Record<string, unknown>;
  } {
    try {
      const parsed = typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig;
      if (Array.isArray(parsed)) {
        return {
          pages: parsed as FormPage[],
          settings: {
            isPublished: baseTemplate.is_published,
            slug: baseTemplate.slug ?? undefined,
            category: baseTemplate.category ?? undefined,
          },
        };
      }

      const configObj = parsed as {
        pages?: FormPage[];
        settings?: FormSchema['settings'];
        affordanceConfig?: Record<string, unknown>;
      };

      return {
        pages: configObj?.pages || [],
        settings: {
          isPublished: baseTemplate.is_published,
          slug: baseTemplate.slug ?? undefined,
          category: baseTemplate.category ?? undefined,
          ...configObj?.settings,
        },
        affordanceConfig: configObj?.affordanceConfig,
      };
    } catch {
      return {
        pages: [],
        settings: {
          isPublished: baseTemplate.is_published,
          slug: baseTemplate.slug ?? undefined,
          category: baseTemplate.category ?? undefined,
        },
      };
    }
  }

  /**
   * Save or update a form schema in the Supabase database.
   */
  async save(form: FormSchema): Promise<void> {
    const ownerId = await this.currentAccountId();
    if (!ownerId) throw new APIError('Sign in before saving a form.', 'AUTH_REQUIRED');
    if (form.tenantId && form.tenantId !== ownerId) {
      throw new APIError('The form owner does not match the signed-in account.', 'FORBIDDEN');
    }
    const configPayload = {
      pages: form.pages,
      settings: form.settings,
      affordanceConfig: form.affordanceConfig,
    };

    const templateData = {
      id: form.id,
      owner_id: ownerId,
      title: form.title,
      description: form.description || null,
      config: configPayload,
      is_published: form.settings?.isPublished ?? false,
      slug: form.settings?.slug || null,
      category: form.settings?.category || null,
      created_at: form.createdAt ?? new Date().toISOString(),
      updated_at: form.updatedAt ?? new Date().toISOString(),
    };

    const { error } = await this.supabase
      .from('form_templates')
      .upsert(templateData, { onConflict: 'id' });

    if (error) {
      throw new APIError('Failed to save form template in Supabase', error.code, error);
    }
  }

  /**
   * Load a form schema by ID from the Supabase database.
   */
  async load(id: string): Promise<FormSchema> {
    const { data: template, error } = await this.supabase
      .from('form_templates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new APIError('Failed to load form template from Supabase', error.code, error);
    }
    if (!template) {
      throw new APIError(`Form template not found: ${id}`, 'NOT_FOUND');
    }

    const { pages, settings, affordanceConfig } = this.parseFormConfig(template.config, template);

    return {
      v: '1.0',
      id: template.id,
      tenantId: template.owner_id,
      title: template.title,
      description: template.description ?? undefined,
      pages,
      settings,
      affordanceConfig,
      createdAt: template.created_at,
      updatedAt: template.updated_at,
    };
  }

  /**
   * List all form schemas owned by a specific tenant in the Supabase database.
   */
  async list(tenantId: string): Promise<FormSchema[]> {
    const { data: templates, error } = await this.supabase
      .from('form_templates')
      .select('*')
      .eq('owner_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new APIError('Failed to list form templates from Supabase', error.code, error);
    }

    return (templates || []).map((template) => {
      const { pages, settings, affordanceConfig } = this.parseFormConfig(template.config, template);
      return {
        v: '1.0',
        id: template.id,
        tenantId: template.owner_id,
        title: template.title,
        description: template.description ?? undefined,
        pages,
        settings,
        affordanceConfig,
        createdAt: template.created_at,
        updatedAt: template.updated_at,
      };
    });
  }

  /**
   * Delete a form schema from the Supabase database.
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('form_templates').delete().eq('id', id);

    if (error) {
      throw new APIError('Failed to delete form template from Supabase', error.code, error);
    }
  }

  // ─── FormAnalytics Port Implementation ─────────────────────────────────────

  /**
   * Submit and record a user's form response in the Supabase database.
   */
  async record(formId: string, response: FormResponse): Promise<void> {
    const responderId = await this.currentAccountId();
    if (response.responderId && response.responderId !== responderId) {
      throw new APIError('The responder does not match the signed-in account.', 'FORBIDDEN');
    }
    const responseData = {
      id: response.id,
      template_id: formId,
      responder_id: responderId,
      data: response.data,
      submitted_at: response.submittedAt,
    };

    const { error } = await this.supabase.from('form_responses').insert([responseData]);

    if (error) {
      throw new APIError('Failed to record form response in Supabase', error.code, error);
    }
  }

  /**
   * Fetch all recorded responses for a form template and compute aggregated stats.
   */
  async aggregate(formId: string): Promise<FieldAnalytics[]> {
    const schema = await this.load(formId);
    const fields: FieldDefinition[] = schema.pages.flatMap((page) => page.fields);

    const { data: rawResponses, error } = await this.supabase
      .from('form_responses')
      .select('*')
      .eq('template_id', formId);

    if (error) {
      throw new APIError('Failed to fetch form responses for aggregation', error.code, error);
    }

    const responses: FormResponse[] = (rawResponses || []).map((r) => ({
      id: r.id,
      formId: r.template_id,
      responderId: r.responder_id ?? undefined,
      tenantId: schema.tenantId ?? 'default',
      data: typeof r.data === 'string' ? JSON.parse(r.data) : r.data,
      submittedAt: r.submitted_at,
    }));

    return AnalyticsEngine.aggregate(fields, responses);
  }

  /**
   * Export all recorded responses for a form template as a CSV string.
   */
  async export(formId: string): Promise<string> {
    const schema = await this.load(formId);
    const fields: FieldDefinition[] = schema.pages.flatMap((page) => page.fields);

    const { data: rawResponses, error } = await this.supabase
      .from('form_responses')
      .select('*')
      .eq('template_id', formId);

    if (error) {
      throw new APIError('Failed to fetch form responses for CSV export', error.code, error);
    }

    const responses: FormResponse[] = (rawResponses || []).map((r) => ({
      id: r.id,
      formId: r.template_id,
      responderId: r.responder_id ?? undefined,
      tenantId: schema.tenantId ?? 'default',
      data: typeof r.data === 'string' ? JSON.parse(r.data) : r.data,
      submittedAt: r.submitted_at,
    }));

    return AnalyticsEngine.toCSV(fields, responses);
  }
}
