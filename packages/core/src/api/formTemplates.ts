/**
 * Form Templates & Responses API
 *
 * API methods for managing custom form designs and their submissions.
 */

import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { formResponse, formsContract, formTemplate } from '@repo/core/api/forms.contract';
import {
  APIError,
  type FormResponse,
  type FormTemplate,
  type PaginationParams,
} from '@repo/core/types';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

const parse = async <T>(
  response: Response,
  schema: { parse: (value: unknown) => T },
  message: string,
) => {
  if (!response.ok) throw new APIError(message, response.status.toString());
  return schema.parse(await response.json());
};

const pageQuery = (params: PaginationParams) => ({
  limit: params.limit ?? 50,
  offset: params.offset ?? 0,
});

export const formTemplatesAPI = {
  /**
   * Create a new form template
   */
  async create(
    template: Omit<FormTemplate, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<FormTemplate> {
    return parse(
      await (client.api as any).forms.templates.$post({
        json: {
          title: template.title,
          description: template.description ?? null,
          config: template.config,
          is_published: template.is_published,
          slug: template.slug ?? null,
          category: template.category ?? null,
        },
      }),
      formTemplate,
      'Failed to create form template',
    ) as unknown as Promise<FormTemplate>;
  },

  /**
   * Get a template by ID
   */
  async getById(id: string): Promise<FormTemplate> {
    return parse(
      await (client.api as any).forms.templates[':id'].$get({ param: { id } }),
      formTemplate,
      'Failed to fetch form template',
    ) as unknown as Promise<FormTemplate>;
  },

  /**
   * Get a template by slug (Public)
   */
  async getBySlug(slug: string): Promise<FormTemplate> {
    return parse(
      await (client.api as any).forms.templates.slug[':slug'].$get({ param: { slug } }),
      formTemplate,
      'Failed to fetch form template by slug',
    ) as unknown as Promise<FormTemplate>;
  },

  /**
   * Get all templates for an owner
   */
  async getByOwner(ownerId: string, params: PaginationParams = {}): Promise<FormTemplate[]> {
    const response = await (client.api as any).forms.owners[':ownerId'].templates.$get({
      param: { ownerId },
      query: pageQuery(params),
    });
    if (!response.ok)
      throw new APIError('Failed to fetch user templates', response.status.toString());
    return (await response.json()).map((row: unknown) => formTemplate.parse(row)) as FormTemplate[];
  },

  /**
   * Update a template
   */
  async update(id: string, updates: Partial<FormTemplate>): Promise<FormTemplate> {
    return parse(
      await (client.api as any).forms.templates[':id'].$patch({
        param: { id },
        json: {
          title: updates.title,
          description: updates.description,
          config: updates.config,
          is_published: updates.is_published,
          slug: updates.slug,
          category: updates.category,
        },
      }),
      formTemplate,
      'Failed to update form template',
    ) as unknown as Promise<FormTemplate>;
  },

  /**
   * Delete a template
   */
  async delete(id: string): Promise<void> {
    const response = await (client.api as any).forms.templates[':id'].$delete({ param: { id } });
    if (!response.ok)
      throw new APIError('Failed to delete form template', response.status.toString());
  },

  /**
   * Submit a response to a form
   */
  async submitResponse(response: Omit<FormResponse, 'id' | 'submitted_at'>): Promise<FormResponse> {
    return parse(
      await (client.api as any).forms.responses.$post({
        json: { template_id: response.template_id, data: response.data },
      }),
      formResponse,
      'Failed to submit form response',
    ) as Promise<FormResponse>;
  },

  /**
   * Get responses for a template (Owner only)
   */
  async getResponses(templateId: string, params: PaginationParams = {}): Promise<FormResponse[]> {
    const response = await (client.api as any).forms.templates[':templateId'].responses.$get({
      param: { templateId },
      query: pageQuery(params),
    });
    if (!response.ok)
      throw new APIError('Failed to fetch form responses', response.status.toString());
    return (await response.json()).map((row: unknown) => formResponse.parse(row)) as FormResponse[];
  },
};

void formsContract;
