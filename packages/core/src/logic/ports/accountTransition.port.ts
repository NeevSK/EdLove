export type AccountTransitionDisposition = 'preserve-and-quarantine' | 'discard';

export type AccountTransitionRequest = Readonly<{
  outgoingPrincipalId: string | null;
  incomingPrincipalId: string | null;
  disposition: AccountTransitionDisposition;
  clearReplicatedData: boolean;
}>;

export type AccountTransitionOutcome = Readonly<{
  disposition: AccountTransitionDisposition;
  outgoingPrincipalId: string | null;
  incomingPrincipalId: string | null;
  quarantinedCommandCount: number;
  discardedCommandCount: number;
  untouchedUnboundCommandCount: number;
  replicatedDataCleared: boolean;
}>;

/**
 * The sole lifecycle boundary permitted to affect account-owned local work.
 * A command without an original principal is intentionally never rebound.
 */
export interface AccountTransitionPort {
  transition(request: AccountTransitionRequest): Promise<AccountTransitionOutcome>;
}
