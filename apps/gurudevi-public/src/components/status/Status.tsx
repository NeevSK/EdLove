import { translator, type SupportedLocale } from '../../site';
import { StatusDashboard } from './StatusDashboard';

export function Status({ locale }: { readonly locale: SupportedLocale }) {
  const t = translator(locale);

  return (
    <main id="main-content">
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-8 lg:px-16 lg:py-24">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
          {t('status.eyebrow')}
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-medium leading-[1.05] tracking-[-0.05em] sm:text-6xl text-ink">
          {t('status.title')}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-soft leading-relaxed">
          {t('status.description')}
        </p>

        <div className="mt-12">
          <StatusDashboard locale={locale} />
        </div>
      </section>
    </main>
  );
}
