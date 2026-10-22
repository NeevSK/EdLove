import { AnalyticsEngine, type FieldAnalytics } from '@intuitui-labs/form-builder-engine/analytics';
import type {
  FormAnalytics,
  FormStorage,
  FormSync,
} from '@intuitui-labs/form-builder-engine/ports';
import type { FormResponse, FormSchema, FormPage, FormField } from '@intuitui-labs/form-builder-engine/schema';
import { getDrizzleDB } from '@repo/core/adapters/powersync/database';
import { formResponses, formTemplates } from '@repo/core/adapters/powersync/schema';
import { eq } from 'drizzle-orm';

export type ExtendedFormField = FormField;
export type ExtendedFormPage = FormPage;

export interface ExtendedFormSchema extends FormSchema {
  affordanceConfig?: Record<string, unknown>;
}

interface SerializedFormConfig {
  pages: FormPage[];
  settings?: FormSchema['settings'];
  affordanceConfig?: Record<string, unknown>;
}

function parseFormConfig(
  rawConfig: string,
  baseTemplate: { isPublished: boolean; slug?: string | null; category?: string | null },
): {
  pages: FormPage[];
  settings: FormSchema['settings'];
  affordanceConfig?: Record<string, unknown>;
} {
  try {
    const parsed = JSON.parse(rawConfig);
    if (Array.isArray(parsed)) {
      return {
        pages: parsed,
        settings: {
          isPublished: baseTemplate.isPublished,
          slug: baseTemplate.slug ?? undefined,
          category: baseTemplate.category ?? undefined,
        },
      };
    }

    const configObj = parsed as SerializedFormConfig;
    return {
      pages: configObj.pages || [],
      settings: {
        isPublished: baseTemplate.isPublished,
        slug: baseTemplate.slug ?? undefined,
        category: baseTemplate.category ?? undefined,
        ...configObj.settings,
      },
      affordanceConfig: configObj.affordanceConfig,
    };
  } catch {
    return {
      pages: [],
      settings: {
        isPublished: baseTemplate.isPublished,
        slug: baseTemplate.slug ?? undefined,
        category: baseTemplate.category ?? undefined,
      },
    };
  }
}

/**
 * PowerSyncFormsAdapter
 *
 * Implements the FormStorage, FormAnalytics, and FormSync ports using PowerSync Drizzle.
 * Provides client-side local-first, sub-millisecond query performance and continuous offline sync.
 */
export class PowerSyncFormsAdapter implements FormStorage, FormAnalytics, FormSync {
  /**
   * Save or update a form schema in the local SQLite database.
   */
  async save(form: FormSchema | ExtendedFormSchema): Promise<void> {
    const db = getDrizzleDB();
    const configPayload: SerializedFormConfig = {
      pages: form.pages,
      settings: form.settings,
      affordanceConfig: (form as ExtendedFormSchema).affordanceConfig,
    };

    const templateData: typeof formTemplates.$inferInsert = {
      id: form.id,
      ownerId: form.tenantId ?? 'anonymous',
      title: form.title,
      description: form.description || null,
      config: JSON.stringify(configPayload),
      isPublished: form.settings?.isPublished ?? false,
      slug: form.settings?.slug || null,
      category: form.settings?.category || null,
      createdAt: form.createdAt ?? new Date().toISOString(),
      updatedAt: form.updatedAt ?? new Date().toISOString(),
    };

    await db.insert(formTemplates).values(templateData).onConflictDoUpdate({
      target: formTemplates.id,
      set: templateData,
    });
  }

  /**
   * Load a form schema by ID from the local SQLite database.
   */
  async load(id: string): Promise<ExtendedFormSchema> {
    const db = getDrizzleDB();
    const templates = await db
      .select()
      .from(formTemplates)
      .where(eq(formTemplates.id, id))
      .limit(1);

    const template = templates[0];
    if (!template) {
      throw new Error(`Local form template not found: ${id}`);
    }

    const { pages, settings, affordanceConfig } = parseFormConfig(template.config, template);

    return {
      v: '1.0',
      id: template.id,
      tenantId: template.ownerId,
      title: template.title,
      description: template.description ?? undefined,
      pages,
      settings,
      affordanceConfig,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  /**
   * List all form schemas owned by a specific tenant in the local SQLite database.
   */
  async list(tenantId: string): Promise<ExtendedFormSchema[]> {
    const db = getDrizzleDB();
    const templates = await db
      .select()
      .from(formTemplates)
      .where(eq(formTemplates.ownerId, tenantId));

    return templates.map((template) => {
      const { pages, settings, affordanceConfig } = parseFormConfig(template.config, template);
      return {
        v: '1.0',
        id: template.id,
        tenantId: template.ownerId,
        title: template.title,
        description: template.description ?? undefined,
        pages,
        settings,
        affordanceConfig,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      };
    });
  }

  /**
   * Delete a form schema from the local SQLite database.
   */
  async delete(id: string): Promise<void> {
    const db = getDrizzleDB();
    await db.delete(formTemplates).where(eq(formTemplates.id, id));
  }

  /**
   * Submit and record a user's form response in the local SQLite database.
   */
  async record(formId: string, response: FormResponse): Promise<void> {
    const db = getDrizzleDB();
    const responseData = {
      id: response.id,
      templateId: formId,
      responderId: response.responderId || null,
      data: JSON.stringify(response.data),
      submittedAt: response.submittedAt,
    };

    await db.insert(formResponses).values(responseData);
  }

  /**
   * Fetch all locally recorded responses for a form template and compute aggregated stats.
   */
  async aggregate(formId: string): Promise<FieldAnalytics[]> {
    const db = getDrizzleDB();
    const schema = await this.load(formId);
    const fields: FormField[] = schema.pages.flatMap((page: any) => page.fields as FormField[]);

    const rawResponses = await db
      .select()
      .from(formResponses)
      .where(eq(formResponses.templateId, formId));

    const responses: FormResponse[] = rawResponses.map((r) => ({
      id: r.id,
      formId: r.templateId,
      responderId: r.responderId ?? undefined,
      tenantId: schema.tenantId ?? 'default',
      data: JSON.parse(r.data),
      submittedAt: r.submittedAt,
    }));

    return AnalyticsEngine.aggregate(fields, responses);
  }

  /**
   * Export all locally recorded responses for a form template as a CSV string.
   */
  async export(formId: string): Promise<string> {
    const db = getDrizzleDB();
    const schema = await this.load(formId);
    const fields: FormField[] = schema.pages.flatMap((page: any) => page.fields as FormField[]);

    const rawResponses = await db
      .select()
      .from(formResponses)
      .where(eq(formResponses.templateId, formId));

    const responses: FormResponse[] = rawResponses.map((r) => ({
      id: r.id,
      formId: r.templateId,
      responderId: r.responderId ?? undefined,
      tenantId: schema.tenantId ?? 'default',
      data: JSON.parse(r.data),
      submittedAt: r.submittedAt,
    }));

    return AnalyticsEngine.toCSV(fields, responses);
  }

  /**
   * Push schema changes. PowerSync continuous replication engine will automatically stream this.
   */
  async push(form: FormSchema): Promise<void> {
    await this.save(form);
  }

  /**
   * Pull records. Retreives locally available synced schema records since the specified date.
   */
  async pull(since: Date): Promise<FormSchema[]> {
    const db = getDrizzleDB();
    const templates = await db.select().from(formTemplates);

    return templates
      .map((template) => {
        const { pages, settings, affordanceConfig } = parseFormConfig(template.config, template);
        return {
          v: '1.0' as const,
          id: template.id,
          tenantId: template.ownerId,
          title: template.title,
          description: template.description ?? undefined,
          pages: pages as FormPage[],
          settings,
          affordanceConfig,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
        };
      })
      .filter((f) => new Date(f.updatedAt ?? 0) >= since);
  }

  /**
   * Resolve syncing conflicts. Follows the standard Last-Write-Wins (LWW) conflict strategy.
   */
  resolveConflict(local: FormSchema, remote: FormSchema): FormSchema {
    const localTime = new Date(local.updatedAt ?? 0).getTime();
    const remoteTime = new Date(remote.updatedAt ?? 0).getTime();
    return localTime >= remoteTime ? local : remote;
  }
}
