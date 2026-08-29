import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/client';
import { useStore } from '@repo/core/logic';
import type { LearningReflection } from '@repo/core/logic/schemas/classroom.schema';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

function assertAuthenticated() {
  const state = useStore.getState();
  if (!state.user || state.user.is_anonymous) {
    throw new Error('Forbidden');
  }
}

export const learningReflectionAPI = {
  async saveThoughtRecord(
    input: Omit<LearningReflection, 'id' | 'created_at' | 'user_id'>,
  ): Promise<LearningReflection> {
    assertAuthenticated();
    const res = await client.api.classroom['learning-reflections'].$post({
      json: {
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

    if (!res.ok) {
      const error = (await res.json()) as any;
      throw new Error(error.message || 'Failed to save learning reflection');
    }

    return (await res.json()) as LearningReflection;
  },

  async getThoughtRecords(
    userId: string,
    limit: number = 30,
    viewDate?: string,
  ): Promise<LearningReflection[]> {
    assertAuthenticated();
    const res = await client.api.classroom['learning-reflections'].$get({
      query: {
        userId,
        limit: limit.toString(),
        viewDate,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch learning reflections');
    }

    return (await res.json()) as LearningReflection[];
  },

  async completeThoughtRecordFollowUp(
    id: string,
    input: { post_outcome?: string; follow_up?: LearningReflection['follow_up'] },
  ): Promise<LearningReflection> {
    assertAuthenticated();
    const res = await client.api.classroom['learning-reflections'][':id']['follow-up'].$patch({
      param: { id },
      json: {
        post_outcome: input.post_outcome,
        follow_up: input.follow_up,
      },
    });

    if (!res.ok) {
      const error = (await res.json()) as any;
      throw new Error(error.message || 'Failed to update learning reflection follow-up');
    }

    return (await res.json()) as LearningReflection;
  },
};
