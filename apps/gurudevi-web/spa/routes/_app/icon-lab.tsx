import { createFileRoute } from '@tanstack/react-router';
import { IconLabClient } from '../../../app/(sanctuary)/icon-lab/IconLabClient';

export const Route = createFileRoute('/_app/icon-lab')({
  head: () => ({ meta: [{ title: 'Icon & Token Lab | Gurudevi App' }] }),
  component: IconLabScreen,
});

function IconLabScreen() {
  return <IconLabClient />;
}
