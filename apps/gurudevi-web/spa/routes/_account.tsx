import { createFileRoute, Outlet } from '@tanstack/react-router';

/**
 * Signing in, recovering an account and finishing an email link: only on a surface with accounts.
 * Explore's build leaves these routes out, and the root route forwards their addresses.
 */
export const Route = createFileRoute('/_account')({
  component: Outlet,
});
