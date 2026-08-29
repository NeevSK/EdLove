/**
 * ThoughtRecordRepository — local-first persistence for the Reframe feature.
 *
 * Composition root wiring the core reflection store with self's RPC client
 * and table. All pure mapping/orchestration lives in
 * @repo/core/logic/reflection/records; this file only composes.
 */
import { thoughtRecords } from '@repo/core/adapters/powersync/schema';
import {
  createDrizzleReflectionDb,
  createThoughtRecordStore,
  thoughtRecordCodec,
} from '@repo/core/logic/reflection/records';
import { selfAPI } from '@repo/self/api/self';
import { Platform } from 'react-native';

/**
 * Self's RPC client already matches ThoughtRecordRpcPort<WireThoughtRecord>
 * exactly (same wire types from @repo/core/logic/schemas/self.schema).
 * Growth signals are emitted as a side-effect in selfAPI methods.
 */
const store = createThoughtRecordStore({
  rpc: selfAPI,
  codec: thoughtRecordCodec,
  db: () => createDrizzleReflectionDb(thoughtRecords),
  outbox: {
    saveName: 'saveThoughtRecord',
    completeName: 'completeThoughtRecordFollowUp',
    scope: 'wellbeing',
  },
  isLocalFirstAvailable: () => Platform.OS !== 'web',
});

export const createThoughtRecord = store.createThoughtRecord;
export const fetchThoughtRecordsForView = store.fetchThoughtRecordsForView;
export const completeThoughtRecordFollowUp = store.completeThoughtRecordFollowUp;
