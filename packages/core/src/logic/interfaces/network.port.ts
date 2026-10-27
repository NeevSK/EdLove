export type NetworkStatus = 'unknown' | 'online' | 'offline';
export type NetworkSource = 'none' | 'native-netinfo' | 'browser-navigator';

export interface NetworkConnectionMetadata {
  type: string | null;
  isMetered: boolean | null;
  cellularGeneration: string | null;
  /** Optional browser estimates; absent on platforms that cannot observe them. */
  effectiveType?: string | null;
  rttMs?: number | null;
  downKbps?: number | null;
  dataSaver?: boolean | null;
}

export interface NetworkSnapshot {
  status: NetworkStatus;
  source: NetworkSource;
  connection: NetworkConnectionMetadata | null;
}

export interface INetwork {
  getSnapshot(): NetworkSnapshot;
  subscribe(listener: () => void): () => void;
}
