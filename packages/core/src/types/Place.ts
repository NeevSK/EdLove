/**
 * The places a person moves between (`docs/architecture/places-roles-and-features.md`): one word
 * each, the same on every platform. `logic/places/placeRoutes` says where each is.
 */
export type Place =
  | 'self'
  | 'workspace'
  | 'library'
  | 'community'
  | 'profile'
  | 'notifications'
  | 'settings';
