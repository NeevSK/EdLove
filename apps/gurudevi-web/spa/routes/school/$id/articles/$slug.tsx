import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';
import {
  articleAddress,
  SchoolArticleReader,
} from '../../../../../app/(sanctuary)/school/[id]/articles/[slug]/SchoolArticleReader';
import { editorialAdapter, schoolAdapter } from '../../../../../lib/domain';

function schoolArticle(schoolId: string) {
  return {
    queryKey: ['school', schoolId, 'articles'],
    queryFn: async () => {
      const [profile, drafts] = await Promise.all([
        schoolAdapter.getSchoolProfile(schoolId).catch(() => null),
        editorialAdapter.listDrafts(schoolId).catch(() => []),
      ]);
      return { profile, drafts };
    },
  };
}

export const Route = createFileRoute('/school/$id/articles/$slug')({
  loader: async ({ context, params }) => {
    const { schoolId } = articleAddress(params.id, params.slug);
    const { profile } = await context.queryClient.ensureQueryData(schoolArticle(schoolId));
    if (!profile) throw notFound();
  },
  component: SchoolArticleScreen,
});

function SchoolArticleScreen() {
  const params = Route.useParams();
  const { schoolId, slug } = articleAddress(params.id, params.slug);
  const { data } = useSuspenseQuery(schoolArticle(schoolId));
  if (!data.profile) throw notFound();
  return (
    <SchoolArticleReader
      schoolId={schoolId}
      slug={slug}
      profile={data.profile}
      drafts={data.drafts}
    />
  );
}
