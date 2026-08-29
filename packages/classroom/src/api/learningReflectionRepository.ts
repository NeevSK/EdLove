import { learningReflections } from '@repo/core/adapters/powersync/schema';
import {
  createDrizzleReflectionDb,
  createThoughtRecordStore,
  type ReflectionRecordCodec,
  type ReflectionRowWithExtras,
  thoughtRecordCodec,
} from '@repo/core/logic/reflection/records';
import type { ReframeOutcome, ThoughtRecord } from '@repo/core/logic/reflection/types';

export type { ReframeOutcome };

import { learningReflectionAPI } from '@repo/classroom/api/learningReflections';

/** Classroom reflection extends the base with classroom/assignment context. */
export type LearningReflection = ThoughtRecord & {
  classroomId?: string;
  assignmentId?: string;
};

/** Codec that adds classroom/assignment context to row and wire payload. */
const learningReflectionCodec: ReflectionRecordCodec<LearningReflection> = {
  rowToDomain: (row) => ({
    ...thoughtRecordCodec.rowToDomain(row),
    classroomId: (row as ReflectionRowWithExtras)['classroom_id'] as string | undefined,
    assignmentId: (row as ReflectionRowWithExtras)['assignment_id'] as string | undefined,
  }),
  wireToDomain: (wire) => ({
    ...thoughtRecordCodec.wireToDomain(wire),
    classroomId: (wire as Record<string, unknown>)['classroom_id'] as string | undefined,
    assignmentId: (wire as Record<string, unknown>)['assignment_id'] as string | undefined,
  }),
  domainToRow: (record) => {
    const base = thoughtRecordCodec.domainToRow(record);
    return {
      ...base,
      classroom_id: record.classroomId ?? null,
      assignment_id: record.assignmentId ?? null,
    };
  },
  domainToWire: (record) => {
    const base = thoughtRecordCodec.domainToWire(record);
    return {
      ...base,
      classroom_id: record.classroomId ?? null,
      assignment_id: record.assignmentId ?? null,
    };
  },
};

const store = createThoughtRecordStore<LearningReflection>({
  rpc: learningReflectionAPI,
  codec: learningReflectionCodec,
  db: () => createDrizzleReflectionDb(learningReflections as any),
  outbox: {
    saveName: 'saveLearningReflection',
    completeName: 'completeLearningReflectionFollowUp',
    scope: 'classroom',
  },
  isLocalFirstAvailable: () => true,
});

export const createLearningReflection = store.createThoughtRecord;
export const fetchLearningReflectionsForView = store.fetchThoughtRecordsForView;
export const completeLearningReflectionFollowUp = store.completeThoughtRecordFollowUp;
