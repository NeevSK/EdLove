import type { IDeviceIdentity } from '@repo/core/logic/interfaces/deviceIdentity.port';

export class DeviceIdentityDriver implements IDeviceIdentity {
  private adapter: IDeviceIdentity | null = null;

  registerAdapter(adapter: IDeviceIdentity) {
    this.adapter = adapter;
  }

  private getAdapter(): IDeviceIdentity {
    if (!this.adapter) {
      throw new Error('[DeviceIdentityDriver] No adapter registered.');
    }
    return this.adapter;
  }

  async generateHardwareKey(alias: string): Promise<string> {
    return this.getAdapter().generateHardwareKey(alias);
  }

  async signWithHardwareKey(alias: string, challenge: string): Promise<string> {
    return this.getAdapter().signWithHardwareKey(alias, challenge);
  }

  async getAttestation(alias: string, challenge?: string): Promise<string> {
    return this.getAdapter().getAttestation(alias, challenge);
  }

  async isSupported(): Promise<boolean> {
    return this.getAdapter().isSupported();
  }
}

export const deviceIdentityDriver = new DeviceIdentityDriver();
export const deviceIdentity = deviceIdentityDriver;
