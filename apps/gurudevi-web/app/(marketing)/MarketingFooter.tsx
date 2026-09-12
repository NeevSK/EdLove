import Link from 'next/link';

export function MarketingFooter() {
  return (
    <footer className="border-t border-line font-sans text-sm text-ink-soft">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <p className="mb-2 font-serif text-xl font-bold tracking-[-0.04em] text-ink">Gurudevi</p>
          <p className="m-0 max-w-sm leading-6">Technology that gives energy back to education.</p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-4 gap-y-3">
          <Link className="underline decoration-line underline-offset-4 hover:decoration-ink focus:outline-3 focus:outline-offset-2 focus:outline-water" href="/about">About</Link>
          <Link className="underline decoration-line underline-offset-4 hover:decoration-ink focus:outline-3 focus:outline-offset-2 focus:outline-water" href="/privacy">Privacy</Link>
          <Link className="underline decoration-line underline-offset-4 hover:decoration-ink focus:outline-3 focus:outline-offset-2 focus:outline-water" href="/terms">Terms</Link>
          <Link className="underline decoration-line underline-offset-4 hover:decoration-ink focus:outline-3 focus:outline-offset-2 focus:outline-water" href="/delete-account">Delete account</Link>
        </nav>
      </div>
    </footer>
  );
}
