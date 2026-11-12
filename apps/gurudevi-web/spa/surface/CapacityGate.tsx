import type { ReactNode } from 'react';
import type { CapacityRule } from '../../lib/sanctuary/capacityAccess';
import { useSession } from './session';

/**
 * Opens a floor only to the capacities its rule allows. Explore lets a visitor see every floor as the
 * persona they chose, so the rule is checked for signed-in accounts only.
 */
export function CapacityGate({
  allows,
  detail,
  children,
}: Readonly<{ allows: CapacityRule; detail: string; children: ReactNode }>) {
  const session = useSession();
  if (session.surface === 'explore' || allows(session)) return children;
  return <Notice title="Access restricted" detail={detail} />;
}

/** A plain message in place of a floor. */
export function Notice({
  title,
  detail,
  action,
}: Readonly<{ title: string; detail: string; action?: ReactNode }>) {
  return (
    <main id="main-content" className="mx-auto max-w-[40rem] px-8 py-16 text-center">
      <h1 className="font-display text-2xl text-ink">{title}</h1>
      <p className="mt-2 leading-normal text-ink-soft">{detail}</p>
      {action ? <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </main>
  );
}
