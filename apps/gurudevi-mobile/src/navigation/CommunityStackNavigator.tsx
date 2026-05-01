import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  AnnouncementsScreen,
  CommunityScreen,
  DirectMessageScreen,
  DirectMessagesListScreen,
  GroupChatScreen,
  GroupDetailsScreen,
  UserPublicProfileScreen,
} from '@repo/community';
import { CommunityStackParamList } from '@repo/core/types';
import { useTheme } from '@repo/ui/primitives';
const Stack = createNativeStackNavigator<CommunityStackParamList>();

export default function CommunityStackNavigator() {
  const { scene } = useTheme();

  return (
    <Stack.Navigator
      id="CommunityStack"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: scene.surface.bg },
      }}
    >
      <Stack.Screen name="CommunityMain" component={CommunityScreen} />
      <Stack.Screen
        name="GroupDetails"
        component={GroupDetailsScreen}
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="GroupChat"
        component={GroupChatScreen}
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserPublicProfileScreen}
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="DirectMessagesList"
        component={DirectMessagesListScreen}
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="DirectMessage"
        component={DirectMessageScreen}
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Announcements"
        component={AnnouncementsScreen}
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
