import { subscribeToNetwork } from '@repo/core/adapters/subscribeToNetwork';
import { networkManager } from '@repo/core/logic/managers/NetworkManager';
import type { NetworkTransport } from '@repo/core/verger';
import type { BrowserNetworkSignals } from '@repo/verger-web';

const TRANSPORTS: Readonly<Record<string, NetworkTransport>> = {
  wifi: 'wifi',
  cellular: 'cellular',
  ethernet: 'ethernet',
  none: 'none',
};

/** Browser online is a hint; it must never become validated internet access in Verger. */
export const browserNetworkSignals: BrowserNetworkSignals = (send, now) => {
  const update = () => {
    const { status, connection } = networkManager.getSnapshot();
    const type = connection?.type;
    send({
      type: 'network',
      at: now(),
      transport:
        status === 'offline'
          ? 'none'
          : status === 'unknown' || !type || type === 'unknown'
            ? null
            : (TRANSPORTS[type] ?? 'other'),
      validated: status === 'offline' ? false : null,
      metered: connection?.isMetered ?? null,
      downKbps: connection?.downKbps ?? null,
      dataSaver:
        connection?.dataSaver === undefined || connection.dataSaver === null
          ? null
          : connection.dataSaver
            ? 'enabled'
            : 'disabled',
    });
  };
  const unsubscribe = subscribeToNetwork(update);
  update();
  return unsubscribe;
};
