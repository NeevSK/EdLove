import type { ResourceOwnerContext } from '../types';

export const RESOURCE_OWNER_CONTEXT = {
  CLASSROOM: 'classroom',
  INSTITUTIONAL: 'institutional',
} as const satisfies Record<string, ResourceOwnerContext>;

export const CLASSROOM_RESOURCE_SCOPE = {
  owner_context: RESOURCE_OWNER_CONTEXT.CLASSROOM,
} as const;

export const INSTITUTIONAL_RESOURCE_SCOPE = {
  owner_context: RESOURCE_OWNER_CONTEXT.INSTITUTIONAL,
} as const;

interface ResourceScopeInput {
  ownerContext?: ResourceOwnerContext | null;
  classroomId?: string | null;
}

export function resolveResourceOwnerContext(input: ResourceScopeInput): ResourceOwnerContext {
  if (input.ownerContext) return input.ownerContext;
  if (input.classroomId) return RESOURCE_OWNER_CONTEXT.CLASSROOM;
  return RESOURCE_OWNER_CONTEXT.INSTITUTIONAL;
}

export function isClassroomOwnedResource(input: ResourceScopeInput): boolean {
  return resolveResourceOwnerContext(input) === RESOURCE_OWNER_CONTEXT.CLASSROOM;
}
