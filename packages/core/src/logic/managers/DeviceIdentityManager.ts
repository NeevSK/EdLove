import { type IDeviceIdentity, TrustLevel } from '../interfaces/deviceIdentity.port';

/**
 * DeviceIdentityManager
 *
 * Orchestrates the "Adaptive Trust" flow.
 * Allows the platform to "Step Up" security contextually (e.g., only when accessing grades).
 */
export class DeviceIdentityManager {
  private adapter: IDeviceIdentity | null = null;
  private readonly KEY_ALIAS = 'gurudevi_sovereign_identity';

  registerAdapter(adapter: IDeviceIdentity) {
    this.adapter = adapter;
  }

  private getAdapter(): IDeviceIdentity {
    if (!this.adapter) {
      throw new Error('[DeviceIdentityManager] No adapter registered.');
    }
    return this.adapter;
  }

  /**
   * Returns the current cryptographic trust level of the session.
   */
  async getTrustLevel(): Promise<TrustLevel> {
    if (!this.adapter || !(await this.adapter.isSupported())) {
      return TrustLevel.NONE;
    }

    // In a real implementation, check if the hardware key actually exists
    try {
      const publicKey = await this.adapter.generateHardwareKey(this.KEY_ALIAS);
      if (publicKey) {
        // Here we could further check for attestation to return ATTESTED
        return TrustLevel.HARDWARE;
      }
    } catch {
      return TrustLevel.SOFT;
    }

    return TrustLevel.SOFT;
  }

  /**
   * Ensures the device reaches a specific trust level.
   * If the current level is lower, it triggers the necessary "hassle" (Biometrics, etc.)
   */
  async stepUp(requiredLevel: TrustLevel, challenge?: string): Promise<boolean> {
    const currentLevel = await this.getTrustLevel();

    if (currentLevel >= requiredLevel) {
      return true;
    }

    if (__DEV__) {
      console.log(
        `[DeviceIdentity] Stepping up: ${TrustLevel[currentLevel]} -> ${TrustLevel[requiredLevel]}`,
      );
    }

    switch (requiredLevel) {
      case TrustLevel.HARDWARE:
        await this.getAdapter().generateHardwareKey(this.KEY_ALIAS);
        break;

      case TrustLevel.ATTESTED:
        if (!challenge) throw new Error('A server challenge is required for ATTESTED trust level.');
        await this.getAdapter().getAttestation(this.KEY_ALIAS, challenge);
        break;

      default:
        break;
    }

    return (await this.getTrustLevel()) >= requiredLevel;
  }

  /**
   * Initializes the hardware identity for this device.
   */
  async ensureIdentity(): Promise<string> {
    return await this.getAdapter().generateHardwareKey(this.KEY_ALIAS);
  }

  /**
   * Creates a "Trust Attestation" for a specific account.
   */
  async createAccountBinding(accountId: string, serverNonce: string) {
    const publicKey = await this.ensureIdentity();
    const signature = await this.getAdapter().signWithHardwareKey(this.KEY_ALIAS, serverNonce);
    const attestation = await this.getAdapter().getAttestation(this.KEY_ALIAS, serverNonce);

    return {
      publicKey,
      signature,
      attestation,
      accountId,
      timestamp: new Date().toISOString(),
      trustLevel: await this.getTrustLevel(),
    };
  }

  /**
   * Quick-verify the device for a stateless operation.
   */
  async verifyHardware(challenge: string) {
    return await this.getAdapter().signWithHardwareKey(this.KEY_ALIAS, challenge);
  }
}

export const deviceIdentity = new DeviceIdentityManager();
