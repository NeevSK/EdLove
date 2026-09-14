import type { ExploreSelfReflectionAdapter } from '../explore';

export type SanctuarySessionKind = 'explore' | 'guest-cloud' | 'account';

/**
 * Delivery routes select a session and its data ports; they never select a
 * separate feature tree. Guest-cloud remains intentionally unimplemented.
 */
export interface SanctuaryExperience {
  readonly displayName: string;
  readonly kind: SanctuarySessionKind;
  readonly navigationPrefix: string;
  readonly selfReflection: ExploreSelfReflectionAdapter;
}
