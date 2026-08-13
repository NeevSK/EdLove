import NativeCollectionDetailScreen from '@repo/library/screens/CollectionDetailScreen';
import WebCollectionDetailScreen from '@repo/library/screens/CollectionDetailScreen.web';
import { Platform } from 'react-native';

// Keep the route explicit: Expo Router can load this file in both Metro and
// the web bundler, so each platform gets its intended detail implementation.
export default function CollectionDetailRoute() {
  return Platform.OS === 'web' ? <WebCollectionDetailScreen /> : <NativeCollectionDetailScreen />;
}
