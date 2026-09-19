import { SelfFeatureRenderer } from '@repo/self/components/SelfFeatureRenderer';
import { canonicalSelfFeatureId } from '@repo/self/constants/selfRegistry';
import type { ReactElement } from 'react';

type LegacyFeatureProps = Readonly<{ userId?: string }>;

/**
 * @deprecated Use `SelfFeatureRenderer` with a canonical catalog feature ID.
 * This remains a read-compatible public subpath export until downstream callers
 * have migrated; it deliberately delegates to the one renderer.
 */
export const FEATURE_COMPONENT_MAP: Readonly<
  Record<string, (props: LegacyFeatureProps) => ReactElement>
> = Object.freeze(
  Object.fromEntries(
    [
      'mood_lotus',
      'fire_journal',
      'wisdom_seeds',
      'study_rhythm',
      'daily_rhythm',
      'sleep_tracker',
      'joy_jar',
      'tomorrow_prep',
      'voice_journal',
      'reminders',
      'reframe',
    ].map((featureId) => [
      featureId,
      ({ userId }: LegacyFeatureProps) => (
        <SelfFeatureRenderer featureId={featureId} userId={userId} />
      ),
    ]),
  ),
);

/**
 * Compatibility adapter for legacy role views. Component identity belongs to the
 * catalog and SelfFeatureRenderer, so old and new Self surfaces cannot drift.
 */
export function resolveFeatureContent(id: string, userId?: string) {
  const featureId = canonicalSelfFeatureId(id);
  return <SelfFeatureRenderer featureId={featureId} userId={userId} />;
}
