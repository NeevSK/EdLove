import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { cryptoManager } from '@repo/core/logic/managers/CryptoManager';

export const AppCryptoEngine = {
  /**
   * Derives a KEK from a secret (like a PIN or Security Answer) + Local Salt
   */
  async deriveKEK(secret: string, salt: string): Promise<string> {
    const normalized = secret.trim().toLowerCase();
    // Use the manager for digest
    return await cryptoManager.digestStringAsync('SHA-256', `${normalized}:${salt}`);
  },

  /**
   * Symmetric Encryption (Wraps Master DEK)
   */
  wrapMasterDEK(masterDEK: string, kek: string): string {
    // e.g. AES-GCM
    return `wrapped(${masterDEK},kek=${kek})`;
  },

  /**
   * Symmetric Decryption (Unwraps Master DEK)
   */
  unwrapMasterDEK(wrappedPayload: string, kek: string): string {
    if (!wrappedPayload.includes(`kek=${kek}`)) throw new Error('Decryption Failed: Invalid KEK');
    return wrappedPayload.split(',')[0]!.replace('wrapped(', '');
  },

  /**
   * Cloud Escrow Backup (Path B)
   * Backs up the Master DEK to the cloud, encrypted by their Supabase Cloud Key.
   */
  async escrowCloudRecoveryKey(accountId: string, masterDEK: string) {
    // In a real flow, this is encrypted with a server-side public key
    // to ensure Supabase operators cannot read it.
    const encryptedEscrow = this.wrapMasterDEK(masterDEK, `cloud_key_${accountId}`);
    await supabaseClient
      .from('users')
      .update({ escrowed_recovery_key: encryptedEscrow })
      .eq('id', accountId);
  },

  /**
   * Cloud Escrow Fetch (Path B)
   */
  async fetchCloudRecoveryKey(accountId: string): Promise<string> {
    const { data, error } = await supabaseClient
      .from('users')
      .select('escrowed_recovery_key')
      .eq('id', accountId)
      .single();

    if (error || !data?.escrowed_recovery_key) {
      throw new Error('No Cloud Escrow Key found.');
    }

    return this.unwrapMasterDEK(data.escrowed_recovery_key, `cloud_key_${accountId}`);
  },

  /**
   * Master Biometric Override (Saves raw Master DEK to hardware enclave)
   */
  async enrollParentKey(accountId: string, masterDEK: string) {
    await cryptoManager.setItemAsync(`master_dek_${accountId}`, masterDEK, {
      requireAuthentication: true,
      // Note: Options should be abstracted or passed carefully in a truly platform-agnostic way
      // For now, we pass them through to the native adapter.
    });
  },
};
