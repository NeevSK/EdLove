import { deviceTrustAPI } from '@repo/core/api/deviceTrust.web';
import { describe, expect, it } from 'vitest';

describe('web device trust capability boundary', () => {
  it('does not synthesize remote session revocation', async () => {
    await expect(deviceTrustAPI.revokeSession('session-1')).rejects.toThrow(
      'Remote device and session security controls are not available in the browser yet.',
    );
    await expect(deviceTrustAPI.revokeAllSessions()).rejects.toThrow(
      'Remote device and session security controls are not available in the browser yet.',
    );
  });

  it('does not synthesize device unlinking or trust changes', async () => {
    await expect(deviceTrustAPI.unlinkDevice('device-1')).rejects.toThrow(
      'Remote device and session security controls are not available in the browser yet.',
    );
    await expect(deviceTrustAPI.trustDevice('device-1')).rejects.toThrow(
      'Remote device and session security controls are not available in the browser yet.',
    );
  });

  it('exposes the install-session method used by local account teardown', async () => {
    await expect(deviceTrustAPI.revokeMyInstallSecuritySessions('install-1')).rejects.toThrow(
      'Remote device and session security controls are not available in the browser yet.',
    );
  });
});
