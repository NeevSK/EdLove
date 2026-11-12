import { createFileRoute } from '@tanstack/react-router';
import { KitGalleryClient } from '../../../../app/(sanctuary)/kit/KitGalleryClient';

export const Route = createFileRoute('/_dev/kit/')({
  component: KitScreen,
});

function KitScreen() {
  return <KitGalleryClient />;
}
