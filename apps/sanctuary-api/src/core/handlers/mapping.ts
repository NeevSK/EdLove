import { randomBytes } from 'node:crypto';
import { mappingContract } from '@repo/core/api/mapping.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';

const impl = implement(mappingContract).$context<ORPCContext>();
const iso = (value: unknown) =>
  value instanceof Date ? value.toISOString() : value ? String(value) : null;

const isPlatformAdmin = async (context: ORPCContext) =>
  Boolean(
    await context.db.bond.findFirst({
      where: { user_id: context.user.id, entity_type: 'PLATFORM', capacity: 'admin' },
      select: { id: true },
    }),
  );

const requireUser = (context: ORPCContext) => {
  assertDatabase(context);
  if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
};

const mapTopology = (row: any) => ({
  id: String(row.id),
  owner_id: row.owner_id ? String(row.owner_id) : null,
  name: String(row.name),
  description: row.description ?? null,
  nodes: row.nodes ?? [],
  links: row.links ?? [],
  supportedPerspectives: row.supported_perspectives ?? [],
  context: row.context ?? null,
  is_public: Boolean(row.is_public),
  share_token: row.share_token ?? null,
  share_token_expires_at: iso(row.share_token_expires_at),
  created_at: iso(row.created_at) ?? new Date(0).toISOString(),
  updated_at: iso(row.updated_at) ?? new Date(0).toISOString(),
});

export const mappingRouter = impl.router({
  getById: impl.getById.handler(async ({ input, context }) => {
    requireUser(context);
    const row = await context.db.mappingTopology.findUnique({ where: { id: input.params.id } });
    return row ? mapTopology(row) : null;
  }),

  getSchoolPulse: impl.getSchoolPulse.handler(async ({ input, context }) => {
    requireUser(context);
    const [profile, bond, school] = await Promise.all([
      context.db.user.findUnique({ where: { id: context.user.id }, select: { school_id: true } }),
      context.db.bond.findFirst({
        where: {
          user_id: context.user.id,
          entity_id: input.params.schoolId,
          entity_type: 'SCHOOL',
          capacity: { in: ['principal', 'section_head', 'teacher'] },
        },
        select: { id: true },
      }),
      context.db.school.findUnique({
        where: { id: input.params.schoolId },
        select: { id: true, name: true },
      }),
    ]);
    const admin = await isPlatformAdmin(context);
    if (!school) throw SovereignError.notFound('School');
    if (!admin && profile?.school_id !== input.params.schoolId && !bond)
      throw SovereignError.unauthorized('read', 'school mapping pulse');

    const classrooms = await context.db.classroom.findMany({
      where: { school_id: input.params.schoolId },
      select: { id: true, name: true, subject: true },
      orderBy: { name: 'asc' },
    });
    const subjects = [
      ...new Set(classrooms.map((row: any) => row.subject).filter(Boolean)),
    ] as string[];
    return {
      nodes: [
        { id: input.params.schoolId, label: school.name, type: 'school' as const, group: 'School' },
        ...subjects.map((subject) => ({
          id: `subj-${subject}`,
          label: subject,
          type: 'topic' as const,
          group: 'Department',
        })),
        ...classrooms.map((row: any) => ({
          id: String(row.id),
          label: String(row.name),
          type: 'topic' as const,
          group: row.subject ?? 'Classroom',
        })),
      ],
      links: [
        ...subjects.map((subject) => ({
          source: input.params.schoolId,
          target: `subj-${subject}`,
          relationship: 'manages' as const,
        })),
        ...classrooms
          .filter((row: any) => row.subject)
          .map((row: any) => ({
            source: `subj-${row.subject}`,
            target: String(row.id),
            relationship: 'contains' as const,
          })),
      ],
      context: {
        title: `${school.name} Topology Pulse`,
        ...(input.query.viewDate ? { viewDate: input.query.viewDate } : {}),
      },
    };
  }),

  upsert: impl.upsert.handler(async ({ input, context }) => {
    requireUser(context);
    const existing = await context.db.mappingTopology.findUnique({
      where: { id: input.params.id },
    });
    const admin = await isPlatformAdmin(context);
    if (existing && existing.owner_id !== context.user.id && !admin)
      throw SovereignError.unauthorized('update', 'mapping topology');
    if (!existing && !input.body.nodes && !input.body.links)
      throw SovereignError.invalidInput('A new topology requires nodes and links.');

    const row = existing
      ? await context.db.mappingTopology.update({
          where: { id: input.params.id },
          data: {
            ...(input.body.name !== undefined ? { name: input.body.name } : {}),
            ...(input.body.description !== undefined
              ? { description: input.body.description }
              : {}),
            ...(input.body.nodes !== undefined ? { nodes: input.body.nodes } : {}),
            ...(input.body.links !== undefined ? { links: input.body.links } : {}),
            ...(input.body.supportedPerspectives !== undefined
              ? { supported_perspectives: input.body.supportedPerspectives }
              : {}),
            ...(input.body.context !== undefined ? { context: input.body.context } : {}),
            ...(input.body.isPublic !== undefined ? { is_public: input.body.isPublic } : {}),
          },
        })
      : await context.db.mappingTopology.create({
          data: {
            id: input.params.id,
            owner_id: context.user.id,
            name: input.body.name ?? 'Untitled topology',
            description: input.body.description ?? null,
            nodes: input.body.nodes ?? [],
            links: input.body.links ?? [],
            supported_perspectives: input.body.supportedPerspectives ?? [],
            context: input.body.context ?? null,
            is_public: input.body.isPublic ?? false,
          },
        });
    return mapTopology(row);
  }),

  createShareLink: impl.createShareLink.handler(async ({ input, context }) => {
    requireUser(context);
    const row = await context.db.mappingTopology.findUnique({ where: { id: input.params.id } });
    const admin = await isPlatformAdmin(context);
    if (!row || (row.owner_id !== context.user.id && !admin))
      throw SovereignError.unauthorized('share', 'mapping topology');
    const expiresAt = new Date(Date.now() + input.body.expiresDays * 24 * 60 * 60 * 1000);
    const updated = await context.db.mappingTopology.update({
      where: { id: input.params.id },
      data: { share_token: randomBytes(16).toString('hex'), share_token_expires_at: expiresAt },
      select: { share_token: true, share_token_expires_at: true },
    });
    return {
      token: String(updated.share_token),
      expiresAt: iso(updated.share_token_expires_at) as string,
    };
  }),
});
