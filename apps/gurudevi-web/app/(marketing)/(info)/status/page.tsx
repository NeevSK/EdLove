import type { Metadata } from 'next';
import { StatusClient } from './StatusClient';

export const metadata: Metadata = {
  title: 'System Status · Gurudevi Sanctuary',
  description: 'Live operational status, telemetry, and service health for Gurudevi Sanctuary API and infrastructure.',
};

export default function StatusPage() {
  return <StatusClient />;
}
