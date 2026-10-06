'use client';

import { useBrowserWorkspaceAppearance } from '../../../lib/canvas/useBrowserWorkspaceAppearance';
import { AccountDeletionControl } from './AccountDeletionControl';
import styles from './profile.module.css';

export function ProfileFloor({
  accountId,
  displayName,
  primaryScopeRole,
}: Readonly<{ accountId: string; displayName: string; primaryScopeRole: string }>) {
  const floorAppearance = useBrowserWorkspaceAppearance({
    accountId,
    defaultGroupOrder: ['identity', 'settings'],
    workspaceId: 'profile',
  });

  return (
    <article
      aria-labelledby="profile-title"
      className={styles.profile}
      data-appearance={floorAppearance.appearance.preset}
      data-domain="profile"
      data-motion={floorAppearance.appearance.motion}
    >
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Profile</p>
        <h1 id="profile-title">Your identity</h1>
        <p>
          {displayName}, this is the verified identity currently available to Sanctuary. Profile
          editing and additional details will appear here once their browser contracts are ready.
        </p>
      </header>
      <section className={styles.identity} aria-label="Verified profile identity">
        <dl>
          <div>
            <dt>Display name</dt>
            <dd>{displayName}</dd>
          </div>
          <div>
            <dt>Selected sanctuary role</dt>
            <dd>{primaryScopeRole}</dd>
          </div>
        </dl>
      </section>
      <p className={styles.readOnly} role="note">
        Read-only profile identity
      </p>
      <AccountDeletionControl />
    </article>
  );
}
