import { Button } from '@repo/ui/components/web';
import { notFound, useMatches } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import type { Audience, CapacityRule } from '../../lib/sanctuary/capacityAccess';
import { type Roles, useSession } from './session';

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    /** Who the place is for. A route without one is for everyone who can enter the app. */
    audience?: Audience;
  }
}

/** The audience of the deepest route that names one. */
function audienceOf(
  matches: readonly Readonly<{ staticData: { audience?: Audience } }>[],
): Audience | undefined {
  return matches.reduce<Audience | undefined>(
    (found, match) => match.staticData.audience ?? found,
    undefined,
  );
}

/**
 * Route options for a place only some people may open: `createFileRoute(…)({ ...forAudience(staff,
 * '…'), component })`. A place none of the roles on offer could open (Explore's personas) is not
 * part of the app there, so it is not found; that is decided before the page loads.
 */
export function forAudience(allows: CapacityRule, restricted: string) {
  const audience: Audience = { allows, restricted };
  return {
    staticData: { audience },
    beforeLoad: ({ context }: Readonly<{ context: Readonly<{ roles: Roles | undefined }> }>) => {
      const roles = context.roles;
      if (roles && !roles.choices.some((choice) => allows({ capacity: choice.capacity })))
        throw notFound();
    },
  };
}

/**
 * Opens the current place to the people its route names. Someone else is told so, and offered a
 * role that can open it when they can switch to one.
 */
export function AudienceGate({ children }: Readonly<{ children: ReactNode }>) {
  const audience = useMatches({ select: audienceOf });
  const session = useSession();
  if (!audience || audience.allows(session)) return children;

  const roles = session.roles;
  const alternative = roles?.choices.find((choice) =>
    audience.allows({ capacity: choice.capacity }),
  );
  if (roles && !alternative) throw notFound();

  return (
    <Notice
      title="Access restricted"
      detail={audience.restricted}
      action={
        roles && alternative ? (
          <Button
            label={`View as ${alternative.label}`}
            onClick={() => roles.choose(alternative.capacity)}
          />
        ) : undefined
      }
    />
  );
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
