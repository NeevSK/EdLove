import { BrandPulse } from '@repo/ui';
import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Center } from '@repo/ui/primitives';

export { RouteErrorBoundary as ErrorBoundary };

/**
 * Native auth callback fallback route.
 * Native deep links are handled via DeepLinkProvider and deepLink listeners,
 * but Expo Router requires a base route file `callback.tsx` when `callback.web.tsx` exists.
 */
export default function AuthCallbackRoute() {
  return (
    <Center className="flex-1 bg-obsidian">
      <BrandPulse accessibilityLabel="Completing sign-in" />
    </Center>
  );
}
