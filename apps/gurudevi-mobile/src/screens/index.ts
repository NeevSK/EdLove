import { Platform } from 'react-native';
import { LibraryScreen as NativeLibraryScreen } from '@repo/library';
import { CommunityScreen as NativeCommunityScreen } from '@repo/community';
import { ClassroomScreen as NativeClassroomScreen } from '@repo/classroom';
import { SelfScreen as NativeSelfScreen } from '@repo/self';

export { default as AuthScreen } from './AuthScreen';

// --- Web Consensus Layer ---
// Domain screens with web-aligned sanctuary shells reside in the app screens directory.
// This allows for a unified desktop experience that transcends the mobile domain logic.

export { default as LibraryScreen } from './LibraryScreen';
export { default as CommunityScreen } from './CommunityScreen';
export { default as ClassroomScreen } from './ClassroomScreen';
export { default as SelfScreen } from './SelfScreen';
export { default as ProfileScreen } from './ProfileScreen';
export { default as AppSettingsScreen } from './AppSettingsScreen';
export { default as NotificationsScreen } from './NotificationsScreen';

export { default as SchoolCreationScreen } from './SchoolCreationScreen';
export { default as AIAssistantScreen } from './AIAssistantScreen';
export { default as WelcomeScreen } from './WelcomeScreen';
