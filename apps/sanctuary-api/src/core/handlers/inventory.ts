import { inventoryContract } from '@repo/core/api/inventory.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(inventoryContract).$context<ORPCContext>();
const iso = (value: unknown) =>
  value instanceof Date ? value.toISOString() : value ? String(value) : null;

const requireUser = (context: ORPCContext) => {
  assertDatabase(context);
  if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
};

const mapItem = (row: any) => ({
  id: String(row.id),
  school_id: String(row.school_id),
  classroom_id: row.classroom_id ? String(row.classroom_id) : null,
  name: String(row.name),
  category: String(row.category),
  quantity: Number(row.quantity),
  unit: row.unit ?? null,
  condition: String(row.condition),
  location: row.location ?? null,
  last_audit_at: iso(row.last_audit_at),
  created_at: iso(row.created_at) ?? new Date(0).toISOString(),
  updated_at: iso(row.updated_at) ?? new Date(0).toISOString(),
});

const mapRequest = (row: any) => ({
  id: String(row.id),
  school_id: row.school_id ? String(row.school_id) : null,
  classroom_id: row.classroom_id ? String(row.classroom_id) : null,
  teacher_id: row.teacher_id ? String(row.teacher_id) : null,
  item_name: String(row.item_name),
  quantity: String(row.quantity),
  reason: row.reason ?? null,
  status: row.status ?? null,
  priority: row.priority ?? null,
  created_at: iso(row.created_at) ?? new Date(0).toISOString(),
});

export const inventoryRouter = impl.router({
  getAll: impl.getAll.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    const rows = await context.db.inventoryItem.findMany({
      where: { classroom_id: input.params.classroomId },
      orderBy: { name: 'asc' },
    });
    return rows.map(mapItem);
  }),

  update: impl.update.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    const row = await context.db.inventoryItem.update({
      where: { id: input.params.id },
      data: {
        ...(input.body.name !== undefined ? { name: input.body.name } : {}),
        ...(input.body.category !== undefined ? { category: input.body.category } : {}),
        ...(input.body.quantity !== undefined ? { quantity: input.body.quantity } : {}),
        ...(input.body.unit !== undefined ? { unit: input.body.unit } : {}),
        ...(input.body.condition !== undefined ? { condition: input.body.condition } : {}),
        ...(input.body.location !== undefined ? { location: input.body.location } : {}),
        ...(input.body.lastAuditAt !== undefined
          ? { last_audit_at: input.body.lastAuditAt ? new Date(input.body.lastAuditAt) : null }
          : {}),
      },
    });
    return mapItem(row);
  }),

  getSchoolResourceNeeds: impl.getSchoolResourceNeeds
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireUser(context);
      const rows = await context.db.inventoryRequest.findMany({
        where: { school_id: input.params.schoolId, status: 'pending' },
        orderBy: { created_at: 'desc' },
      });
      const grouped = new Map<string, { count: number; quantity: number }>();
      for (const row of rows) {
        const current = grouped.get(row.item_name) ?? { count: 0, quantity: 0 };
        current.count += 1;
        current.quantity += Number(row.quantity) || 0;
        grouped.set(row.item_name, current);
      }
      return [...grouped.entries()].map(([resource_type, value]) => ({
        resource_type,
        description: `${resource_type} for classrooms (${value.quantity} requested)`,
        requested_by_count: value.count,
        school_id: input.params.schoolId,
      }));
    }),

  createRequest: impl.createRequest
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireUser(context);
      const item = await context.db.inventoryItem.findUnique({ where: { id: input.body.itemId } });
      if (!item) throw SovereignError.notFound('Inventory item');
      const row = await context.db.inventoryRequest.create({
        data: {
          school_id: item.school_id,
          classroom_id: item.classroom_id,
          teacher_id: context.user.id,
          item_name: item.name,
          quantity: input.body.quantity,
          reason: input.body.notes ?? null,
          status: 'pending',
          priority: 'normal',
        },
      });
      return mapRequest(row);
    }),

  getSchoolRequests: impl.getSchoolRequests
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireUser(context);
      const rows = await context.db.inventoryRequest.findMany({
        where: { school_id: input.params.schoolId },
        orderBy: { created_at: 'desc' },
      });
      return rows.map(mapRequest);
    }),
});
