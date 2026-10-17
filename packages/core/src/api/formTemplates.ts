/**
 * Form Templates & Responses API
 *
 * API methods for managing custom form designs and their submissions.
 */

import { orpcClient } from '@repo/core/api/orpcClient';
import { formResponse, formsContract, formTemplate } from '@repo/core/api/forms.contract';
import {
  APIError,
  type FormResponse,
  type FormTemplate,
  type PaginationParams,
} from '@repo/core/types';

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
    try {
      const res = await orpcClient.forms.create({
        body: {
          title: template.title,
          description: template.description ?? null,
          config: template.config,
          is_published: template.is_published,
          slug: template.slug ?? null,
          category: template.category ?? null,
        },
      });
      return formTemplate.parse(res) as unknown as FormTemplate;
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to create form template',
        error.status?.toString() || error.code || 'FORM_CREATE_FAILED',
      );
    }
  },

  /**
   * Get a template by ID
   */
  async getById(id: string): Promise<FormTemplate> {
    try {
      const res = await orpcClient.forms.getById({
        params: { id },
      });
      return formTemplate.parse(res) as unknown as FormTemplate;
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to fetch form template',
        error.status?.toString() || error.code || 'FORM_FETCH_FAILED',
      );
    }
  },

  /**
   * Get a template by slug (Public)
   */
  async getBySlug(slug: string): Promise<FormTemplate> {
    try {
      const res = await orpcClient.forms.getBySlug({
        params: { slug },
      });
      return formTemplate.parse(res) as unknown as FormTemplate;
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to fetch form template by slug',
        error.status?.toString() || error.code || 'FORM_FETCH_FAILED',
      );
    }
  },

  /**
   * Get all templates for an owner
   */
  async getByOwner(ownerId: string, params: PaginationParams = {}): Promise<FormTemplate[]> {
    try {
      const res = await orpcClient.forms.getByOwner({
        params: { ownerId },
        query: pageQuery(params),
      });
      return (res as unknown[]).map((row) => formTemplate.parse(row)) as unknown as FormTemplate[];
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to fetch user templates',
        error.status?.toString() || error.code || 'FORM_FETCH_FAILED',
      );
    }
  },

  /**
   * Update a template
   */
  async update(id: string, updates: Partial<FormTemplate>): Promise<FormTemplate> {
    try {
      const res = await orpcClient.forms.update({
        params: { id },
        body: {
          title: updates.title,
          description: updates.description,
          config: updates.config,
          is_published: updates.is_published,
          slug: updates.slug,
          category: updates.category,
        },
      });
      return formTemplate.parse(res) as unknown as FormTemplate;
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to update form template',
        error.status?.toString() || error.code || 'FORM_UPDATE_FAILED',
      );
    }
  },

  /**
   * Delete a template
   */
  async delete(id: string): Promise<void> {
    try {
      await orpcClient.forms.delete({
        params: { id },
      });
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to delete form template',
        error.status?.toString() || error.code || 'FORM_DELETE_FAILED',
      );
    }
  },

  /**
   * Submit a response to a form
   */
  async submitResponse(response: Omit<FormResponse, 'id' | 'submitted_at'>): Promise<FormResponse> {
    try {
      const res = await orpcClient.forms.submitResponse({
        body: { template_id: response.template_id, data: response.data },
      });
      return formResponse.parse(res) as FormResponse;
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to submit form response',
        error.status?.toString() || error.code || 'FORM_SUBMIT_FAILED',
      );
    }
  },

  /**
   * Get responses for a template (Owner only)
   */
  async getResponses(templateId: string, params: PaginationParams = {}): Promise<FormResponse[]> {
    try {
      const res = await orpcClient.forms.getResponses({
        params: { templateId },
        query: pageQuery(params),
      });
      return (res as unknown[]).map((row) => formResponse.parse(row)) as FormResponse[];
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to fetch form responses',
        error.status?.toString() || error.code || 'FORM_RESPONSES_FAILED',
      );
    }
  },
};

void formsContract;
