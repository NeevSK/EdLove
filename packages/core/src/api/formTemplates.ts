/**
 * Form Templates & Responses API
 *
 * API methods for managing custom form designs and their submissions.
 */

import { APIError, type FormResponse, type FormTemplate, type PaginationParams } from '../types';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from './supabase';

export const formTemplatesAPI = {
  /**
   * Create a new form template
   */
  async create(
    template: Omit<FormTemplate, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<FormTemplate> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('form_templates')
      .insert([template])
      .select()
      .single();

    if (error) {
      throw new APIError('Failed to create form template', error.code, error);
    }

    return data;
  },

  /**
   * Get a template by ID
   */
  async getById(id: string): Promise<FormTemplate> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('form_templates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new APIError('Failed to fetch form template', error.code, error);
    }

    if (!data) {
      throw new APIError('Form template not found', 'NOT_FOUND');
    }

    return data;
  },

  /**
   * Get a template by slug (Public)
   */
  async getBySlug(slug: string): Promise<FormTemplate> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('form_templates')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (error) {
      throw new APIError('Failed to fetch form template by slug', error.code, error);
    }

    if (!data) {
      throw new APIError('Public form template not found', 'NOT_FOUND');
    }

    return data;
  },

  /**
   * Get all templates for an owner
   */
  async getByOwner(ownerId: string, params: PaginationParams = {}): Promise<FormTemplate[]> {
    let query = __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('form_templates')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (params.limit) query = query.limit(params.limit);
    if (params.offset) query = query.range(params.offset, params.offset + (params.limit || 10) - 1);

    const { data, error } = await query;

    if (error) {
      throw new APIError('Failed to fetch user templates', error.code, error);
    }

    return data || [];
  },

  /**
   * Update a template
   */
  async update(id: string, updates: Partial<FormTemplate>): Promise<FormTemplate> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('form_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new APIError('Failed to update form template', error.code, error);
    }

    return data;
  },

  /**
   * Delete a template
   */
  async delete(id: string): Promise<void> {
    const { error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('form_templates')
      .delete()
      .eq('id', id);

    if (error) {
      throw new APIError('Failed to delete form template', error.code, error);
    }
  },

  /**
   * Submit a response to a form
   */
  async submitResponse(response: Omit<FormResponse, 'id' | 'submitted_at'>): Promise<FormResponse> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('form_responses')
      .insert([response])
      .select()
      .single();

    if (error) {
      throw new APIError('Failed to submit form response', error.code, error);
    }

    return data;
  },

  /**
   * Get responses for a template (Owner only)
   */
  async getResponses(templateId: string, params: PaginationParams = {}): Promise<FormResponse[]> {
    let query = __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('form_responses')
      .select('*')
      .eq('template_id', templateId)
      .order('submitted_at', { ascending: false });

    if (params.limit) query = query.limit(params.limit);
    if (params.offset) query = query.range(params.offset, params.offset + (params.limit || 10) - 1);

    const { data, error } = await query;

    if (error) {
      throw new APIError('Failed to fetch form responses', error.code, error);
    }

    return data || [];
  },
};
