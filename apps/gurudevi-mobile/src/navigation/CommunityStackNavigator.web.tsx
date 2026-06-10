import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { CommunityStackParamList } from '@repo/core/types';
import { useTheme } from '@repo/ui/primitives';

import React from 'react';
import { StackFallback } from '../components/web/WebScreenShimmer';

// Web-specific screens — lazy loaded for code splitting
// Web-specific screens — lazy loaded for code splitting
const CommunityScreenWeb = React.lazy(() => import('@repo/community/screens/CommunityScreen.web'));

// Community sub-screens — use direct package subpaths
const UserPublicProfileScreen = React.lazy(
  () => import('@repo/community/screens/UserPublicProfileScreen.web'),
);
const GroupDetailsScreen = React.lazy(
  () => import('@repo/community/screens/GroupDetailsScreen.web'),
);
const GroupChatScreen = React.lazy(() => import('@repo/community/screens/GroupChatScreen.web'));
const DirectMessagesListScreen = React.lazy(
  () => import('@repo/community/screens/DirectMessagesListScreen'),
);
const DirectMessageScreen = React.lazy(
  () => import('@repo/community/screens/DirectMessageScreen.web'),
);
// Announcements — in-app announcements screen
const AnnouncementsScreen = React.lazy(() => import('../screens/community/AnnouncementsScreen'));

const Stack = createNativeStackNavigator<CommunityStackParamList>();

function ScreenFallback() {
  return <StackFallback variant="cards" />;
}

export default function CommunityStackNavigatorWeb() {
  const { gradientNodes } = useTheme();

  return (
    <React.Suspense fallback={<ScreenFallback />}>
      <Stack.Navigator
        id="CommunityStack"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: gradientNodes[0] },
        }}
      >
        <Stack.Screen name="CommunityMain" component={CommunityScreenWeb} />
        <Stack.Screen name="UserProfile" component={UserPublicProfileScreen} />
        <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
        <Stack.Screen name="GroupChat" component={GroupChatScreen} />
        <Stack.Screen name="DirectMessagesList" component={DirectMessagesListScreen} />
        <Stack.Screen name="DirectMessage" component={DirectMessageScreen} />
        <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
      </Stack.Navigator>
    </React.Suspense>
  );
}
