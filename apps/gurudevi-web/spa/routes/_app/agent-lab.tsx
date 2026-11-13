import { builders } from '../../../lib/sanctuary/capacityAccess';
import { forAudience } from '../../surface/audience';
import { createFileRoute } from '@tanstack/react-router';
import { AgentLabClient } from '../../../app/(sanctuary)/agent-lab/AgentLabClient';

export const Route = createFileRoute('/_app/agent-lab')({
  ...forAudience(builders, 'This lab is for the people who build Gurudevi.'),
  component: AgentLabScreen,
});

function AgentLabScreen() {
  return <AgentLabClient />;
}
