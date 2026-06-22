import { FullProfileScreen, FullProfileScreenWeb } from '@repo/profile';
import { Platform } from 'react-native';

export default Platform.OS === 'web' ? FullProfileScreenWeb : FullProfileScreen;
