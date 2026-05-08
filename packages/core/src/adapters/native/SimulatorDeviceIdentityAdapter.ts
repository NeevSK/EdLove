import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import type { IDeviceIdentity } from '../../logic/interfaces/deviceIdentity.port';

/**
 * SimulatorDeviceIdentityAdapter
 * 
 * A high-fidelity simulator for hardware-bound identity.
 * It uses SecureStore (Keychain/Keystore) to simulate the Secure Enclave
 * and expo-crypto to simulate cryptographic signing.
 * 
 * USE: Development and Testing of "Shared Device" flows without native modules.
 */
export class SimulatorDeviceIdentityAdapter implements IDeviceIdentity {
  private readonly STORAGE_PREFIX = 'simulator_hw_key_';

  async isSupported(): Promise<boolean> {
    return true; // Simulator always supports itself
  }

  async generateHardwareKey(alias: string): Promise<string> {
    const storageKey = `${this.STORAGE_PREFIX}${alias}`;
    let publicKey = await SecureStore.getItemAsync(storageKey);

    if (!publicKey) {
      // Simulate key generation by creating a unique hash
      const randomString = Math.random().toString(36).substring(7);
      publicKey = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `pub_key_sim_${randomString}`
      );
      await SecureStore.setItemAsync(storageKey, publicKey);
      
      if (__DEV__) {
        console.log(`[SimulatorIdentity] Generated Mock Hardware Key for alias: ${alias}`);
      }
    }

    return publicKey;
  }

  async signWithHardwareKey(alias: string, challenge: string): Promise<string> {
    const publicKey = await this.generateHardwareKey(alias);
    
    // Simulate an asymmetric signature by hashing the challenge with the public key
    // In reality, this would be a real RSA/ECDSA signature from the Secure Enclave.
    const signature = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${challenge}:${publicKey}:mock_private_key`
    );

    if (__DEV__) {
      console.log(`[SimulatorIdentity] Signed challenge: ${challenge.substring(0, 8)}...`);
    }

    return signature;
  }

  async getAttestation(alias: string, challenge?: string): Promise<string> {
    const publicKey = await this.generateHardwareKey(alias);
    
    // Create a mock attestation object similar to Apple/Google formats
    const mockAttestation = {
      format: 'gurudevi_simulator_v1',
      publicKey,
      challenge,
      deviceIntegrity: 'passed',
      isEmulator: false, // We lie to the server to simulate a real device
    };

    return btoa(JSON.stringify(mockAttestation));
  }
}
