import { MOCK_USER_PROFILES, type MockUserProfile } from '@repo/core/api/mockData';
import { getActiveAccountId } from '@repo/core/lib/accountScope';
import { answer, definePort, type PortSource } from '@repo/core/ports/definePort';
import { useQuery } from '@tanstack/react-query';

/** A badge someone earned, with the sign it shows. */
export interface ProfileBadge {
  id: string;
  label: string;
  sign: string;
  about: string;
}

/**
 * The parts of a profile the journey modules will own (bio, subjects, badges,
 * streaks). Name and bonds are not here: they come from identity, which the
 * v1 server already answers.
 */
export interface ProfileStory {
  title?: string;
  bio: string;
  subjects: readonly string[];
  focus: readonly string[];
  badges: readonly ProfileBadge[];
  streakDays: number;
  journals: number;
  circles: number;
  /** True while this is sample text, so the room can say so. */
  sample: boolean;
}

export interface ProfilePort extends PortSource {
  /** `capacity` picks a fitting sample while the journey module is a skeleton. */
  story(capacity: string | null | undefined, signal?: AbortSignal): Promise<ProfileStory>;
}

export function profileStoryOf(p: MockUserProfile): ProfileStory {
  return {
    title: p.role_title,
    bio: p.bio,
    subjects: p.subjects_taught,
    focus: p.focus_areas,
    badges: (p.custom_badges ?? []).map((b) => ({
      id: b.id,
      label: b.label,
      sign: b.icon,
      about: b.description,
    })),
    streakDays: p.stats.mindful_streak_days,
    journals: p.stats.journals_released,
    circles: p.stats.circles_visited,
    sample: p.is_sample !== false,
  };
}

const sample: ProfilePort = {
  source: 'sample',
  story: (capacity, signal) =>
    answer(
      profileStoryOf(
        MOCK_USER_PROFILES[capacity ?? ''] ??
          MOCK_USER_PROFILES.student ??
          MOCK_USER_PROFILES.teacher!,
      ),
      signal,
    ),
};

/** Where the Profile room's story comes from. Samples until journey.profile is admitted. */
export const profilePort = definePort<ProfilePort>(sample);

export function useProfileStory(capacity: string | null | undefined) {
  const port = profilePort.get();
  return useQuery({
    queryKey: ['profile', 'story', getActiveAccountId(), capacity ?? null, port.source],
    queryFn: ({ signal }) => port.story(capacity, signal),
    staleTime: 5 * 60_000,
  });
}
