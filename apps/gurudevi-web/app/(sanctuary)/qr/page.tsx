import { GURUDEVI_QR_URL } from '@repo/core/config/publicUrls';
import { classifyRouteIntent } from '@repo/core/logic/deeplink/deepLinkPolicyPipeline';
import Link from 'next/link';

export const metadata = { title: 'QR link' };

type SearchParams = Record<string, string | string[] | undefined>;

function canonicalQRUrl(searchParams: SearchParams): URL {
  const url = new URL(GURUDEVI_QR_URL);
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string') url.searchParams.set(key, value);
  }
  return url;
}

export default async function QRPage({
  searchParams,
}: Readonly<{ searchParams: Promise<SearchParams> }>) {
  const receivedParams = await searchParams;
  const url = canonicalQRUrl(receivedParams);
  const intent = classifyRouteIntent(url.toString());
  const isValidQR = intent.kind === 'qr';
  const appHref = `gurudevi://qr${url.search}`;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-12">
      <p className="font-sans text-sm font-semibold uppercase tracking-[0.16em] text-water">
        Gurudevi QR
      </p>
      <h1 className="mt-4 text-4xl font-semibold text-ink">
        {isValidQR ? 'Your link is ready' : 'This QR link cannot be used'}
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-ink/75">
        {isValidQR
          ? 'Open Gurudevi to continue. Nothing has been joined, claimed, or changed yet.'
          : 'It may be incomplete, expired, or from an unrecognised source. Ask the sender for a new QR link.'}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        {isValidQR ? (
          <a
            className="rounded-full bg-ink px-5 py-3 font-sans font-semibold text-paper no-underline"
            href={appHref}
          >
            Open Gurudevi
          </a>
        ) : null}
        <Link
          className="rounded-full border border-line px-5 py-3 font-sans font-semibold text-ink no-underline"
          href="/sign-in"
        >
          Go to Gurudevi on web
        </Link>
      </div>
    </main>
  );
}
