import { ProfileScreen, ProfileScreenWeb } from '@repo/profile/own';
import { Platform } from 'react-native';

export { RouteErrorBoundary as ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
export default Platform.OS === 'web' ? ProfileScreenWeb : ProfileScreen;
