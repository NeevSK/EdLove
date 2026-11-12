import { createFileRoute, notFound, Outlet } from '@tanstack/react-router';

/** Developer tools (kit, architecture explorer): local development builds only. */
export const Route = createFileRoute('/_dev')({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  component: Outlet,
});
