import {
  IdentityBootstrapSchema,
  type ScopeBootstrap,
} from '@repo/core/api/identity.orpc.contract';
import { type createZenStackDb } from '@repo/database/client';
import { z } from 'zod';

const ScopeBondSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  entity_id: z.string(),
  entity_type: z.string(),
  capacity: z.string(),
  status: z.enum(['active', 'archived', 'revoked']).optional().default('active'),
  valid_from: z.date().optional(),
  valid_until: z.date().nullable().optional(),
  metadata: z.unknown().nullable().optional(),
});
const ScopeUserSchema = z.object({
  id: z.string(),
  email: z.string().nullable().optional(),
  full_name: z.string().optional().default(''),
  display_name: z.string().nullable().optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  onboarding_completed: z.boolean().nullable().optional(),
  capacity: z.string().nullable().optional(),
});

export type ScopeBond = z.infer<typeof ScopeBondSchema>;
export type ScopeUser = z.infer<typeof ScopeUserSchema>;

export function resolvePersonalCapacityChange(
  existingCapacity: string | null,
  requestedCapacity: string,
  confirmed: boolean,
): { capacity: string; updateBond: boolean } {
  if (!existingCapacity) return { capacity: requestedCapacity, updateBond: true };
  if (existingCapacity === requestedCapacity || !confirmed) {
    return { capacity: existingCapacity, updateBond: false };
  }
  return { capacity: requestedCapacity, updateBond: true };
}

type PersonalBondWriter = {
  create(args: {
    data: {
      user_id: string;
      entity_id: string;
      entity_type: 'PERSONAL_CLASSROOM';
      capacity: string;
      metadata: { source: 'initial_personal_sanctuary' };
    };
  }): Promise<unknown>;
  update(args: { where: { id: string }; data: { capacity: string } }): Promise<unknown>;
};

export async function persistPersonalSanctuaryBondCapacity(
  writer: PersonalBondWriter,
  existingBondInput: unknown,
  userId: string,
  entityId: string,
  capacity: string,
  updateExisting: boolean,
): Promise<ScopeBond> {
  const existingBond = existingBondInput === null ? null : ScopeBondSchema.parse(existingBondInput);
  if (
    existingBond &&
    (existingBond.user_id !== userId ||
      existingBond.entity_id !== entityId ||
      existingBond.entity_type !== 'PERSONAL_CLASSROOM')
  ) {
    throw new Error('Capacity changes may only target the caller-owned Personal Sanctuary bond.');
  }
  if (existingBond && !updateExisting) return existingBond;
  const result = existingBond
    ? await writer.update({ where: { id: existingBond.id }, data: { capacity } })
    : await writer.create({
        data: {
          user_id: userId,
          entity_id: entityId,
          entity_type: 'PERSONAL_CLASSROOM',
          capacity,
          metadata: { source: 'initial_personal_sanctuary' },
        },
      });
  return ScopeBondSchema.parse(result);
}

type ActiveScopeDb = {
  bond: {
    findFirst(args: {
      where: {
        id: string;
        user_id: string;
        status: 'active';
        valid_from: { lte: Date };
        OR: [{ valid_until: null }, { valid_until: { gt: Date } }];
      };
    }): Promise<unknown>;
  };
  userPreferences: {
    findUnique(args: {
      where: { user_id: string };
      select: { active_bond_id: true };
    }): Promise<unknown>;
    update(args: { where: { user_id: string }; data: { active_bond_id: null } }): Promise<unknown>;
  };
};

type ZenStackDb = ReturnType<typeof createZenStackDb>;

export function activeScopeReader(db: ZenStackDb): ActiveScopeDb {
  return {
    bond: {
      async findFirst({ where }) {
        const result = await db.bond.findFirst({
          where,
          select: {
            id: true,
            user_id: true,
            entity_id: true,
            entity_type: true,
            capacity: true,
            status: true,
            valid_from: true,
            valid_until: true,
            metadata: true,
          },
        });
        return result === null ? null : ScopeBondSchema.parse(result);
      },
    },
    userPreferences: {
      async findUnique({ where, select }) {
        const result = await db.userPreferences.findUnique({ where, select });
        return result === null
          ? null
          : z.object({ active_bond_id: z.string().nullable() }).parse(result);
      },
      update: ({ where, data }) => db.userPreferences.update({ where, data }),
    },
  };
}

export async function resolvePersistedActiveBond(
  db: ActiveScopeDb,
  userId: string,
  now = new Date(),
): Promise<ScopeBond | null> {
  const preferences = await db.userPreferences.findUnique({
    where: { user_id: userId },
    select: { active_bond_id: true },
  });
  const parsedPreferences = preferences
    ? z.object({ active_bond_id: z.string().nullable() }).parse(preferences)
    : null;
  const bondId = parsedPreferences?.active_bond_id;
  if (!bondId) return null;

  const bondResult = await db.bond.findFirst({
    where: {
      id: bondId,
      user_id: userId,
      status: 'active',
      valid_from: { lte: now },
      OR: [{ valid_until: null }, { valid_until: { gt: now } }],
    },
  });
  const bond = bondResult === null ? null : ScopeBondSchema.parse(bondResult);
  if (bond) return bond;

  await db.userPreferences.update({
    where: { user_id: userId },
    data: { active_bond_id: null },
  });
  return null;
}

export function buildIdentityBootstrap(
  userInput: unknown,
  bondInput: unknown,
  activeBondInput: unknown,
  now = new Date(),
) {
  const user = ScopeUserSchema.parse(userInput);
  const bonds = z.array(ScopeBondSchema).parse(bondInput);
  const activeBond = activeBondInput === null ? null : ScopeBondSchema.parse(activeBondInput);
  const validBonds = bonds.filter(
    (bond) =>
      bond.status === 'active' &&
      bond.valid_from <= now &&
      (!bond.valid_until || bond.valid_until > now),
  );
  const selected = activeBond
    ? (validBonds.find((bond) => bond.id === activeBond.id) ?? null)
    : null;
  const selectedRoles = selected
    ? validBonds
        .filter(
          (bond) =>
            bond.entity_id === selected.entity_id && bond.entity_type === selected.entity_type,
        )
        .map((bond) => bond.capacity)
        .filter((capacity, index, capacities) => capacities.indexOf(capacity) === index)
        .sort()
    : [];
  const name = user.display_name || user.full_name || '';
  const scopeBootstrap: ScopeBootstrap = {
    version: 1,
    userId: user.id,
    name,
    primaryCapacity: selected?.capacity ?? null,
    selection: selected ? 'selected' : 'needs_selection',
    activeScope: selected
      ? {
          bondId: selected.id,
          entityId: selected.entity_id,
          entityType: selected.entity_type,
          roles: selectedRoles,
        }
      : null,
  };

  return IdentityBootstrapSchema.parse({
    id: user.id,
    email: user.email,
    name,
    display_name: name,
    first_name: user.first_name,
    last_name: user.last_name,
    onboarding_completed: user.onboarding_completed,
    activeBond: selected
      ? {
          id: selected.id,
          user_id: selected.user_id,
          entity_id: selected.entity_id,
          entity_type: selected.entity_type,
          capacity: selected.capacity,
          status: 'active',
        }
      : null,
    availableBonds: validBonds.map((bond) => ({
      id: bond.id,
      user_id: bond.user_id,
      entity_id: bond.entity_id,
      entity_type: bond.entity_type,
      capacity: bond.capacity,
      status: 'active',
    })),
    scopeBootstrap,
  });
}

export function buildEmptyIdentityBootstrap(userId: string) {
  return IdentityBootstrapSchema.parse({
    id: userId === 'anonymous' ? 'anonymous' : userId,
    email: null,
    name: '',
    display_name: '',
    activeBond: null,
    availableBonds: [],
    scopeBootstrap: {
      version: 1,
      userId: userId === 'anonymous' ? null : userId,
      name: '',
      primaryCapacity: null,
      selection: 'needs_selection',
      activeScope: null,
    },
  });
}
