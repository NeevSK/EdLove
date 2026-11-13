import { builders } from '../../../lib/sanctuary/capacityAccess';
import { forAudience } from '../../surface/audience';
import { createFileRoute } from '@tanstack/react-router';
import { IconLabClient } from '../../../app/(sanctuary)/icon-lab/IconLabClient';

export const Route = createFileRoute('/_app/icon-lab')({
  ...forAudience(builders, 'This lab is for the people who build Gurudevi.'),
  component: IconLabScreen,
});

function IconLabScreen() {
  return <IconLabClient />;
}
