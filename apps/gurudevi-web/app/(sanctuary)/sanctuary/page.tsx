import Link from 'next/link';

export const metadata = { title: 'Sanctuary' };

export default function SanctuaryPage() {
  return (
    <main className="sanctuary-shell">
      <div className="sanctuary-card">
        <p className="kicker">Sanctuary</p>
        <h1>The web sanctuary is taking root.</h1>
        <p>
          This is the protected product boundary for Gurudevi. Authentication and the first
          real sanctuary journey will be migrated here deliberately, not simulated.
        </p>
        <Link className="primary-action" href="/">Return to Gurudevi</Link>
      </div>
    </main>
  );
}
