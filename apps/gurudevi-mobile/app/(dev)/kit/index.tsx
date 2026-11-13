import { GoTo } from '@repo/ui/components/native/navigation';
import { KitGalleryNative } from './KitGalleryNative';

/**
 * Native development route: in production release builds this redirects away.
 * Never ships to production users.
 */
export default function KitGalleryRoute() {
  if (!__DEV__) {
    return <GoTo href="/" />;
  }

  return <KitGalleryNative />;
}
