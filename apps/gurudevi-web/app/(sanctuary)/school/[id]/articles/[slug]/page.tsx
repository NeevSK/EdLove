import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { editorialAdapter, schoolAdapter } from '@/lib/domain';
import { articleAddress, findArticle, SchoolArticleReader } from './SchoolArticleReader';

interface ArticlePageProps {
  params: Promise<{ id: string; slug: string }>;
}

async function read(params: ArticlePageProps['params']) {
  const resolved = await params;
  const { schoolId, slug } = articleAddress(resolved.id ?? '', resolved.slug ?? '');
  const [profile, drafts] = await Promise.all([
    schoolAdapter.getSchoolProfile(schoolId).catch(() => null),
    editorialAdapter.listDrafts(schoolId).catch(() => []),
  ]);
  return { schoolId, slug, profile, drafts };
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug, profile, drafts } = await read(params);
  const article = findArticle(drafts, slug);
  const schoolName = profile?.fact.name ?? 'School Commons';
  const title = article ? `${article.title} — ${schoolName}` : `Article | ${schoolName}`;
  const description =
    article?.summary ?? `Official student journalism and publication from ${schoolName}.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article?.publishedAt ?? article?.createdAt,
      authors: article ? [article.authorName] : [],
    },
  };
}

export default async function SchoolArticleReaderPage({ params }: ArticlePageProps) {
  const { schoolId, slug, profile, drafts } = await read(params);
  if (!profile) notFound();
  return <SchoolArticleReader schoolId={schoolId} slug={slug} profile={profile} drafts={drafts} />;
}
