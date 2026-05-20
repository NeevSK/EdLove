import { growth } from '../logic';
import type {
  Challenge,
  ChallengeMetric,
  ChallengeProgress,
  PersonalCompass,
} from '../types/Growth';


/**
 * contextualChallengesAPI (Legacy Proxy)
 *
 * Superseded by GrowthManager. Now redirects to the sovereign Growth domain.
 */
export const contextualChallengesAPI = {
  async getClassChallenge(classroomId: string): Promise<Challenge | null> {
    const challenges = await growth.getChallenges('', classroomId);
    return challenges[0] || null;
  },

  async createClassChallenge(
    classroomId: string,
    creatorUserId: string,
    schoolId: string,
    metric: ChallengeMetric,
    targetCount: number,
    titleEn: string,
    durationDays = 7,
  ): Promise<Challenge> {
    return growth.createChallenge({
      type: 'class_collective_pulse',
      classroom_id: classroomId,
      school_id: schoolId,
      creator_user_id: creatorUserId,
      title_en: titleEn,
      metric,
      target_count: targetCount,
      duration_days: durationDays,
    });
  },

  async getSchoolChallenge(schoolId: string): Promise<Challenge | null> {
    const challenges = await growth.getChallenges(schoolId);
    return challenges[0] || null;
  },

  async createSchoolChallenge(
    schoolId: string,
    principalUserId: string,
    metric: ChallengeMetric,
    targetCount: number,
    titleEn: string,
    durationDays = 30,
  ): Promise<Challenge> {
    return growth.createChallenge({
      type: 'school_season_challenge',
      school_id: schoolId,
      creator_user_id: principalUserId,
      title_en: titleEn,
      metric,
      target_count: targetCount,
      duration_days: durationDays,
    });
  },

  async getPersonalCompass(userId: string): Promise<PersonalCompass | null> {
    const compasses = await growth.getPersonalCompasses(userId);
    return compasses[0] || null;
  },

  async setPersonalCompass(
    userId: string,
    metric: ChallengeMetric,
    targetCount: number,
    titleEn: string,
    durationDays = 7,
  ): Promise<PersonalCompass> {
    return growth.setPersonalCompass(userId, {
      metric,
      target_count: targetCount,
      title_en: titleEn,
      duration_days: durationDays,
    });
  },

  async clearPersonalCompass(userId: string): Promise<void> {
    await growth.clearPersonalCompass(userId);
  },

  async recordContribution(
    userId: string,
    metric: ChallengeMetric,
    classroomId?: string,
    schoolId?: string,
  ): Promise<void> {
    await growth.recordContribution(userId, metric, classroomId, schoolId);
  },

  getProgress(challenge: Challenge): ChallengeProgress {
    return growth.getProgress(challenge);
  },

  getCompassProgress(compass: PersonalCompass): {
    progress_fraction: number;
    narrative_en: string;
    is_complete: boolean;
  } {
    return growth.getCompassProgress(compass);
  },

  async getRecentCompletions(schoolId: string, classroomId?: string): Promise<Challenge[]> {
    return growth.getChallenges(schoolId, classroomId); // Simplified for proxy
  },
};
