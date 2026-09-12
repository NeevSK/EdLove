export type SelfCanvasPersistenceState = 'idle' | 'saving' | 'queued' | 'local' | 'localError' | 'synced';

export type SelfCanvasPersistenceFeedback = {
  label: string;
  canRetry: boolean;
};

/**
 * Copy is intentionally precise: local storage is confirmed separately from
 * the server so a network failure never looks like a completed cloud save.
 */
export function describeSelfCanvasPersistence(
  state: SelfCanvasPersistenceState,
): SelfCanvasPersistenceFeedback {
  switch (state) {
    case 'saving':
      return { label: 'Saving your sanctuary layout…', canRetry: false };
    case 'queued':
      return { label: 'Saved on this device. Sync needs a connection.', canRetry: true };
    case 'local':
      return { label: 'Saved on this device. Create an account to keep it across devices.', canRetry: false };
    case 'localError':
      return { label: 'Could not save your sanctuary layout on this device.', canRetry: true };
    case 'synced':
      return { label: 'Sanctuary layout synced', canRetry: false };
    default:
      return { label: '', canRetry: false };
  }
}
