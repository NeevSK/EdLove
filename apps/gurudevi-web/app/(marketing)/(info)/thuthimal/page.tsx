import type { Metadata } from 'next';
import { ThuthimalClient } from './ThuthimalClient';

export const metadata: Metadata = {
  title: 'Thuthimal (තුතිමල්) | Reciprocal Care for Teachers',
  description:
    'A gift economy protocol enabling communities to sponsor sovereign tools for teachers.',
};

export default function ThuthimalPage() {
  return <ThuthimalClient />;
}
