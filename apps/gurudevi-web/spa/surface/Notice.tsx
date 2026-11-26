import type { ReactNode } from 'react';

/** A plain message in place of a floor's content. */
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
