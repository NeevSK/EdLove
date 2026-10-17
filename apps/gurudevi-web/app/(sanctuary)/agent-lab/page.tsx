import type { Metadata } from 'next';
import { SanctuaryShell } from '../components/SanctuaryShell';
import { AgentLabClient } from './AgentLabClient';

export const metadata: Metadata = {
  title: 'Agent Lab | Gurudevi Sanctuary',
  description: 'Durable Agent execution runner and scenario visualizer',
};

export default function AgentLabPage() {
  return (
    <SanctuaryShell displayName="Staff / Lab" navigationPrefix="">
      <AgentLabClient />
    </SanctuaryShell>
  );
}
