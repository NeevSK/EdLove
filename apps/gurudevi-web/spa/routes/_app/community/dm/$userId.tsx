import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/community/dm/$userId')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/community',
      search: { pillar: 'messages', dm: params.userId },
      replace: true,
    });
  },
});
