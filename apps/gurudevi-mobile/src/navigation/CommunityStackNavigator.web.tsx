import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@repo/ui';
import { StackFallback } from '../components/web/WebScreenShimmer';
import { CommunityStackParamList } from '@repo/core';

// Web-specific screens  lazy loaded for code splitting
const CommunityScreenWeb = React.lazy(() => import('@repo/community/screens/CommunityScreen.web'));

// Community sub-screens  use focused public screen entrypoints
const UserPublicProfileScreen = React.lazy(() =    import('@repo/community/screens/UserPublicProfileScreen.web')
);
const GroupDetailsScreen = React.lazy(() =    import('@repo/community/screens/GroupDetailsScreen.web')
);
const GroupChatScreen = React.lazy(() =    import('@repo/community/screens/GroupChatScreen.web')
);
const DirectMessagesListScreen = React.lazy(() =    import('@repo/community/screens/DirectMessagesListScreen')
);
const DirectMessageScreen = React.lazy(() =    import('@repo/community/screens/DirectMessageScreen.web')
);
// Announcements  in-app announcements screen
const AnnouncementsScreen = React.lazy(() =    import('@repo/community/screens/AnnouncementsScreen')
);

const Stack = createNativeStackNavigator<CommunityStackParamList>();

function ScreenFallback() {
    return <StackFallback variant="cards" />;
}

export default function CommunityStackNavigatorWeb() {
    const { scene } = useTheme();

    return (
        <React.Suspense fallback={<ScreenFallback />}
        <Stack.Navigator
            id="CommunityStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: scene.canvas.bg },
            }}
        
            <Stack.Screen name="CommunityMain" component={CommunityScreenWeb} /
            <Stack.Screen name="UserProfile" component={UserPublicProfileScreen} /
            <Stack.Screen name="PublicProfile" component={UserPublicProfileScreen} /
            <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} /
            <Stack.Screen name="GroupChat" component={GroupChatScreen} /
            <Stack.Screen name="DirectMessagesList" component={DirectMessagesListScreen} /
            <Stack.Screen name="DirectMessage" component={DirectMessageScreen} /
            <Stack.Screen name="Announcements" component={AnnouncementsScreen} /
        </Stack.Navigator
        </React.Suspense
    );
}
