import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/invitation-welcome')({
  head: () => ({ meta: [{ title: 'Classroom Invitation | Gurudevi Sanctuary' }] }),
  validateSearch: z.object({ code: z.string().optional(), inviteCode: z.string().optional() }),
  beforeLoad: ({ search }) => {
    const code = (search.code || search.inviteCode)?.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32);
    if (code) throw redirect({ to: '/c/$code', params: { code }, replace: true });
    throw redirect({ to: '/welcome', replace: true });
  },
});
