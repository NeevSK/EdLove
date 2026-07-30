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

export interface TokenContext {
  principalId: string;
  tenantId: string;
  operationContext: string;
  deviceId?: string;
}

export interface CapabilityToken {
  tokenId: string;
  principalId: string;
  tenantId: string;
  operationContext: string;
  deviceId: string;
  issuedAt: number;
  expiresAt: number;
  policyVersionHash: string;
}

export interface TokenValidation {
  valid: boolean;
  reason?: string;
}

export interface IAuthorizationPort {
  isAuthorized(request: AuthorizationRequest): Promise<AuthorizationDecision>;

  issueCapabilityToken(context: TokenContext): Promise<CapabilityToken>;
}
