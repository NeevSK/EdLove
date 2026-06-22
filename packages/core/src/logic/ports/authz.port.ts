export interface AuthorizationRequest {
  principalId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  context?: Record<string, any>;
}

export interface AuthorizationDecision {
  permitted: boolean;
  reason?: string;
}

export interface IAuthorizationPort {
  isAuthorized(request: AuthorizationRequest): Promise<AuthorizationDecision>;
}
