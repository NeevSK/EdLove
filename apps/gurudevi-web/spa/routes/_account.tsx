import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

/**
 * Signing in, recovering an account and finishing an email link. Where accounts live elsewhere
 * (Explore), the same address opens there instead, so a shared link works from either host.
 */
export const Route = createFileRoute('/_account')({
  beforeLoad: ({ context, location }) => {
    if (context.accountHome.kind === 'elsewhere') {
      throw redirect({
        href: `${context.accountHome.origin}${location.href}`,
        reloadDocument: true,
      });
    }
  },
  component: Outlet,
});
