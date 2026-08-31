import type { SovereignContract } from '@repo/core/api/contracts';
import { z } from 'zod';

const editorialAuthority = (
  action: 'create' | 'read' | 'update',
  subject: 'EditorialWork' | 'EditorialRightsAgreement' | 'EditorialAuthor' = 'EditorialWork',
) => ({ policy: { action, subject } }) as const;

const contributorAuthority = (action: 'create' | 'read') =>
  ({ policy: { action, subject: 'EditorialSubmission' } }) as const;

const event = z.object({
  eventId: z.string().trim().min(1).max(200),
  eventType: z.enum(['article.published', 'article.updated', 'article.withdrawn']),
  workId: z.string().trim().min(1).max(200),
  versionId: z.string().trim().min(1).max(200),
  payload: z.record(z.string(), z.unknown()),
  occurredAt: z.string().datetime(),
});

const delivery = z.object({
  eventId: z.string().trim().min(1).max(200),
  channel: z.enum(['linkedin', 'medium', 'substack', 'meta', 'rss']),
  accountId: z.string().trim().min(1).max(200),
  idempotencyKey: z.string().trim().min(1).max(400),
  status: z.enum(['pending', 'processing', 'published', 'failed', 'withdrawn', 'skipped']),
  attempts: z.number().int().min(0).max(100),
  externalUrl: z.string().url().optional(),
  lastError: z.string().max(2000).optional(),
});

const deliverySummary = delivery.extend({
  externalUrl: z.string().url().nullable(),
  lastError: z.string().nullable(),
  updatedAt: z.string().datetime(),
});

export const editorialSubmissionSchema = z
  .object({
    publication: z.enum(['edlove', 'gurudevi']),
    contentKind: z.enum(['original', 'curated', 'licensed', 'guest', 'translation']),
    title: z.string().trim().min(3).max(240),
    summary: z.string().trim().min(10).max(1000),
    body: z.string().trim().min(50).max(200000),
    language: z.enum(['en', 'si', 'ta']),
    sourceUrl: z.string().url().optional(),
    rightsAgreementId: z.string().trim().max(200).optional(),
    translationOfVersionId: z.string().trim().max(200).optional(),
  })
  .superRefine((value, context) => {
    if (['curated', 'licensed', 'translation'].includes(value.contentKind) && !value.sourceUrl) {
      context.addIssue({
        code: 'custom',
        path: ['sourceUrl'],
        message: 'Source URL is required for this content type.',
      });
    }
    if (value.contentKind === 'licensed' && !value.rightsAgreementId) {
      context.addIssue({
        code: 'custom',
        path: ['rightsAgreementId'],
        message: 'Rights agreement reference is required for licensed work.',
      });
    }
    if (value.contentKind === 'translation' && !value.translationOfVersionId) {
      context.addIssue({
        code: 'custom',
        path: ['translationOfVersionId'],
        message: 'Source version reference is required for translated work.',
      });
    }
  });

const review = z.object({
  status: z.enum(['in_review', 'rights_review', 'approved', 'rejected', 'withdrawn']),
  decisionNote: z.string().trim().max(2000).optional(),
  authorProfileId: z.string().trim().max(200).optional(),
});

const rightsAgreement = z.object({
  id: z.string().trim().min(1).max(200),
  rightsHolder: z.string().trim().min(1).max(240),
  license: z.string().trim().min(1).max(240),
  permittedPublications: z.array(z.enum(['edlove', 'gurudevi'])).min(1),
  permittedChannels: z.array(z.enum(['linkedin', 'medium', 'substack', 'meta', 'rss'])).min(1),
  evidenceReference: z.string().trim().min(1).max(1000),
  expiresAt: z.string().datetime().optional(),
  takedownContact: z.string().trim().min(1).max(240),
});

const rightsAgreementSummary = rightsAgreement.extend({
  expiresAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const authorProfile = z.object({
  id: z.string().trim().min(1).max(200),
  displayName: z.string().trim().min(1).max(240),
  biography: z.string().max(4000),
  email: z.string().email().optional(),
  websiteUrl: z.string().url().optional(),
  socialLinks: z.array(z.string().url()).max(12),
  attributionName: z.string().trim().max(240).optional(),
});

const authorProfileSummary = authorProfile.extend({
  email: z.string().email().nullable(),
  websiteUrl: z.string().url().nullable(),
  attributionName: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const editorialSubmissionSummarySchema = z.object({
  id: z.string(),
  publication: z.enum(['edlove', 'gurudevi']),
  contentKind: z.enum(['original', 'curated', 'licensed', 'guest', 'translation']),
  title: z.string(),
  summary: z.string(),
  body: z.string(),
  language: z.enum(['en', 'si', 'ta']),
  sourceUrl: z.string().url().nullable(),
  rightsAgreementId: z.string().nullable(),
  translationOfVersionId: z.string().nullable(),
  authorProfileId: z.string().nullable(),
  status: z.enum(['submitted', 'in_review', 'rights_review', 'approved', 'rejected', 'withdrawn']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const listQuery = z.object({ limit: z.number().int().min(1).max(100).default(25) });

export const editorialContract = {
  listMine: {
    method: 'get',
    path: '/editorial/submissions',
    request: { query: listQuery },
    responses: {
      200: {
        schema: z.array(editorialSubmissionSummarySchema),
        description: 'Submissions created by the current contributor',
      },
    },
    metadata: contributorAuthority('read'),
  },
  listForReview: {
    method: 'get',
    path: '/admin/editorial/submissions',
    request: { query: listQuery.extend({ status: review.shape.status.optional() }) },
    responses: {
      200: {
        schema: z.array(editorialSubmissionSummarySchema),
        description: 'Editorial submissions awaiting review',
      },
    },
    metadata: editorialAuthority('read'),
  },
  submit: {
    method: 'post',
    path: '/editorial/submissions',
    request: { body: editorialSubmissionSchema },
    responses: {
      200: {
        schema: z.object({ id: z.string(), status: z.literal('submitted') }),
        description: 'Created an editorial submission',
      },
    },
    metadata: contributorAuthority('create'),
  },
  reviewSubmission: {
    method: 'post',
    path: '/admin/editorial/submissions/:id/review',
    request: { params: z.object({ id: z.string().trim().min(1).max(200) }), body: review },
    responses: {
      200: {
        schema: z.object({ id: z.string(), status: review.shape.status }),
        description: 'Updated editorial submission review state',
      },
    },
    metadata: editorialAuthority('update'),
  },
  recordEvent: {
    method: 'post',
    path: '/admin/editorial/events',
    request: { body: event },
    responses: {
      200: {
        schema: z.object({ eventId: z.string(), recorded: z.boolean() }),
        description: 'Idempotently recorded editorial event',
      },
    },
    metadata: editorialAuthority('create'),
  },
  listEvents: {
    method: 'get',
    path: '/admin/editorial/events',
    request: { query: listQuery.extend({ eventId: z.string().trim().max(200).optional() }) },
    responses: {
      200: {
        schema: z.array(event),
        description: 'Canonical editorial publishing events',
      },
    },
    metadata: editorialAuthority('read'),
  },
  recordDelivery: {
    method: 'post',
    path: '/admin/editorial/deliveries',
    request: { body: delivery },
    responses: {
      200: {
        schema: z.object({ idempotencyKey: z.string(), status: delivery.shape.status }),
        description: 'Recorded editorial delivery state',
      },
    },
    metadata: editorialAuthority('update'),
  },
  listDeliveries: {
    method: 'get',
    path: '/admin/editorial/deliveries',
    request: { query: listQuery.extend({ eventId: z.string().trim().max(200).optional() }) },
    responses: {
      200: {
        schema: z.array(deliverySummary),
        description: 'Distribution delivery ledger for the editorial desk',
      },
    },
    metadata: editorialAuthority('read'),
  },
  listRightsAgreements: {
    method: 'get',
    path: '/admin/editorial/rights-agreements',
    request: { query: listQuery },
    responses: {
      200: {
        schema: z.array(rightsAgreementSummary),
        description: 'Rights agreements available to the editorial desk',
      },
    },
    metadata: editorialAuthority('read', 'EditorialRightsAgreement'),
  },
  createRightsAgreement: {
    method: 'post',
    path: '/admin/editorial/rights-agreements',
    request: { body: rightsAgreement },
    responses: {
      200: {
        schema: z.object({ id: z.string() }),
        description: 'Created a rights agreement for licensed editorial work',
      },
    },
    metadata: editorialAuthority('create', 'EditorialRightsAgreement'),
  },
  listAuthorProfiles: {
    method: 'get',
    path: '/admin/editorial/authors',
    request: { query: listQuery },
    responses: {
      200: {
        schema: z.array(authorProfileSummary),
        description: 'Author profiles available to the editorial desk',
      },
    },
    metadata: editorialAuthority('read', 'EditorialAuthor'),
  },
  createAuthorProfile: {
    method: 'post',
    path: '/admin/editorial/authors',
    request: { body: authorProfile },
    responses: {
      200: {
        schema: z.object({ id: z.string() }),
        description: 'Created an author attribution profile',
      },
    },
    metadata: editorialAuthority('create', 'EditorialAuthor'),
  },
} as const satisfies SovereignContract;

export type EditorialEventInput = z.infer<typeof event>;
export type EditorialDeliveryInput = z.infer<typeof delivery>;
export type EditorialDeliverySummary = z.infer<typeof deliverySummary>;
export type EditorialSubmissionInput = z.infer<typeof editorialSubmissionSchema>;
export type EditorialReviewInput = z.infer<typeof review>;
export type EditorialRightsAgreementInput = z.infer<typeof rightsAgreement>;
export type EditorialRightsAgreementSummary = z.infer<typeof rightsAgreementSummary>;
export type EditorialAuthorProfileInput = z.infer<typeof authorProfile>;
export type EditorialAuthorProfileSummary = z.infer<typeof authorProfileSummary>;
export type EditorialSubmissionSummary = z.infer<typeof editorialSubmissionSummarySchema>;

export function requiresRightsReview(
  contentKind: EditorialSubmissionInput['contentKind'],
): boolean {
  return contentKind === 'curated' || contentKind === 'licensed' || contentKind === 'translation';
}

export type EditorialClient = {
  listMine(input: { query: { limit?: number } }): Promise<EditorialSubmissionSummary[]>;
  listForReview(input: {
    query: { limit?: number; status?: EditorialReviewInput['status'] };
  }): Promise<EditorialSubmissionSummary[]>;
  submit(input: { body: EditorialSubmissionInput }): Promise<{ id: string; status: 'submitted' }>;
  reviewSubmission(input: {
    params: { id: string };
    body: EditorialReviewInput;
  }): Promise<{ id: string; status: EditorialReviewInput['status'] }>;
  listRightsAgreements(input: {
    query: { limit?: number };
  }): Promise<EditorialRightsAgreementSummary[]>;
  createRightsAgreement(input: { body: EditorialRightsAgreementInput }): Promise<{ id: string }>;
  listDeliveries(input: {
    query: { limit?: number; eventId?: string };
  }): Promise<EditorialDeliverySummary[]>;
  listEvents(input: {
    query: { limit?: number; eventId?: string };
  }): Promise<EditorialEventInput[]>;
  listAuthorProfiles(input: {
    query: { limit?: number };
  }): Promise<EditorialAuthorProfileSummary[]>;
  createAuthorProfile(input: { body: EditorialAuthorProfileInput }): Promise<{ id: string }>;
};
