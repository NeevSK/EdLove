import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getLocalizedSection,
  LocalizedMarketingPage,
  localizedSectionMetadata,
} from '../../../lib/localized-marketing-page';

type Props = { params: Promise<{ section: string }> };

export function generateStaticParams() {
  return ['about', 'faq', 'support', 'thuthimal', 'journal'].map((section) => ({ section }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const section = getLocalizedSection((await params).section);
  if (!section) return {};
  return localizedSectionMetadata('si', section);
}

export default async function SinhalaPublicSection({ params }: Props) {
  const section = getLocalizedSection((await params).section);
  if (!section) notFound();
  return <LocalizedMarketingPage locale="si" section={section} />;
}
