import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Theme, useTheme } from '@repo/ui';
import { StackFallback } from '../components/web/WebScreenShimmer';
import { CommunityStackParamList } from '@repo/core';

// Web-specific screens — lazy loaded for code splitting
const CommunityScreenWeb = React.lazy(() => import('../screens/CommunityScreen.web'));

// Community sub-screens — use package screens (Metro resolves .web.tsx automatically)
const UserPublicProfileScreen = React.lazy(() =>
    import('@repo/community').then(m => ({ default: m.UserPublicProfileScreen }))
);
const GroupDetailsScreen = React.lazy(() =>
    import('@repo/community').then(m => ({ default: m.GroupDetailsScreen }))
);
const GroupChatScreen = React.lazy(() =>
    import('@repo/community').then(m => ({ default: m.GroupChatScreen }))
);
const DirectMessagesListScreen = React.lazy(() =>
    import('@repo/community').then(m => ({ default: m.DirectMessagesListScreen }))
);
const DirectMessageScreen = React.lazy(() =>
    import('@repo/community').then(m => ({ default: m.DirectMessageScreen }))
);

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
        </Stack.Navigator>
        </React.Suspense>
    );
}