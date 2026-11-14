import type { RoutePlatform } from '@repo/core/routing/routeMatch';
import type { MOBILE_ROUTES, WEB_ROUTES } from '@repo/core/routing/routeCatalog.generated';

/**
 * Compile-time hrefs from the route catalogue (L9). `scripts/route-catalog.mjs` already writes every
 * route of both apps; these types turn that list into the hrefs a call site may write, so a link to
 * a screen that doesn't exist fails the type check, on mobile as TanStack's typed links do on the
 * web. expo-router's own generated route types don't reach `Href` in SDK 58 here (the generated
 * augmentation targets a namespace that `expo-router` only re-exports), so this does not rely on them.
 *
 * Strings that only exist at runtime (a notification's payload, registry data) can't be typed; they
 * go through `follow` in the navigator, which checks them with `checkInternalHref` instead.
 */

type Catalog<P extends RoutePlatform> = P extends 'mobile' ? typeof MOBILE_ROUTES : typeof WEB_ROUTES;

/** A route pattern as the router accepts it: `/(tabs)/workspace/[id]` or `/workspace/[id]`. */
export type RoutePattern<P extends RoutePlatform = 'mobile'> =
  | Catalog<P>[number]
  | WithoutGroups<Catalog<P>[number]>;

type StripGroups<S extends string> = S extends `${infer Head}/(${string})${infer Tail}`
  ? StripGroups<`${Head}${Tail}`>
  : S;
type WithoutGroups<S extends string> = StripGroups<S> extends '' ? '/' : StripGroups<S>;

/** `[id]`, `[...rest]` and `[[...rest]]` become a value. */
type Fill<S extends string> = S extends `${infer Head}[[...${string}]]${infer Tail}`
  ? `${Head}${string}${Fill<Tail>}`
  : S extends `${infer Head}[...${string}]${infer Tail}`
    ? `${Head}${string}${Fill<Tail>}`
    : S extends `${infer Head}[${string}]${infer Tail}`
      ? `${Head}${string}${Fill<Tail>}`
      : S;

/** A path to a screen that exists. */
export type AppPath<P extends RoutePlatform = 'mobile'> = Fill<RoutePattern<P>>;

/** An href to a screen that exists, with an optional query or fragment. */
export type AppHref<P extends RoutePlatform = 'mobile'> =
  | AppPath<P>
  | `${AppPath<P>}?${string}`
  | `${AppPath<P>}#${string}`;
