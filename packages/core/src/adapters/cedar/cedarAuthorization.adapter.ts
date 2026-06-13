import type {
  IAuthorizationPort,
  AuthorizationRequest,
  AuthorizationDecision,
} from '../../logic/ports/authz.port';
import { checkLocalPermission } from '../../logic/permissions/localEvaluator';
import type { UserContext } from '../../logic/schemas/user.schema';
import type { Actions, SubjectType } from '../../logic/permissions/abilities/base';

export class CedarAuthorizationAdapter implements IAuthorizationPort {
  async isAuthorized(request: AuthorizationRequest): Promise<AuthorizationDecision> {
    const dummyUserContext = {
      userId: request.principalId,
    } as unknown as UserContext;

    try {
      const permitted = await checkLocalPermission({
        action: request.action as Actions,
        resourceType: request.resourceType as SubjectType,
        resourceId: request.resourceId,
        userContext: dummyUserContext,
      });

      return {
        permitted,
        reason: permitted ? 'CedarPolicyEvaluation' : 'CedarDeny',
      };
    } catch (error) {
      return {
        permitted: false,
        reason: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
