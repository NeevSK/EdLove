import { ProfileScreen, ProfileScreenWeb } from '@repo/profile/own';
import { Platform } from 'react-native';

export default Platform.OS === 'web' ? ProfileScreenWeb : ProfileScreen;
