import NetInfo from '@react-native-community/netinfo';
import type { INetwork } from '@/logic/interfaces/network.port';

/**
 * NativeNetworkAdapter
 * Uses React Native Community NetInfo to detect actual device connectivity.
 */
export class NativeNetworkAdapter implements INetwork {
  async isConnected(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return !!state.isConnected;
  }
}
