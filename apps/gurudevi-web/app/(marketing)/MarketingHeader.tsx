import Link from 'next/link';

const navigation = [
  { href: '/about', label: 'The ecology' },
  { href: '/sanctuary', label: 'Sanctuary' },
];

export function MarketingHeader() {
  return (
    <header className="border-b border-line">
      <a
        className="sr-only absolute left-4 top-4 z-10 rounded bg-ink px-4 py-3 font-sans text-sm font-bold text-paper focus:not-sr-only focus:outline-3 focus:outline-offset-4 focus:outline-water"
        href="#main-content"
      >
        Skip to content
      </a>
      <div className="mx-auto flex min-h-18 w-full max-w-6xl flex-wrap items-center justify-between gap-x-5 gap-y-2 px-4 py-3">
        <Link className="font-serif text-xl font-bold tracking-[-0.04em] no-underline" href="/">
          Gurudevi
        </Link>
        <nav aria-label="Primary navigation" className="flex items-center gap-1 font-sans text-sm font-semibold">
          {navigation.map((item) => (
            <Link className="rounded-full px-3 py-2 no-underline hover:bg-paper-light focus:outline-3 focus:outline-offset-2 focus:outline-water" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <Link className="ml-1 rounded-full border border-ink px-3 py-2 no-underline hover:bg-ink hover:text-paper focus:outline-3 focus:outline-offset-2 focus:outline-water" href="/sanctuary">
            Enter sanctuary
          </Link>
        </nav>
      </div>
    </header>
  );
}
