import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/library/review')({
  beforeLoad: () => {
    throw redirect({ to: '/library/curator', replace: true });
  },
});
