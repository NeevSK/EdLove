import Link from 'next/link';
import type { ReactNode } from 'react';

export function AuthFrame({
  children,
  title,
  description,
}: Readonly<{ children: ReactNode; title: string; description: string }>) {
  return (
    <main className="min-h-screen bg-ink px-4 py-12 text-paper sm:px-8 sm:py-20" id="main-content">
      <div className="mx-auto w-full max-w-lg">
        <Link
          className="font-serif text-xl font-bold tracking-[-0.04em] text-paper no-underline focus:outline-3 focus:outline-offset-4 focus:outline-water"
          href="/"
        >
          Gurudevi
        </Link>
        <section
          className="mt-16 border border-paper/20 bg-paper-light p-6 text-ink sm:p-10"
          aria-labelledby="auth-title"
        >
          <p className="font-sans text-sm font-semibold text-lotus">Sanctuary access</p>
          <h1
            className="mt-4 font-serif text-4xl font-medium leading-tight tracking-[-0.04em]"
            id="auth-title"
          >
            {title}
          </h1>
          <p className="mt-4 max-w-md text-lg leading-8 text-ink-soft">{description}</p>
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
