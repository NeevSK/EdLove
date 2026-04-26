import type { INetwork } from '../logic/interfaces/network.port';

/**
 * WebNetworkAdapter
 * Uses standard browser APIs to detect connectivity.
 */
export class WebNetworkAdapter implements INetwork {
  async isConnected(): Promise<boolean> {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }
}
