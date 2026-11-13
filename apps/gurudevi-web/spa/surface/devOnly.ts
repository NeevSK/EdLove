import { notFound } from '@tanstack/react-router';

/** Developer tools (kit, architecture explorer) exist in local development builds only. */
export function devOnly(): void {
  if (!import.meta.env.DEV) throw notFound();
}
