import type { Metadata } from 'next';
import { schoolHexagonalService } from '@/lib/domain/adapters/school/schoolHexagonalService';
import { SchoolPublicFloor } from './SchoolPublicFloor';

interface SchoolPublicPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SchoolPublicPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const rawId = resolvedParams.id ?? '';
  const cleanId = rawId.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64);
  const profile = await schoolHexagonalService.getSchoolProfile(cleanId);

  return {
    title: `${profile.fact.name} | Official Institutional Website`,
    description: `Official digital sanctuary for ${profile.fact.name} (${profile.census.provinceName} Province, Sri Lanka). Census No: ${profile.census.censusNo}.`,
    openGraph: {
      title: `${profile.fact.name} — Gurudevi Sanctuary`,
      description: profile.fact.motto ?? `Official digital profile for ${profile.fact.name}`,
    },
  };
}

export default async function SchoolPublicPage({ params }: SchoolPublicPageProps) {
  const resolvedParams = await params;
  const rawId = resolvedParams.id ?? '';
  // OWASP sanitization: alphanumeric + hyphens/underscores up to 64 chars
  const cleanId = rawId.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64);

  return <SchoolPublicFloor schoolId={cleanId} />;
}
