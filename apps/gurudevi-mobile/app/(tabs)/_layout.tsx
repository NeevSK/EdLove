import { Tabs } from 'expo-router';
import { Heart, Library, School, User, Users } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="self"
        options={{
          title: 'Self',
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="workspace"
        options={{
          title: 'Workspace',
          tabBarIcon: ({ color, size }) => <School color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => <Library color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
