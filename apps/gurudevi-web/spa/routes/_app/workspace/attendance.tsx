import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/_app/workspace/attendance')({
  validateSearch: z.object({ classroom: z.string().optional(), date: z.string().optional() }),
  beforeLoad: ({ search }) => {
    throw redirect({ to: '/workspace', search: { task: 'attendance', ...search }, replace: true });
  },
});
