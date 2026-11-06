import { redirect } from 'next/navigation';

export default async function WorkspaceAtlasRedirect({
  searchParams,
}: {
  searchParams?: Promise<{ role?: string }>;
}) {
  const params = await searchParams;
  const role = params?.role ? `?role=${encodeURIComponent(params.role)}` : '';
  redirect(`/atlas${role}`);
}

