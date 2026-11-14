import type { AppHref } from '@repo/core/routing/routeHref';
import type { Place } from '@repo/core/types/Place';

export type { Place };

/**
 * The places a person moves between (`docs/architecture/places-roles-and-features.md`): one word
 * each, the same on every platform. What a place shows differs by role (Workspace is one floor per
 * capacity, from `workspaceCatalog`); where it is does not. Code that sends someone to a place names
 * the place, and this table says where that is on each platform, so no caller writes a screen name
 * or a route of its own.
 */
/** Each place's route per platform; typed against both route catalogues, so a missing one fails the type check. */
export const PLACE_ROUTES: {
  readonly mobile: { readonly [P in Place]: AppHref<'mobile'> };
  readonly web: { readonly [P in Place]: AppHref<'web'> };
} = {
  mobile: {
    self: '/self',
    workspace: '/workspace',
    library: '/library',
    community: '/community',
    profile: '/profile',
    notifications: '/notifications',
    settings: '/settings',
  },
  web: {
    self: '/self',
    workspace: '/workspace',
    library: '/library',
    community: '/community',
    profile: '/profile',
    notifications: '/notifications',
    settings: '/settings',
  },
};

/** Every place, in the order the tables list them. */
export const PLACES = Object.keys(PLACE_ROUTES.web) as readonly Place[];

export const isPlace = (value: unknown): value is Place =>
  typeof value === 'string' && Object.hasOwn(PLACE_ROUTES.web, value);
