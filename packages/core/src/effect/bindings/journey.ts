import { journeySnapshotStore } from '@repo/core/adapters/storage/journeySnapshot.adapter';
import type { JourneySnapshotStore } from '@repo/core/logic/ports/journeySnapshot.port';

/** Role journey snapshots on the device; one that can't be read loads as null. */
export const journeySnapshots: JourneySnapshotStore = journeySnapshotStore;
