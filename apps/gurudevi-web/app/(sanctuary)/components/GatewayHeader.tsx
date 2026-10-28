'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useTranslation } from '../../../lib/i18n';

export function GatewayHeader({
  actions,
}: Readonly<{
  actions?: ReactNode;
}>) {
  const { t } = useTranslation();

  return (
    <header className="w-full max-w-5xl mx-auto px-6 py-4 flex items-center justify-between relative z-20">
      <Link
        className="flex items-center gap-2.5 group no-underline text-[var(--ink)]"
        href="/welcome"
        aria-label={`${t('brand.name')} welcome`}
      >
        <div className="w-8 h-8 rounded-full bg-[var(--paper-light)] border border-[var(--line)] flex items-center justify-center p-1.5 transition-transform duration-200 group-hover:scale-105 shadow-xs">
          <Image
            src="/gurudevi-mark.svg"
            alt=""
            width={20}
            height={20}
            priority
            className="w-5 h-5 object-contain"
          />
        </div>
        <span className="font-semibold text-base tracking-tight text-[var(--ink)] group-hover:text-[var(--color-sanctuary-saffron)] transition-colors duration-150">
          {t('brand.name')}
        </span>
      </Link>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </header>
  );
}
