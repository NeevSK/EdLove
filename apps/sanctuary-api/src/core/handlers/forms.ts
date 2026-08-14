import { formsContract, formResponse, formTemplate } from '@repo/core/api/forms.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { executeDatabaseCommand, queryDatabaseRows } from '@repo/database/client';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(formsContract).$context<ORPCContext>();

const requireUser = (context: ORPCContext) => {
  assertDatabase(context);
  if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
};

const iso = (value: unknown) => new Date(String(value)).toISOString();

const mapTemplate = (row: any) =>
  formTemplate.parse({
    id: String(row.id),
    owner_id: String(row.owner_id),
    title: String(row.title),
    description: row.description ?? null,
    config: Array.isArray(row.config)
      ? row.config
      : typeof row.config === 'string'
        ? JSON.parse(row.config)
        : [],
    is_published: Boolean(row.is_published),
    slug: row.slug ?? null,
    category: row.category ?? null,
    created_at: iso(row.created_at),
    updated_at: iso(row.updated_at),
  });

const mapResponse = (row: any) =>
  formResponse.parse({
    id: String(row.id),
    template_id: String(row.template_id),
    responder_id: row.responder_id ? String(row.responder_id) : null,
    data: row.data && typeof row.data === 'object' ? row.data : {},
    submitted_at: iso(row.submitted_at),
  });

const templateColumns = `id, owner_id, title, description, config, is_published, slug, category, created_at, updated_at`;

export const formsRouter = impl.router({
  create: impl.create.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    const body = input.body;
    const rows = await queryDatabaseRows<any>(
      `insert into public.form_templates
        (owner_id, title, description, config, is_published, slug, category)
       values ($1::uuid, $2, $3, $4::jsonb, $5, $6, $7)
       returning ${templateColumns}`,
      [context.user.id, body.title, body.description ?? null, JSON.stringify(body.config), body.is_published ?? false, body.slug ?? null, body.category ?? null],
    );
    if (!rows[0]) throw SovereignError.unavailable('FORM_TEMPLATE_CREATE_FAILED');
    return mapTemplate(rows[0]);
  }),

  getById: impl.getById.handler(async ({ input, context }) => {
    assertDatabase(context);
    const rows = await queryDatabaseRows<any>(
      `select ${templateColumns} from public.form_templates
       where id = $1::uuid and (is_published = true or owner_id = $2::uuid)
       limit 1`,
      [input.params.id, context.user.id === 'anonymous' ? null : context.user.id],
    );
    if (!rows[0]) throw SovereignError.notFound('Form template');
    return mapTemplate(rows[0]);
  }),

  getBySlug: impl.getBySlug.handler(async ({ input, context }) => {
    assertDatabase(context);
    const rows = await queryDatabaseRows<any>(
      `select ${templateColumns} from public.form_templates
       where slug = $1 and is_published = true limit 1`,
      [input.params.slug],
    );
    if (!rows[0]) throw SovereignError.notFound('Published form template');
    return mapTemplate(rows[0]);
  }),

  getByOwner: impl.getByOwner.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    if (input.params.ownerId !== context.user.id) throw SovereignError.unauthorized('read', 'form templates');
    const rows = await queryDatabaseRows<any>(
      `select ${templateColumns} from public.form_templates
       where owner_id = $1::uuid order by created_at desc limit $2 offset $3`,
      [context.user.id, input.query.limit, input.query.offset],
    );
    return rows.map(mapTemplate);
  }),

  update: impl.update.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    const body = input.body;
    const rows = await queryDatabaseRows<any>(
      `update public.form_templates set
        title = coalesce($2, title), description = coalesce($3, description),
        config = coalesce($4::jsonb, config), is_published = coalesce($5, is_published),
        slug = coalesce($6, slug), category = coalesce($7, category), updated_at = now()
       where id = $1::uuid and owner_id = $8::uuid
       returning ${templateColumns}`,
      [input.params.id, body.title ?? null, body.description ?? null, body.config ? JSON.stringify(body.config) : null, body.is_published ?? null, body.slug ?? null, body.category ?? null, context.user.id],
    );
    if (!rows[0]) throw SovereignError.notFound('Owned form template');
    return mapTemplate(rows[0]);
  }),

  delete: impl.delete.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    await executeDatabaseCommand(
      `delete from public.form_templates where id = $1::uuid and owner_id = $2::uuid`,
      [input.params.id, context.user.id],
    );
    return { success: true as const };
  }),

  submitResponse: impl.submitResponse.handler(async ({ input, context }) => {
    assertDatabase(context);
    const rows = await queryDatabaseRows<any>(
      `insert into public.form_responses (template_id, responder_id, data)
       select $1::uuid, $2::uuid, $3::jsonb
       from public.form_templates where id = $1::uuid and is_published = true
       returning id, template_id, responder_id, data, submitted_at`,
      [input.body.template_id, context.user.id === 'anonymous' ? null : context.user.id, JSON.stringify(input.body.data)],
    );
    if (!rows[0]) throw SovereignError.notFound('Published form template');
    return mapResponse(rows[0]);
  }),

  getResponses: impl.getResponses.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    const rows = await queryDatabaseRows<any>(
      `select response.id, response.template_id, response.responder_id, response.data, response.submitted_at
       from public.form_responses response
       join public.form_templates template on template.id = response.template_id
       where response.template_id = $1::uuid and template.owner_id = $2::uuid
       order by response.submitted_at desc limit $3 offset $4`,
      [input.params.templateId, context.user.id, input.query.limit, input.query.offset],
    );
    return rows.map(mapResponse);
  }),
});
