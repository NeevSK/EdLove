import type { ReactNode } from 'react';
import { classifyGurudeviHost } from '../../lib/host-routing';
import * as account from './account';
import * as explore from './explore';
import type { AccountHome, Commands, Sources } from './sources';

function isGuestShowroom(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.host;
  const target = classifyGurudeviHost(host);
  if (target === 'explore') return true;
  const params = new URLSearchParams(window.location.search);
  const qMode = params.get('mode');
  const qSurface = params.get('surface');
  return qMode === 'explore' || qSurface === 'explore';
}

/**
 * In local development, dynamically dispatch between Explore and Sanctuary
 * so that both explore.localhost:3000 and sanctuary.localhost:3000 run seamlessly
 * on the unified Vite dev server.
 */
export function Surface({ children }: { readonly children: ReactNode }) {
  if (isGuestShowroom()) {
    return <explore.Surface>{children}</explore.Surface>;
  }
  return <account.Surface>{children}</account.Surface>;
}

export const sources: Sources = {
  announcements: () => (isGuestShowroom() ? explore.sources.announcements() : account.sources.announcements()),
  notifications: () => (isGuestShowroom() ? explore.sources.notifications() : account.sources.notifications()),
  communityGroups: () => (isGuestShowroom() ? explore.sources.communityGroups() : account.sources.communityGroups()),
  accountDeletion: () => (isGuestShowroom() ? explore.sources.accountDeletion() : account.sources.accountDeletion()),
};

export const commands: Commands = {
  requestAccountDeletion: () =>
    isGuestShowroom()
      ? explore.commands.requestAccountDeletion()
      : account.commands.requestAccountDeletion(),
  cancelAccountDeletion: () =>
    isGuestShowroom()
      ? explore.commands.cancelAccountDeletion()
      : account.commands.cancelAccountDeletion(),
};

export const accountHome: AccountHome = {
  get kind() {
    return isGuestShowroom() ? explore.accountHome.kind : account.accountHome.kind;
  },
  get origin() {
    return isGuestShowroom()
      ? (explore.accountHome as { kind: 'elsewhere'; origin: string }).origin
      : undefined;
  },
} as AccountHome;
