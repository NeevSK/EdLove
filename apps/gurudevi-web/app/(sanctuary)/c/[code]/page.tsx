import type { Metadata } from 'next';
import { ClassroomInvitation } from './ClassroomInvitation';

export const metadata: Metadata = {
  title: 'Classroom Invitation | Gurudevi Sanctuary',
  description: 'Join a learning sanctuary classroom on Gurudevi',
};

export default async function ClassroomVanityPage({
  params,
}: Readonly<{ params: Promise<{ code: string }> }>) {
  const { code } = await params;
  return <ClassroomInvitation code={code} />;
}
