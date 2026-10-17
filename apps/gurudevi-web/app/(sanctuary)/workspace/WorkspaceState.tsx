import type { ReactNode } from 'react';
import { SanctuaryShell } from '../components/SanctuaryShell';

export interface WorkspaceStateProps {
  action?: ReactNode;
  detail?: string | null;
  displayName?: string | null;
  title: string;
}

export function WorkspaceState({
  action,
  detail,
  displayName,
  title,
}: Readonly<WorkspaceStateProps>) {
  return (
    <SanctuaryShell displayName={displayName || 'Explorer'} navigationPrefix="">
      <main id="main-content" className="sanctuary-container">
        <section
          aria-live="polite"
          style={{
            maxWidth: '640px',
            margin: '4rem auto',
            padding: '0 1.5rem',
            textAlign: 'center',
          }}
        >
          <h1
            style={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', marginBottom: '0.75rem' }}
          >
            {title}
          </h1>
          {detail ? <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{detail}</p> : null}
          {action}
        </section>
      </main>
    </SanctuaryShell>
  );
}
