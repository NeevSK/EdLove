---
title: "Expo Router Quick Onboarding Reference"
status: "active"
created: 2026-06-11
updated: 2026-06-11
author: "Expo Team"
scribe: "Antigravity"
tags: [expo-router, onboarding, reference, layout, cheat-sheet]
---

# Expo Router Quick Onboarding Reference

This is a supplementary reference guide containing official, high-level onboarding information retrieved directly from the Expo MCP server. Use this alongside the [Expo Router Package Migration Guidance](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/expo-router-package-migration-guidance.md) as a quick syntax and file-structure cheat-sheet.

---

## 💡 What is Expo Router?
Expo Router is a file-based router for React Native and web applications built on top of React Navigation. It provides automatic deep linking and universal navigation across mobile and web platforms.

---

## 🏛️ Core Concepts

### File Structure Rules
*   All routes live in the `app/` directory of the application shell.
*   Each file matches a screen/page with an automatic URL mapping.
*   `app/index.tsx` is the initial route (`/`).
*   `app/_layout.tsx` is the root layout (replaces the old `App.tsx` global container).
*   Any non-navigation business logic or UI components belong outside of the `app/` directory (e.g. inside packages).

### File Naming Conventions
*   `home.tsx` ➔ `/home` (Static route)
*   `[id].tsx` ➔ `/123` (Dynamic route segment)
*   `(tabs)/` ➔ Route group folder (does not affect the public URL structure)
*   `index.tsx` ➔ The default route for its current directory
*   `_layout.tsx` ➔ Layout configuration for the active directory stack/tab/drawer
*   `+not-found.tsx` ➔ Catch-all error or 404 fallback page

---

## ⚡ Navigation Triggers

### Imperative Navigation
```tsx
import { useRouter } from 'expo-router';

const router = useRouter();
router.navigate('/about');      // Navigate to route
router.push('/about');          // Push onto stack history
router.back();                  // Pop stack history (Go back)
router.replace('/about');       // Replace current screen in history
```

### Declarative Navigation
```tsx
import { Link } from 'expo-router';

<Link href="/about">About</Link>
<Link href="/user/123">User Profile</Link>

// Parameterized routing objects
<Link href={{
  pathname: '/user/[id]',
  params: { id: '123' }
}}>Profile</Link>

// Custom wrapping via asChild
<Link href="/about" asChild>
  <Pressable><Text>About</Text></Pressable>
</Link>
```

### Dynamic Routes & Params
```tsx
// File: app/user/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

export default function User() {
  const { id } = useLocalSearchParams();
  return <Text>User ID: {id}</Text>;
}
```

---

## 🥞 Layout Shells

### Root Layout (`app/_layout.tsx`)
```tsx
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';

export default function RootLayout() {
  const [loaded] = useFonts({ /* fonts */ });

  if (!loaded) return null;

  return <Stack />;
}
```

### Stack Layout (`app/_layout.tsx`)
```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="about" options={{ headerShown: false }} />
    </Stack>
  );
}
```

### Tab Layout (`app/(tabs)/_layout.tsx`)
```tsx
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) =>
            <FontAwesome size={28} name="home" color={color} />
        }}
      />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
```

### Slot Layout (Custom Shell without Navigators)
```tsx
import { Slot } from 'expo-router';

export default function Layout() {
  return (
    <>
      <Header />
      <Slot />
      <Footer />
    </>
  );
}
```

---

## 🔒 Layout Protection Slots & Guards

Declare authentication or visibility guards using slot-level protection:

```tsx
import { Tabs } from 'expo-router';

const isLoggedIn = false;

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ tabBarLabel: 'Home' }} />
      <Tabs.Protected guard={isLoggedIn}>
        <Tabs.Screen name="private" options={{ tabBarLabel: 'Private' }} />
        <Tabs.Screen name="profile" options={{ tabBarLabel: 'Profile' }} />
      </Tabs.Protected>

      <Tabs.Protected guard={!isLoggedIn}>
        <Tabs.Screen name="login" options={{ tabBarLabel: 'Login' }} />
      </Tabs.Protected>
    </Tabs>
  );
}
```

---

## 💡 Quick Tips
*   Use `router.navigate()` for standard transitions.
*   Support relative routing paths: `./page` (current folder) and `../page` (parent folder).
*   URL query parameters can be set inline: `/users?limit=20` or via `router.setParams({ limit: 20 })`.
*   Universal deep linking works out-of-the-box (e.g. `myapp://profile/123`).
*   Set `initialRouteName` in layouts to guarantee correct back-button routing.
*   To hide tab paths from the UI without changing layout configuration, use `<Tabs.Screen options={{ href: null }} />`.
