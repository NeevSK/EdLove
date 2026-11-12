import { createRootRoute, Outlet } from '@tanstack/react-router';
import { LocaleProvider } from '../../lib/i18n/LocaleContext';
import { QueryProvider } from '../../lib/query/QueryProvider';
import { GurudeviWebVerger } from '../../lib/runtime/GurudeviWebVerger';
import { SkipLink } from '../../app/(sanctuary)/components/SkipLink';

// The Explore tree from app/(sanctuary)/layout.tsx: no AuthProvider, so no Supabase client.
export const Route = createRootRoute({
  component: () => (
    <LocaleProvider>
      <GurudeviWebVerger>
        <QueryProvider>
          <SkipLink />
          <Outlet />
        </QueryProvider>
      </GurudeviWebVerger>
    </LocaleProvider>
  ),
});
