import { createFileRoute } from '@tanstack/react-router';
import { AgentLabClient } from '../../../app/(sanctuary)/agent-lab/AgentLabClient';

export const Route = createFileRoute('/_app/agent-lab')({
  head: () => ({ meta: [{ title: 'Agent Lab | Gurudevi App' }] }),
  component: AgentLabScreen,
});

function AgentLabScreen() {
  return <AgentLabClient />;
}
