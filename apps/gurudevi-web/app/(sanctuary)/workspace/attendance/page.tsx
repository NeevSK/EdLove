import { redirect } from 'next/navigation';

export default async function WorkspaceAttendancePage({
  searchParams,
}: {
  searchParams?: Promise<{ classroom?: string; date?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  qs.set('task', 'attendance');
  if (params?.classroom) qs.set('classroom', params.classroom);
  if (params?.date) qs.set('date', params.date);

  redirect(`/workspace?${qs.toString()}`);
}

