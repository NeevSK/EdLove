import type { SovereignContract } from '@repo/core/api/contracts';
import { z } from 'zod';

const formConfig = z.array(z.record(z.string(), z.unknown()));
const formTemplate = z.object({
  id: z.string().uuid(),
  owner_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  config: formConfig,
  is_published: z.boolean(),
  slug: z.string().nullable(),
  category: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
const formResponse = z.object({
  id: z.string().uuid(),
  template_id: z.string().uuid(),
  responder_id: z.string().uuid().nullable(),
  data: z.record(z.string(), z.unknown()),
  submitted_at: z.string().datetime(),
});
const page = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
const ownerBody = z.object({ owner_id: z.string().uuid().optional() });
const templateFields = {
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  config: formConfig,
  is_published: z.boolean().optional(),
  slug: z.string().trim().min(1).max(200).nullable().optional(),
  category: z.string().trim().max(100).nullable().optional(),
};

const formAuthority = (action: 'read' | 'create' | 'update' | 'delete') =>
  ({
    policy: { action, subject: 'FormTemplate' },
  }) as const;

export const formsContract = {
  create: {
    method: 'post',
    path: '/forms/templates',
    request: { body: z.object(templateFields) },
    responses: { 201: { schema: formTemplate, description: 'Create a form template' } },
    metadata: formAuthority('create'),
  },
  getById: {
    method: 'get',
    path: '/forms/templates/:id',
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: { 200: { schema: formTemplate, description: 'Get a visible form template' } },
    metadata: formAuthority('read'),
  },
  getBySlug: {
    method: 'get',
    path: '/forms/templates/slug/:slug',
    request: { params: z.object({ slug: z.string().trim().min(1).max(200) }) },
    responses: {
      200: { schema: formTemplate, description: 'Get a published form template by slug' },
    },
    metadata: formAuthority('read'),
  },
  getByOwner: {
    method: 'get',
    path: '/forms/owners/:ownerId/templates',
    request: {
      params: z.object({ ownerId: z.string().uuid() }),
      query: page,
    },
    responses: { 200: { schema: z.array(formTemplate), description: 'List owned form templates' } },
    metadata: formAuthority('read'),
  },
  update: {
    method: 'patch',
    path: '/forms/templates/:id',
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: z.object(templateFields).partial(),
    },
    responses: { 200: { schema: formTemplate, description: 'Update an owned form template' } },
    metadata: formAuthority('update'),
  },
  delete: {
    method: 'delete',
    path: '/forms/templates/:id',
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: {
        schema: z.object({ success: z.literal(true) }),
        description: 'Delete an owned form template',
      },
    },
    metadata: formAuthority('delete'),
  },
  submitResponse: {
    method: 'post',
    path: '/forms/responses',
    request: {
      body: z.object({ template_id: z.string().uuid(), data: z.record(z.string(), z.unknown()) }),
    },
    responses: {
      201: { schema: formResponse, description: 'Submit a response to a published form' },
    },
    metadata: formAuthority('create'),
  },
  getResponses: {
    method: 'get',
    path: '/forms/templates/:templateId/responses',
    request: {
      params: z.object({ templateId: z.string().uuid() }),
      query: page,
    },
    responses: {
      200: {
        schema: z.array(formResponse),
        description: 'List responses owned by the template owner',
      },
    },
    metadata: formAuthority('read'),
  },
} as const satisfies SovereignContract;

export { formConfig, formResponse, formTemplate };
