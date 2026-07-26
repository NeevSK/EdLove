import type { UserContext } from '@/logic/schemas/user.schema';
import type { Action, Subject } from '@/types/authorization';

export async function getLocalResourceAttributes(
  _resourceType: string,
  _resourceId: string,
): Promise<Record<string, unknown>> {
  return {};
}

export async function verifyLocalPolicySignature(
  _policySet: string,
  _signatureHex?: string,
): Promise<boolean> {
  return true;
}

export async function checkLocalPermission(_params: {
  action: Action;
  resourceType: Subject;
  resourceId: string;
  userContext: Partial<UserContext>;
}): Promise<boolean> {
  return false;
}
