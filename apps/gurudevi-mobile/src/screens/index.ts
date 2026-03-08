import { Platform } from 'react-native';
import { LibraryScreen as NativeLibraryScreen } from '@repo/library';
import { CommunityScreen as NativeCommunityScreen } from '@repo/community';
import { ClassroomScreen as NativeClassroomScreen } from '@repo/classroom';
import { SelfScreen as NativeSelfScreen } from '@repo/self';

export { default as AuthScreen } from './AuthScreen';

// --- Web Consensus Layer ---
// Domain screens with web-aligned sanctuary shells reside in the app screens directory.
// This allows for a unified desktop experience that transcends the mobile domain logic.

import WebLibraryScreen from './LibraryScreen.web';
import WebCommunityScreen from './CommunityScreen.web';
import WebSelfScreen from './SelfScreen.web';
import WebProfileScreen from './ProfileScreen.web';
import WebClassroomScreen from './ClassroomScreen.web';
import WebAppSettingsScreen from './AppSettingsScreen.web';
import WebNotificationsScreen from './NotificationsScreen.web';

// Conditional Exports
export const LibraryScreen = Platform.OS === 'web' ? WebLibraryScreen : NativeLibraryScreen;
export const CommunityScreen = Platform.OS === 'web' ? WebCommunityScreen : NativeCommunityScreen;
export const ClassroomScreen = Platform.OS === 'web' ? WebClassroomScreen : NativeClassroomScreen;

// Self and Profile require conditional import to avoid circular dependencies or web-only code in native
export const SelfScreen = Platform.OS === 'web' ? WebSelfScreen : NativeSelfScreen;
export const ProfileScreen = Platform.OS === 'web' ? WebProfileScreen : (require('./ProfileScreen').default);

export { default as SchoolCreationScreen } from './SchoolCreationScreen';
export { default as AIAssistantScreen } from './AIAssistantScreen';
export { default as WelcomeScreen } from './WelcomeScreen.web';
export const AppSettingsScreen = WebAppSettingsScreen;
export const NotificationsScreen = WebNotificationsScreen;
