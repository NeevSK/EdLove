import type { UserContext } from '@repo/core/logic/schemas/user.schema';
import type { Action, Subject } from '@repo/core/types/authorization';

export async function getLocalResourceAttributes(
  _resourceType: string,
  _resourceId: string,
): Promise<Record<string, unknown>> {
  return {};
}

export async function verifyLocalPolicySignature(
  _policySet: string,
  _signature?: string,
): Promise<boolean> {
  return false;
}

export async function checkLocalPermission(_params: {
  action: Action;
  resourceType: Subject;
  resourceId: string;
  userContext: Partial<UserContext>;
}): Promise<boolean> {
  return false;
}
