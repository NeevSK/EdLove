import { createFileRoute } from '@tanstack/react-router';
import { IconLabClient } from '../../../app/(sanctuary)/icon-lab/IconLabClient';

export const Route = createFileRoute('/_app/icon-lab')({
  component: IconLabScreen,
});

function IconLabScreen() {
  return <IconLabClient />;
}
