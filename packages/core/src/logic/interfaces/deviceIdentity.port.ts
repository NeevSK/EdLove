/**
 * TrustLevel
 *
 * Defines the cryptographic strength of the current device session across the 5-tier gradient.
 */
export enum TrustLevel {
  NONE = 0, // No device identity / anonymous
  SOFT = 1, // Local storage ID (Install ID)
  VERIFIED = 2, // Active link in device_accounts & is_trusted = true
  HARDWARE = 3, // Hardware-bound key exists (Secure Enclave / Android KeyStore)
  ATTESTED = 4, // Hardware-bound key + OS Integrity (DeviceCheck / Play Integrity)
}

/**
 * IDeviceIdentity
 *
 * Sovereign Port for Hardware-Bound Identity.
 * This interface abstracts the underlying security module (Secure Enclave / StrongBox).
 */
export interface IDeviceIdentity {
  /**
   * Generates a non-exportable hardware-bound key pair.
   * Returns the Public Key (Base64).
   */
  generateHardwareKey(alias: string): Promise<string>;

  /**
   * Signs a challenge (nonce) using the hardware private key.
   * Typically requires biometric/passcode unlock.
   */
  signWithHardwareKey(alias: string, challenge: string): Promise<string>;

  /**
   * Returns a platform attestation token (DeviceCheck / Play Integrity).
   * Proves that the app and device are authentic.
   */
  getAttestation(alias: string, challenge?: string): Promise<string>;

  /**
   * Returns if hardware-bound identity is supported on this device.
   */
  isSupported(): Promise<boolean>;
}
