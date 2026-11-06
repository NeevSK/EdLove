import { Redirect } from 'expo-router';
import { KitGalleryNative } from './KitGalleryNative';

/**
 * Native development route: in production release builds this redirects away.
 * Never ships to production users.
 */
export default function KitGalleryRoute() {
  if (!__DEV__) {
    return <Redirect href="/" />;
  }

  return <KitGalleryNative />;
}
