import { type Manifesto, sacredMissionsContract } from '@repo/core/api/sacredMissions.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(sacredMissionsContract).$context<ORPCContext>();

const requireUser = (context: ORPCContext) => {
  assertDatabase(context);
  if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
};

const iso = (value: unknown) => (value ? new Date(value as string | Date).toISOString() : null);

const mapManifesto = (row: any, userId: string): Manifesto => ({
  id: String(row.id),
  school_id: String(row.school_id),
  creator_id: row.creator_id == null ? null : String(row.creator_id),
  title: String(row.title),
  content: String(row.content),
  vibe: row.vibe ?? 'visionary',
  status: row.status ?? 'active',
  target_date: iso(row.target_date),
  metadata: row.metadata && typeof row.metadata === 'object' ? row.metadata : {},
  created_at: new Date(row.created_at).toISOString(),
  updated_at: new Date(row.updated_at ?? row.created_at).toISOString(),
  endorsement_count: Number(row._count?.endorsements ?? row.endorsement_count ?? 0),
  has_endorsed: Boolean(
    row.endorsements?.some((endorsement: any) => endorsement.user_id === userId),
  ),
});

const schoolFor = (context: ORPCContext, requested?: string) => {
  const schoolId = requested ?? context.schoolId;
  if (!schoolId) throw SovereignError.invalidInput('A school scope is required');
  return schoolId;
};

export const sacredMissionsRouter = impl.router({
  list: impl.list.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    const schoolId = schoolFor(context, input.school_id);
    const rows = await (context.db as any).sanctuaryManifesto.findMany({
      where: { school_id: schoolId, status: input.status },
      orderBy: { created_at: 'desc' },
      take: input.limit,
      include: {
        endorsements: { where: { user_id: context.user.id }, select: { user_id: true } },
        _count: { select: { endorsements: true } },
      },
    });
    return rows.map((row: any) => mapManifesto(row, context.user.id));
  }),

  create: impl.create.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    const schoolId = schoolFor(context, input.school_id);
    const row = await (context.db as any).sanctuaryManifesto.create({
      data: {
        school_id: schoolId,
        creator_id: context.user.id,
        title: input.title,
        content: input.content,
        vibe: input.vibe,
        status: 'active',
        target_date: input.target_date ? new Date(input.target_date) : null,
        metadata: {},
      },
      include: {
        endorsements: { where: { user_id: context.user.id }, select: { user_id: true } },
        _count: { select: { endorsements: true } },
      },
    });
    return mapManifesto(row, context.user.id);
  }),

  endorse: impl.endorse.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    const manifestoRow = await (context.db as any).sanctuaryManifesto.findUnique({
      where: { id: input.manifestoId },
      select: { id: true, school_id: true },
    });
    if (!manifestoRow || manifestoRow.school_id !== schoolFor(context)) {
      throw SovereignError.notFound('Sacred mission');
    }
    await (context.db as any).manifestoEndorsement.upsert({
      where: {
        manifesto_id_user_id: { manifesto_id: input.manifestoId, user_id: context.user.id },
      },
      create: {
        manifesto_id: input.manifestoId,
        user_id: context.user.id,
        commitment_text: input.commitment_text ?? null,
      },
      update: { commitment_text: input.commitment_text ?? null },
    });
    return { success: true };
  }),

  unendorse: impl.unendorse.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    await (context.db as any).manifestoEndorsement.deleteMany({
      where: { manifesto_id: input.manifestoId, user_id: context.user.id },
    });
    return { success: true };
  }),
});
