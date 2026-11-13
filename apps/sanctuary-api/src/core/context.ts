import type { Platform } from '../platform';
import type { AuthenticatedIdentity } from '../security/security';

export interface APIContext {
  requestId: string;
  identity?: AuthenticatedIdentity;
  platform?: Pick<Platform, 'security' | 'executeAccountCommand' | 'syncGrants' | 'withAccountData'>;
}
