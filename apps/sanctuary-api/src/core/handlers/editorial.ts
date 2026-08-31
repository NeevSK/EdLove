import {
  type EditorialAuthorProfileInput,
  type EditorialAuthorProfileSummary,
  type EditorialDeliveryInput,
  type EditorialDeliverySummary,
  type EditorialEventInput,
  type EditorialRightsAgreementInput,
  editorialContract,
  requiresRightsReview,
} from '@repo/core/api/editorial.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { executeDatabaseCommand, queryDatabaseRows } from '@repo/database/client';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(editorialContract).$context<ORPCContext>();

const requireDatabase = (context: ORPCContext) => {
  assertDatabase(context);
};

type DeliveryStatus = EditorialDeliveryInput['status'];
type SubmissionReviewStatus = 'in_review' | 'rights_review' | 'approved' | 'rejected' | 'withdrawn';
type SubmissionStatus =
  | 'submitted'
  | 'in_review'
  | 'rights_review'
  | 'approved'
  | 'rejected'
  | 'withdrawn';
const allowedTransitions: Record<DeliveryStatus, ReadonlyArray<DeliveryStatus>> = {
  pending: ['pending', 'processing', 'skipped'],
  processing: ['processing', 'published', 'failed', 'withdrawn', 'skipped'],
  published: ['published', 'withdrawn'],
  failed: ['failed', 'processing', 'skipped'],
  withdrawn: ['withdrawn'],
  skipped: ['skipped', 'processing'],
};

const allowedSubmissionTransitions: Record<
  SubmissionStatus,
  ReadonlyArray<SubmissionReviewStatus>
> = {
  submitted: ['in_review', 'rights_review', 'rejected', 'withdrawn'],
  in_review: ['in_review', 'rights_review', 'approved', 'rejected', 'withdrawn'],
  rights_review: ['rights_review', 'in_review', 'approved', 'rejected', 'withdrawn'],
  approved: ['approved', 'withdrawn'],
  rejected: ['rejected', 'in_review'],
  withdrawn: ['withdrawn', 'in_review'],
};

const mapSubmissionSummary = (row: Record<string, unknown>) => ({
  id: String(row.id),
  publication: String(row.publication) as 'edlove' | 'gurudevi',
  contentKind: String(row.content_kind) as
    | 'original'
    | 'curated'
    | 'licensed'
    | 'guest'
    | 'translation',
  title: String(row.title),
  summary: String(row.summary),
  body: String(row.body),
  language: String(row.language) as 'en' | 'si' | 'ta',
  sourceUrl: row.source_url ? String(row.source_url) : null,
  rightsAgreementId: row.rights_agreement_id ? String(row.rights_agreement_id) : null,
  translationOfVersionId: row.translation_of_version_id
    ? String(row.translation_of_version_id)
    : null,
  authorProfileId: row.author_id ? String(row.author_id) : null,
  status: String(row.status) as SubmissionStatus,
  createdAt: new Date(String(row.created_at)).toISOString(),
  updatedAt: new Date(String(row.updated_at)).toISOString(),
});

const mapRightsAgreement = (row: Record<string, unknown>) => ({
  id: String(row.id),
  rightsHolder: String(row.rights_holder),
  license: String(row.license),
  permittedPublications: (row.permitted_publications as string[]) ?? [],
  permittedChannels: (row.permitted_channels as string[]) ?? [],
  evidenceReference: String(row.evidence_reference),
  expiresAt: row.expires_at ? new Date(String(row.expires_at)).toISOString() : null,
  takedownContact: String(row.takedown_contact),
  createdAt: new Date(String(row.created_at)).toISOString(),
  updatedAt: new Date(String(row.updated_at)).toISOString(),
});

const mapDelivery = (row: Record<string, unknown>): EditorialDeliverySummary => ({
  eventId: String(row.event_id),
  channel: String(row.channel) as EditorialDeliverySummary['channel'],
  accountId: String(row.account_id),
  idempotencyKey: String(row.idempotency_key),
  status: String(row.status) as EditorialDeliverySummary['status'],
  attempts: Number(row.attempts),
  externalUrl: row.external_url ? String(row.external_url) : null,
  lastError: row.last_error ? String(row.last_error) : null,
  updatedAt: new Date(String(row.updated_at)).toISOString(),
});

const mapAuthorProfile = (row: Record<string, unknown>): EditorialAuthorProfileSummary => ({
  id: String(row.id),
  displayName: String(row.display_name),
  biography: String(row.biography ?? ''),
  email: row.email ? String(row.email) : null,
  websiteUrl: row.website_url ? String(row.website_url) : null,
  socialLinks: (row.social_links as string[]) ?? [],
  attributionName: row.attribution_name ? String(row.attribution_name) : null,
  createdAt: new Date(String(row.created_at)).toISOString(),
  updatedAt: new Date(String(row.updated_at)).toISOString(),
});

const mapEvent = (row: Record<string, unknown>): EditorialEventInput => ({
  eventId: String(row.event_id),
  eventType: String(row.event_type) as EditorialEventInput['eventType'],
  workId: String(row.work_id),
  versionId: String(row.version_id),
  payload: (row.payload as Record<string, unknown>) ?? {},
  occurredAt: new Date(String(row.occurred_at)).toISOString(),
});

export const editorialRouter = impl.router({
  listMine: impl.listMine.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireDatabase(context);
    const rows = await queryDatabaseRows<Record<string, unknown>>(
      `select id, publication, content_kind, title, summary, body, language, source_url, rights_agreement_id, translation_of_version_id, author_id, status, created_at, updated_at
       from public.editorial_submissions
       where submitter_id = $1::uuid
       order by created_at desc limit $2`,
      [context.user.id, input.query.limit],
    );
    return rows.map(mapSubmissionSummary);
  }),

  listForReview: impl.listForReview
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireDatabase(context);
      const rows = await queryDatabaseRows<Record<string, unknown>>(
        `select id, publication, content_kind, title, summary, body, language, source_url, rights_agreement_id, translation_of_version_id, author_id, status, created_at, updated_at
       from public.editorial_submissions
       where ($1::text is null or status = $1)
       order by created_at asc limit $2`,
        [input.query.status ?? null, input.query.limit],
      );
      return rows.map(mapSubmissionSummary);
    }),

  submit: impl.submit.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireDatabase(context);
    const body = input.body;
    if (body.contentKind === 'licensed') {
      const rightsRows = await queryDatabaseRows<{
        permitted_publications: string[];
      }>('select permitted_publications from public.editorial_rights_agreements where id = $1', [
        body.rightsAgreementId,
      ]);
      const rights = rightsRows[0];
      if (!rights) throw SovereignError.conflict('EDITORIAL_RIGHTS_AGREEMENT_NOT_FOUND');
      if (!rights.permitted_publications.includes(body.publication)) {
        throw SovereignError.conflict('EDITORIAL_PUBLICATION_NOT_PERMITTED');
      }
    }
    const rows = await queryDatabaseRows<{ id: string }>(
      `insert into public.editorial_submissions
        (publication, content_kind, title, summary, body, language, submitter_id, source_url, rights_agreement_id, translation_of_version_id)
       values ($1, $2, $3, $4, $5, $6, $7::uuid, $8, $9, $10)
       returning id`,
      [
        body.publication,
        body.contentKind,
        body.title,
        body.summary,
        body.body,
        body.language,
        context.user.id,
        body.sourceUrl ?? null,
        body.rightsAgreementId ?? null,
        body.translationOfVersionId ?? null,
      ],
    );
    if (!rows[0]) throw SovereignError.unavailable('EDITORIAL_SUBMISSION_WRITE_FAILED');
    return { id: String(rows[0].id), status: 'submitted' as const };
  }),

  reviewSubmission: impl.reviewSubmission
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireDatabase(context);
      const currentRows = await queryDatabaseRows<{
        status: SubmissionStatus;
        publication: 'edlove' | 'gurudevi';
        content_kind: 'original' | 'curated' | 'licensed' | 'guest' | 'translation';
        rights_agreement_id: string | null;
      }>(
        'select status, publication, content_kind, rights_agreement_id from public.editorial_submissions where id = $1',
        [input.params.id],
      );
      const current = currentRows[0];
      if (!current) throw SovereignError.notFound('Editorial submission');
      if (input.body.authorProfileId) {
        const authorRows = await queryDatabaseRows<{ id: string }>(
          'select id from public.editorial_authors where id = $1',
          [input.body.authorProfileId],
        );
        if (!authorRows[0]) throw SovereignError.notFound('Editorial author profile');
      }
      if (
        input.body.status === 'approved' &&
        requiresRightsReview(current.content_kind) &&
        (current.status !== 'rights_review' ||
          (current.content_kind === 'licensed' && !current.rights_agreement_id))
      ) {
        throw SovereignError.conflict('EDITORIAL_RIGHTS_REVIEW_REQUIRED');
      }
      if (input.body.status === 'approved' && current.content_kind === 'licensed') {
        const rightsRows = await queryDatabaseRows<{
          permitted_publications: string[];
          expires_at: string | null;
        }>(
          'select permitted_publications, expires_at from public.editorial_rights_agreements where id = $1',
          [current.rights_agreement_id],
        );
        const rights = rightsRows[0];
        if (!rights) throw SovereignError.conflict('EDITORIAL_RIGHTS_AGREEMENT_NOT_FOUND');
        if (!rights.permitted_publications.includes(current.publication)) {
          throw SovereignError.conflict('EDITORIAL_PUBLICATION_NOT_PERMITTED');
        }
        if (rights.expires_at && new Date(rights.expires_at).getTime() <= Date.now()) {
          throw SovereignError.conflict('EDITORIAL_RIGHTS_AGREEMENT_EXPIRED');
        }
      }
      if (!allowedSubmissionTransitions[current.status].includes(input.body.status)) {
        throw SovereignError.conflict('EDITORIAL_SUBMISSION_TRANSITION_REJECTED');
      }
      const rows = await queryDatabaseRows<{ id: string }>(
        `update public.editorial_submissions
       set status = $2, reviewer_id = $3::uuid, decision_note = $4, author_id = coalesce($5, author_id), updated_at = now()
       where id = $1
       returning id`,
        [
          input.params.id,
          input.body.status,
          context.user.id,
          input.body.decisionNote ?? null,
          input.body.authorProfileId ?? null,
        ],
      );
      if (!rows[0]) throw SovereignError.notFound('Editorial submission');
      return { id: String(rows[0].id), status: input.body.status };
    }),

  recordEvent: impl.recordEvent.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireDatabase(context);
    const body = input.body as EditorialEventInput;
    const rows = await queryDatabaseRows<{ event_id: string }>(
      `insert into public.editorial_events
        (event_id, event_type, work_id, version_id, payload, occurred_at)
       values ($1, $2, $3, $4, $5::jsonb, $6::timestamptz)
       on conflict (event_id) do nothing
       returning event_id`,
      [
        body.eventId,
        body.eventType,
        body.workId,
        body.versionId,
        JSON.stringify(body.payload),
        body.occurredAt,
      ],
    );
    return { eventId: body.eventId, recorded: rows.length > 0 };
  }),

  listEvents: impl.listEvents.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireDatabase(context);
    const rows = await queryDatabaseRows<Record<string, unknown>>(
      `select event_id, event_type, work_id, version_id, payload, occurred_at
         from public.editorial_events
         where ($1::text is null or event_id = $1)
         order by occurred_at desc limit $2`,
      [input.query.eventId ?? null, input.query.limit],
    );
    return rows.map(mapEvent);
  }),

  recordDelivery: impl.recordDelivery
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireDatabase(context);
      const body = input.body as EditorialDeliveryInput;
      const currentRows = await queryDatabaseRows<{
        event_id: string;
        channel: string;
        account_id: string;
        status: DeliveryStatus;
      }>(
        `select event_id, channel, account_id, status
       from public.editorial_distribution_deliveries
       where idempotency_key = $1`,
        [body.idempotencyKey],
      );
      const current = currentRows[0];
      if (
        current &&
        (current.event_id !== body.eventId ||
          current.channel !== body.channel ||
          current.account_id !== body.accountId)
      ) {
        throw SovereignError.conflict('EDITORIAL_IDEMPOTENCY_KEY_REUSED');
      }
      if (current && !allowedTransitions[current.status].includes(body.status)) {
        throw SovereignError.conflict('EDITORIAL_DELIVERY_TRANSITION_REJECTED');
      }
      await executeDatabaseCommand(
        `insert into public.editorial_distribution_deliveries
        (idempotency_key, event_id, channel, account_id, status, attempts, external_url, last_error)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       on conflict (idempotency_key) do update set
         status = excluded.status,
         attempts = excluded.attempts,
         external_url = excluded.external_url,
         last_error = excluded.last_error,
         updated_at = now()`,
        [
          body.idempotencyKey,
          body.eventId,
          body.channel,
          body.accountId,
          body.status,
          body.attempts,
          body.externalUrl ?? null,
          body.lastError ?? null,
        ],
      );
      return { idempotencyKey: body.idempotencyKey, status: body.status };
    }),

  listRightsAgreements: impl.listRightsAgreements
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireDatabase(context);
      const rows = await queryDatabaseRows<Record<string, unknown>>(
        `select id, rights_holder, license, permitted_publications, permitted_channels,
                evidence_reference, expires_at, takedown_contact, created_at, updated_at
         from public.editorial_rights_agreements
         order by created_at desc limit $1`,
        [input.query.limit],
      );
      return rows.map(mapRightsAgreement);
    }),

  listDeliveries: impl.listDeliveries
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireDatabase(context);
      const rows = await queryDatabaseRows<Record<string, unknown>>(
        `select event_id, channel, account_id, idempotency_key, status, attempts,
                external_url, last_error, updated_at
         from public.editorial_distribution_deliveries
         where ($1::text is null or event_id = $1)
         order by updated_at desc limit $2`,
        [input.query.eventId ?? null, input.query.limit],
      );
      return rows.map(mapDelivery);
    }),

  createRightsAgreement: impl.createRightsAgreement
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireDatabase(context);
      const body = input.body as EditorialRightsAgreementInput;
      const rows = await queryDatabaseRows<{ id: string }>(
        `insert into public.editorial_rights_agreements
          (id, rights_holder, license, permitted_publications, permitted_channels,
           evidence_reference, expires_at, takedown_contact)
         values ($1, $2, $3, $4, $5, $6, $7::timestamptz, $8)
         on conflict (id) do nothing
         returning id`,
        [
          body.id,
          body.rightsHolder,
          body.license,
          body.permittedPublications,
          body.permittedChannels,
          body.evidenceReference,
          body.expiresAt ?? null,
          body.takedownContact,
        ],
      );
      if (!rows[0]) throw SovereignError.conflict('EDITORIAL_RIGHTS_AGREEMENT_ID_EXISTS');
      return { id: String(rows[0].id) };
    }),

  listAuthorProfiles: impl.listAuthorProfiles
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireDatabase(context);
      const rows = await queryDatabaseRows<Record<string, unknown>>(
        `select id, display_name, biography, email, website_url, social_links,
                attribution_name, created_at, updated_at
         from public.editorial_authors
         order by display_name asc limit $1`,
        [input.query.limit],
      );
      return rows.map(mapAuthorProfile);
    }),

  createAuthorProfile: impl.createAuthorProfile
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireDatabase(context);
      const body = input.body as EditorialAuthorProfileInput;
      const rows = await queryDatabaseRows<{ id: string }>(
        `insert into public.editorial_authors
          (id, display_name, biography, email, website_url, social_links, attribution_name)
         values ($1, $2, $3, $4, $5, $6, $7)
         on conflict (id) do nothing
         returning id`,
        [
          body.id,
          body.displayName,
          body.biography,
          body.email ?? null,
          body.websiteUrl ?? null,
          body.socialLinks,
          body.attributionName ?? null,
        ],
      );
      if (!rows[0]) throw SovereignError.conflict('EDITORIAL_AUTHOR_ID_EXISTS');
      return { id: String(rows[0].id) };
    }),
});
