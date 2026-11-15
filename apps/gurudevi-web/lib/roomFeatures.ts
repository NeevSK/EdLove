import { roomFeatures } from '@repo/core/logic/floor';
import type { FeaturePresentationMode } from '@repo/core/logic/permissions/featurePresentation';
import type { TabDomain } from '@repo/core/logic/registry/domainEntry';
import { APP_CATALOG } from './appCatalog';

/** A catalog feature as a web room lists it: what it is and where the web opens it. */
export interface WebRoomFeature {
  id: string;
  label: string;
  href: string;
  symbol: string;
  description: string;
}

/**
 * The features a web room opens, read from that room's catalog entries in the
 * AppCatalog (the same entries the phone and SanctuaryFeature read). An entry
 * the web can open has webSupport and a web route.
 */
export function webRoomFeatures(room: TabDomain): readonly WebRoomFeature[] {
  return roomFeatures(APP_CATALOG, room, null, 'web')
    .filter((entry) => entry.routes?.web)
    .map((entry) => ({
      id: entry.id,
      label: entry.label,
      href: entry.routes!.web!,
      symbol: entry.icon ?? '✨',
      description: entry.description ?? '',
    }));
}

/** SanctuaryFeature's decisions for a room, by feature id, as the server made them. */
export type RoomPresentationMap = Readonly<Record<string, FeaturePresentationMode>>;

/**
 * Whether the room lists a feature, given SanctuaryFeature's decisions from
 * the server (lib/sanctuary/roomAccess.ts). Hidden and unsupported features,
 * and features not in this person's room, take no place. With no decisions
 * (explore, dev preview) every feature is listed.
 */
export function presentationShows(
  presentation: RoomPresentationMap | undefined,
  featureId: string,
): boolean {
  if (!presentation) return true;
  const mode = presentation[featureId];
  return mode !== undefined && mode !== 'hidden' && mode !== 'unsupported';
}
