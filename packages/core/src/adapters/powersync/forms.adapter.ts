import {
  type AggregatedStats,
  AnalyticsEngine,
  type FormAnalytics,
  type FormResponse,
  type FormSchema,
  type FormStorage,
  type FormSync,
} from '@intuitui-labs/form-builder-engine';
import { eq } from 'drizzle-orm';
import { getDrizzleDB } from './database';
import { formResponses, formTemplates } from './schema';

/**
 * PowerSyncFormsAdapter
 *
 * Implements the FormStorage, FormAnalytics, and FormSync ports using PowerSync Drizzle.
 * Provides client-side local-first, sub-millisecond query performance and continuous offline sync.
 */
export class PowerSyncFormsAdapter implements FormStorage, FormAnalytics, FormSync {
  // ─── FormStorage Port Implementation (Offline-First Local DB) ───────────────

  /**
   * Save or update a form schema in the local SQLite database.
   */
  async save(form: FormSchema): Promise<void> {
    const db = getDrizzleDB();
    const templateData = {
      id: form.id,
      ownerId: form.tenantId,
      title: form.title,
      description: form.description || null,
      config: JSON.stringify(form.pages), // Store multi-page structure in text column
      isPublished: form.settings.isPublished ?? false,
      slug: form.settings.slug || null,
      category: form.settings.category || null,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    };

    await db.insert(formTemplates).values(templateData).onConflictDoUpdate({
      target: formTemplates.id,
      set: templateData,
    });
  }

  /**
   * Load a form schema by ID from the local SQLite database.
   */
  async load(id: string): Promise<FormSchema> {
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

    return {
      v: '1.0',
      id: template.id,
      tenantId: template.ownerId,
      title: template.title,
      description: template.description ?? undefined,
      pages: JSON.parse(template.config),
      settings: {
        isPublished: template.isPublished,
        slug: template.slug ?? undefined,
        category: template.category ?? undefined,
      },
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  /**
   * List all form schemas owned by a specific tenant in the local SQLite database.
   */
  async list(tenantId: string): Promise<FormSchema[]> {
    const db = getDrizzleDB();
    const templates = await db
      .select()
      .from(formTemplates)
      .where(eq(formTemplates.ownerId, tenantId));

    return templates.map((template) => ({
      v: '1.0',
      id: template.id,
      tenantId: template.ownerId,
      title: template.title,
      description: template.description ?? undefined,
      pages: JSON.parse(template.config),
      settings: {
        isPublished: template.isPublished,
        slug: template.slug ?? undefined,
        category: template.category ?? undefined,
      },
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    }));
  }

  /**
   * Delete a form schema from the local SQLite database.
   */
  async delete(id: string): Promise<void> {
    const db = getDrizzleDB();
    await db.delete(formTemplates).where(eq(formTemplates.id, id));
  }

  // ─── FormAnalytics Port Implementation (Local Response Engine) ──────────────

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
  async aggregate(formId: string): Promise<AggregatedStats[]> {
    const db = getDrizzleDB();
    const schema = await this.load(formId);
    const fields = schema.pages.flatMap((page) => page.fields);

    const rawResponses = await db
      .select()
      .from(formResponses)
      .where(eq(formResponses.templateId, formId));

    const responses: FormResponse[] = rawResponses.map((r) => ({
      id: r.id,
      formId: r.templateId,
      responderId: r.responderId ?? undefined,
      tenantId: schema.tenantId,
      data: JSON.parse(r.data),
      submittedAt: r.submittedAt,
    }));

    return AnalyticsEngine.aggregate(fields, responses) as AggregatedStats[];
  }

  /**
   * Export all locally recorded responses for a form template as a CSV string.
   */
  async export(formId: string): Promise<string> {
    const db = getDrizzleDB();
    const schema = await this.load(formId);
    const fields = schema.pages.flatMap((page) => page.fields);

    const rawResponses = await db
      .select()
      .from(formResponses)
      .where(eq(formResponses.templateId, formId));

    const responses: FormResponse[] = rawResponses.map((r) => ({
      id: r.id,
      formId: r.templateId,
      responderId: r.responderId ?? undefined,
      tenantId: schema.tenantId,
      data: JSON.parse(r.data),
      submittedAt: r.submittedAt,
    }));

    return AnalyticsEngine.toCSV(fields, responses);
  }

  // ─── FormSync Port Implementation (Continuous Synced Tunnel) ───────────────

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
      .map((template) => ({
        v: '1.0' as const,
        id: template.id,
        tenantId: template.ownerId,
        title: template.title,
        description: template.description ?? undefined,
        pages: JSON.parse(template.config),
        settings: {
          isPublished: template.isPublished,
          slug: template.slug ?? undefined,
          category: template.category ?? undefined,
        },
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      }))
      .filter((f) => new Date(f.updatedAt) >= since);
  }

  /**
   * Resolve syncing conflicts. Follows the standard Last-Write-Wins (LWW) conflict strategy.
   */
  resolveConflict(local: FormSchema, remote: FormSchema): FormSchema {
    const localTime = new Date(local.updatedAt).getTime();
    const remoteTime = new Date(remote.updatedAt).getTime();
    return localTime >= remoteTime ? local : remote;
  }
}
