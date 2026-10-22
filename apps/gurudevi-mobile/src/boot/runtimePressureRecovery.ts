import type { RuntimePressureSnapshot } from '../../modules/runtime-pressure';

const CLEAR_SNAPSHOT: RuntimePressureSnapshot = { memory: 'unknown', thermal: 'unknown' };

function hasPressure(snapshot: RuntimePressureSnapshot): boolean {
  return [snapshot.memory, snapshot.thermal].some(
    (pressure) => pressure === 'constrained' || pressure === 'severe',
  );
}

export function createRuntimePressureRecovery(
  onSnapshot: (snapshot: RuntimePressureSnapshot) => void,
  recoveryWindowMs: number,
) {
  let observedPressure = false;
  let recoveryTimer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;

  return {
    update(snapshot: RuntimePressureSnapshot) {
      if (disposed) return;
      onSnapshot(snapshot);
      if (hasPressure(snapshot)) {
        observedPressure = true;
        if (recoveryTimer !== undefined) clearTimeout(recoveryTimer);
        recoveryTimer = undefined;
        return;
      }
      if (!observedPressure) return;

      if (recoveryTimer !== undefined) clearTimeout(recoveryTimer);
      recoveryTimer = setTimeout(() => {
        observedPressure = false;
        recoveryTimer = undefined;
        onSnapshot(CLEAR_SNAPSHOT);
      }, recoveryWindowMs);
    },
    dispose() {
      disposed = true;
      if (recoveryTimer !== undefined) clearTimeout(recoveryTimer);
      recoveryTimer = undefined;
    },
  };
}
