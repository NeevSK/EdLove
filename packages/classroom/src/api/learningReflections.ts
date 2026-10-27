import { useAuthStore } from '@repo/core/store';
import { orpcClient } from '@repo/core/api/orpcClient';

import type { LearningReflection } from '@repo/core/logic/schemas/classroom.schema';

function assertAuthenticated() {
  const state = useAuthStore.getState();
  if (!state.user || state.user.is_anonymous) {
    throw new Error('Forbidden');
  }
}

export const learningReflectionAPI = {
  async saveThoughtRecord(
    input: Omit<LearningReflection, 'id' | 'created_at' | 'user_id'>,
  ): Promise<LearningReflection> {
    assertAuthenticated();
    try {
      const res = await orpcClient.learningReflections.saveLearningReflection({
        body: {
          classroom_id: input.classroom_id,
          assignment_id: input.assignment_id,
          thought: input.thought,
          situation: input.situation,
          emotion: input.emotion,
          trap_ids: input.trap_ids,
          evidence_for: input.evidence_for,
          evidence_against: input.evidence_against,
          reframe: input.reframe,
          mood_before: input.mood_before,
          mood_after: input.mood_after,
          post_outcome: input.post_outcome,
          follow_up: input.follow_up,
        },
      });

      return res as LearningReflection;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to save learning reflection');
    }
  },

  async getThoughtRecords(
    userId: string,
    limit: number = 30,
    viewDate?: string,
  ): Promise<LearningReflection[]> {
    assertAuthenticated();
    try {
      const res = await orpcClient.learningReflections.getLearningReflections({
        query: {
          limit,
        },
      });

      return res as LearningReflection[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch learning reflections');
    }
  },

  async completeThoughtRecordFollowUp(
    id: string,
    input: { post_outcome?: string; follow_up?: LearningReflection['follow_up'] },
  ): Promise<LearningReflection> {
    assertAuthenticated();
    try {
      const res = await orpcClient.learningReflections.completeLearningReflectionFollowUp({
        params: { id },
        body: {
          post_outcome: input.post_outcome,
          follow_up: input.follow_up,
        },
      });

      return res as LearningReflection;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update learning reflection follow-up');
    }
  },
};
