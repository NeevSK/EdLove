import {
  type Admission,
  admitWork,
  type CapacityFacts,
  GURUDEVI_MOBILE_HOST,
  GURUDEVI_WORKLOADS,
  UNKNOWN_CAPACITY,
  type VergerSnapshot,
  vergerFloors,
} from '@repo/core/verger';
import { totalMemory } from 'expo-device';
import { readDeviceEvents } from './deviceSignals';

const facts = (): CapacityFacts => ({ ...UNKNOWN_CAPACITY, totalMemoryBytes: totalMemory });

/**
 * Whether a background workload from Gurudevi's registry may run now. Background tasks run
 * where verger does not, so the device is read once and folded into verger's floors, and the
 * workload is admitted by its class and the accounts it spends (`admitWork`): the same rules as
 * the app, metered is home and unknown is never a limit.
 */
export async function admitBackgroundWork(workloadId: string): Promise<Admission> {
  const workload = GURUDEVI_WORKLOADS.find((candidate) => candidate.id === workloadId);
  if (!workload) throw new Error(`Unknown workload "${workloadId}"`);
  const snapshot = await readBackgroundSnapshot();
  if (snapshot === null) return { admit: false, reason: 'verger-unavailable' };
  return admitWork(snapshot, workload, GURUDEVI_MOBILE_HOST.config);
}

/**
 * Verger's view of the device for work outside it (admission, and what background jobs record
 * about the device): its floors over one reading of each source. Null if the floors fail.
 */
export async function readBackgroundSnapshot(): Promise<VergerSnapshot | null> {
  return vergerFloors({ host: GURUDEVI_MOBILE_HOST, facts, events: await readDeviceEvents(0) });
}
