import {
  DEFAULT_LANDING_POLICY,
  type PrimaryPlaceRoute,
} from '@repo/core/logic/places/landingPolicy';
import { PLACE_ROUTES } from '@repo/core/logic/places/placeRoutes';

/**
 * Default admitted landing route derived from `DEFAULT_LANDING_POLICY.defaultPlace`
 * (`/workspace` for everyone; dynamic overrides live in `resolveAppLandingRoute`).
 */
export function getFirstValueRoute(_capacity?: string | null): PrimaryPlaceRoute {
  return PLACE_ROUTES.mobile[DEFAULT_LANDING_POLICY.defaultPlace] as PrimaryPlaceRoute;
}
