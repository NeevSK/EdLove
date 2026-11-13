import { createFileRoute, Outlet } from '@tanstack/react-router';
import { devOnly } from '../surface/devOnly';

/** Developer tools (kit, architecture explorer): local development builds only. */
export const Route = createFileRoute('/_dev')({
  beforeLoad: devOnly,
  component: Outlet,
});
