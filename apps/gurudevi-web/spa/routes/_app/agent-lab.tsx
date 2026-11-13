import { createFileRoute } from '@tanstack/react-router';
import { AgentLabClient } from '../../../app/(sanctuary)/agent-lab/AgentLabClient';

export const Route = createFileRoute('/_app/agent-lab')({
  head: () => ({ meta: [{ title: 'Agent Lab | Gurudevi Sanctuary' }] }),
  component: AgentLabScreen,
});

function AgentLabScreen() {
  return <AgentLabClient />;
}
