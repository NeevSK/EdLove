'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '../../../lib/supabase/browser';
import { loadWorkspaceScopes, selectWorkspaceScope } from '../../../lib/sanctuary/workspaceScopes';
import styles from './workspace-scope-switcher.module.css';

type Snapshot = NonNullable<Awaited<ReturnType<typeof loadWorkspaceScopes>>>;

function bondLabel(bond: Snapshot['identity']['availableBonds'][number]): string {
  const entity = bond.entity_type === 'PERSONAL_CLASSROOM' || bond.entity_type === 'PERSONAL'
    ? 'Personal Sanctuary'
    : `${bond.entity_type.toLowerCase().replaceAll('_', ' ')} · ${bond.entity_id.slice(0, 8)}`;
  return `${entity} — ${bond.capacity}`;
}

export function WorkspaceScopeSwitcher() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState('');
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    let active = true;
    const client = createBrowserSupabaseClient();
    if (client) {
      void loadWorkspaceScopes(client).then((result) => {
        if (active) setSnapshot(result);
      }).catch(() => {
        if (active) setError('Workspaces could not be loaded. Reload to try again.');
      });
    }
    return () => { active = false; };
  }, []);

  async function changeScope(bondId: string) {
    if (!snapshot || bondId === snapshot.identity.activeBond?.id || switching) return;
    const client = createBrowserSupabaseClient();
    if (!client) { setError('Workspace switching is unavailable.'); return; }
    setError('');
    setSwitching(true);
    try {
      await selectWorkspaceScope(client, snapshot.session, snapshot.identity.id, bondId);
      window.location.reload();
    } catch {
      setError('The workspace switch could not be confirmed. Reload to check your selection.');
      setSwitching(false);
    }
  }

  if (!snapshot) return error ? <span className={styles.error} role="status">{error}</span> : null;
  return (
    <div className={styles.switcher}>
      <label className={styles.label} htmlFor="active-workspace">Workspace</label>
      <select id="active-workspace" value={snapshot.identity.activeBond?.id ?? ''}
        disabled={switching} onChange={(event) => void changeScope(event.currentTarget.value)}>
        {snapshot.identity.availableBonds.map((bond) => (
          <option key={bond.id} value={bond.id}>{bondLabel(bond)}</option>
        ))}
      </select>
      {error ? <span className={styles.error} role="alert">{error}</span> : null}
    </div>
  );
}
