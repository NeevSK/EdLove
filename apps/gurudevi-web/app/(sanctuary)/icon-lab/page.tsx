import type { Metadata } from 'next';
import { SanctuaryShell } from '../components/SanctuaryShell';
import { IconLabClient } from './IconLabClient';

export const metadata: Metadata = {
  title: 'Icon & Token Lab | Gurudevi Sanctuary',
  description: 'Inspect brand design tokens, iconography, and APCA contrast calibration',
};

export default function IconLabPage() {
  return (
    <SanctuaryShell displayName="Staff / Lab" navigationPrefix="">
      <IconLabClient />
    </SanctuaryShell>
  );
}
