import type { ReactNode } from 'react';
import { SUPPORT_EMAIL } from '../../seo';

export const LEGAL_SUPPORT_EMAIL = SUPPORT_EMAIL;

export default function LegalLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
