import { BOND_ENTITY_TYPES } from '@repo/policies/authorizationRegistry';

/** PERSONAL_CLASSROOM remains persisted compatibility data while the product
 * language treats it as the user's personal sanctuary perspective. */
export { BOND_ENTITY_TYPES };

export type BondEntityType = (typeof BOND_ENTITY_TYPES)[number];

export interface BondScopeInput {
  id: string;
  entity_id: string;
  entity_type: string;
  capacity: string;
}

export function resolveBondScope(bond: BondScopeInput | null | undefined) {
  if (!bond) {
    return {
      activeBondId: null,
      activeEntityId: null,
      activeEntityType: null,
      schoolId: null,
      isPersonal: false,
    } as const;
  }

  const isPersonal = bond.entity_type === 'PERSONAL' || bond.entity_type === 'PERSONAL_CLASSROOM';
  return {
    activeBondId: bond.id,
    activeEntityId: bond.entity_id,
    activeEntityType: bond.entity_type,
    schoolId: bond.entity_type === 'SCHOOL' ? bond.entity_id : null,
    isPersonal,
  } as const;
}
