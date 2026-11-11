/** A device as the account sees it: which install it is and whether it is trusted. */
export interface DeviceTrustSummary {
  deviceId: string;
  installId: string;
  isTrusted: boolean;
  modelName: string | null;
  osVersion: string | null;
  platform: string | null;
  lastSeenAt: string | null;
  lastAccessedAt: string | null;
  linkedAccountId: string | null;
}
