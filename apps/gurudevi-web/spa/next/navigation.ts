import {
  type RegisteredRouter,
  notFound as routerNotFound,
  redirect as routerRedirect,
  useLocation,
  useParams as useRouterParams,
  useRouter as useTanstackRouter,
} from '@tanstack/react-router';
import { useMemo } from 'react';

/** `next/navigation` for the Vite build, on TanStack Router. Leaves with the last import of it. */

export function useRouter() {
  const router = useTanstackRouter();
  return useMemo(
    () => ({
      push: (href: string) => void router.navigate({ href }),
      replace: (href: string) => void router.navigate({ href, replace: true }),
      back: () => router.history.back(),
      forward: () => router.history.forward(),
      refresh: () => void router.invalidate(),
      prefetch: (_href: string) => undefined,
    }),
    [router],
  );
}

export function usePathname(): string {
  return useLocation({ select: (l) => l.pathname });
}

export function useSearchParams(): URLSearchParams {
  const searchStr = useLocation({ select: (l) => l.searchStr });
  return useMemo(() => new URLSearchParams(searchStr), [searchStr]);
}

export function useParams<T extends Record<string, string>>(): T {
  // Not tied to one route: the Next screens read params by name, so ask the router loosely.
  return useRouterParams<RegisteredRouter, undefined, false>({ strict: false }) as T;
}

export function redirect(href: string): never {
  throw routerRedirect({ href });
}

export function notFound(): never {
  throw routerNotFound();
}
