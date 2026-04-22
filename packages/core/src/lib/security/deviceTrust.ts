import { deviceTrustAPI } from '../../api/deviceTrust';

export const DeviceTrustEngine = {
  async logAuditEvent(accountId: string, action: string, metadata: Record<string, unknown> = {}) {
    return deviceTrustAPI.logAuditEvent(action, metadata, accountId);
  },

  async checkDeviceTrustStatus(_deviceId?: string): Promise<boolean> {
    return deviceTrustAPI.isCurrentDeviceTrusted();
  },
};
