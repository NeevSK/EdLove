import type { UserContext } from '../schemas/user.schema';
import type { Actions, SubjectType } from './abilities/base';

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
  action: Actions;
  resourceType: SubjectType;
  resourceId: string;
  userContext: Partial<UserContext>;
}): Promise<boolean> {
  return false;
}
