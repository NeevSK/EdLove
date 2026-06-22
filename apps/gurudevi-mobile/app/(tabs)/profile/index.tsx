import { ProfileScreen, ProfileScreenWeb } from '@repo/profile';
import { Platform } from 'react-native';

export default Platform.OS === 'web' ? ProfileScreenWeb : ProfileScreen;
