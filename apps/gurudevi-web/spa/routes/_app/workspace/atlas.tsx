import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { SCREEN_ROLE_IDS } from '../../../../app/(sanctuary)/atlas/atlasData';

export const Route = createFileRoute('/_app/workspace/atlas')({
  validateSearch: z.object({
    role: z
      .enum(['class_teacher', 'subject_teacher', 'principal', 'student', 'guardian'])
      .optional()
      .catch(undefined),
  }),
  beforeLoad: ({ search }) => {
    throw redirect({ to: '/atlas', search: { role: search.role }, replace: true });
  },
});
