import { createFileRoute } from '@tanstack/react-router';
import { KitGalleryClient } from '../../../../app/(sanctuary)/kit/KitGalleryClient';

export const Route = createFileRoute('/_dev/kit/')({
  head: () => ({ meta: [{ title: 'UI Kit Gallery | Gurudevi Dev' }] }),
  component: KitScreen,
});

function KitScreen() {
  return <KitGalleryClient />;
}
