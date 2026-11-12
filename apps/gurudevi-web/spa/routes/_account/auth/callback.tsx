import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';

/** Older confirmation emails link here; the session is completed at /auth/complete. */
export const Route = createFileRoute('/_account/auth/callback')({
  validateSearch: z.object({
    code: z.string().optional(),
    error: z.string().optional(),
    next: z.string().optional(),
    returnTo: z.string().optional(),
  }),
  beforeLoad: ({ search }) => {
    throw redirect({ to: '/auth/complete', search, replace: true });
  },
});
