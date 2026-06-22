---
title: "Expo Router Package Migration Guidance"
status: "active"
created: 2026-06-10
updated: 2026-06-11
author: "Naveen"
scribe: "Antigravity"
tags: [expo-router, migration, package-boundaries, navigation, guidance, react-navigation-7]
---

# Expo Router Package Migration Guidance

This is the workspace playbook for keeping package-resident screens aligned with the live Expo Router shell in `polymath-platform`.

Use this guide to ensure that route ownership, parameters, navigation triggers, and platform boundaries stay compatible with the file-based route tree under `apps/gurudevi-mobile/app/`.

> [!TIP]
> Refer to the supplementary [Expo Router Quick Onboarding Reference](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/architecture/expo-router-quick-onboarding.md) for quick lookups on folder structures, layout components, and naming conventions.

---

## 🏛️ Core Architectural Principles

Expo Router is the live routing system here. It still uses React Navigation under the hood, but app code should treat the file tree and `_layout.tsx` files as the source of truth.

A successful migration honors the following pillars:
*   **File-Based Authority**: The routing tree is defined by the file hierarchy in `apps/gurudevi-mobile/app/` (and its web counterpart). Screens do not register themselves in central JS configurations.
*   **Decoupled Screens**: Screens inside packages (`packages/<name>/src/screens/`) must remain pure presentation components. They must **never** reference legacy navigator containers, raw route objects, or screen-name strings.
*   **URL-Safe Params**: Route parameters are serialized as string key-value pairs in the URL. Complex, non-serializable objects or functions cannot be passed in route parameters.
*   **Minimalist App Wrappers**: App-shell route files under the `app/` folder should remain thin entry points that simply import and re-export the underlying package components.

---

## 🗺️ API Mapping: React Navigation 7 ➔ Expo Router

| React Navigation 7 API | Expo Router Equivalent | Behavior / Migration Rule |
| :--- | :--- | :--- |
| `useNavigation()` | `useRouter()` | Replace imperative navigation commands (`navigation.navigate`, `replace`, etc.) with `router` actions. |
| `navigation.navigate('ScreenName', params)` | `router.push('/path/to/screen?id=value')` or `router.push({ pathname: '/path/to/screen', params: { id: 'value' } })` | Convert string-based screen name navigation into file paths. |
| `navigation.replace('ScreenName', params)` | `router.replace('/path/to/screen')` | Replace current screen in history. |
| `navigation.goBack()` / `navigation.canGoBack()` | `router.back()` / `router.canGoBack()` | Pop stack. |
| `navigation.reset({ index, routes })` | `router.replace('/fallback')` or `router.dismissAll()` followed by `router.push()` | Completely reset the stack topology. |
| `getParent()?.navigate(...)` | Route to absolute paths (e.g. `router.push('/library')`) | Do not rely on nested stack heirarchies for relative navigation. |
| `useRoute()` | `useLocalSearchParams()` | Retrieve the active route params. |
| `route.params` | `useLocalSearchParams<Type>()` | Parameters are now read directly from URL search parameters. |
| `useFocusEffect(callback)` | `useFocusEffect(callback)` (from `expo-router`) | Note: `useFocusEffect` is re-exported by `expo-router`. |
| `Link` (from `@react-navigation/native`) | `<Link href="/path">` (from `expo-router`) | Use declarative link components for automatic web accessibility and SEO. |
| `<Stack.Navigator>` / `<Stack.Screen>` | `<Stack>` / `<Stack.Screen>` (from `expo-router`) | Configure options declaratively inside a Layout (`_layout.tsx`) using the slot system. |

---

## ⚡ Package Routing Protocol

### Phase 1: Mapping the Target Package
Before touching code, inventory the package layout and cross-package dependencies:
1.  **Locate the live route entry**: Find the route file in `apps/gurudevi-mobile/app/` that renders the package screen.
2.  **Audit Param Contracts**: Inspect the route params the screen expects and ensure they are URL-safe.
3.  **Trace Navigation Actions**: Run a grep query in the package for `useRouter`, `useLocalSearchParams`, `.push(`, `.replace(`, `.back(`, and `route.params`.

### Phase 2: Resolving the Route Parameters
Expo Router requires parameters to be serializable as URL strings.

#### Classification Matrix
*   🟢 **Green (Safe)**: Primitive scalar values (`string`, `number`, `boolean`). Keep as-is.
*   🟡 **Yellow (Needs Normalization)**: Optional display values (e.g., `title`, `creatorName`). Make them optional, default them safely, and obtain them locally if possible.
*   🔴 **Red (Unsupported)**: Complex object payloads or callbacks (e.g., passing a full `profile` object or an `onRefresh()` handler).

#### Refactoring Red (Complex Object) Parameters
Instead of passing the object, pass a stable identifier (e.g., `profileId`) and query the data locally via React Query or a cache store.

*❌ Legacy Pattern:*
```tsx
// Navigating Screen
navigation.navigate('FullProfile', { profile: fullProfileData });

// Destination Screen
const route = useRoute<RouteProp<ProfileStackParamList, 'FullProfile'>>();
const { profile } = route.params;
```

*✅ Expo Router Pattern:*
```tsx
// Navigating Screen
router.push(`/profile/details?profileId=${profileId}`);

// Destination Screen
const { profileId } = useLocalSearchParams<{ profileId: string }>();
const { data: profile, isLoading } = useProfileQuery(profileId);
```

#### Refactoring Red (Callback Function) Parameters
Instead of passing callbacks like `onRefresh` or `onComplete`, utilize event bridges, state managers (Zustand/Zustand Slice), or global stores to react to actions.

*❌ Legacy Pattern:*
```tsx
navigation.navigate('PrincipalDashboard', { onRefresh: () => refetchAll() });
```

*✅ Expo Router Pattern:*
```tsx
// Triggering action on completion/refresh
eventBridge.emit('dashboard:refresh');
router.back();
```

---

### Phase 3: Rewriting Package-Level Navigation Hooks
Swap React Navigation imports to Expo Router hooks inside the screen body:

*❌ Legacy Screen:*
```tsx
import { useNavigation, useRoute } from '@react-navigation/native';

export function DocumentViewerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { resourceId } = route.params;

  return (
    <Button onPress={() => navigation.navigate('LibraryHome')} title="Back" />
  );
}
```

*✅ Migrated Screen:*
```tsx
import { useRouter, useLocalSearchParams } from 'expo-router';

export function DocumentViewerScreen() {
  const router = useRouter();
  const { resourceId } = useLocalSearchParams<{ resourceId: string }>();

  return (
    <Button onPress={() => router.push('/library')} title="Back" />
  );
}
```

---

### Phase 4: Constructing Layouts, Groups, and the File Tree
Create corresponding files under the `app/` directory of the application:
1.  **Identify Group boundaries**: Tab views belong inside `(tabs)` folders, auth boundaries inside `(auth)`. Group folders `(folders)` help organize the route architecture without polluting the URL structure.
2.  **Define Layouts**: Use `_layout.tsx` to handle stack navigation declarations and configure layout options.
3.  **Thin Re-exports**: Keep files in `app/` simple and lean.

*Example wrapper (`app/(tabs)/library/index.tsx`):*
```tsx
import { LibraryScreen } from '@repo/library';

export default function LibraryRoute() {
  return <LibraryScreen />;
}
```

#### 💡 Official Expo Router Patterns (Supplements from Expo MCP)

*   **Relative Path Routing**: Expo Router supports relative routes. Use `./` for screen siblings and `../` for parent stack targets:
    ```typescript
    router.push('./details');
    router.push('../settings');
    ```
*   **Declarative Links & Prefetching**: For high-performance transitions, prefer the `<Link>` component with prefetching enabled:
    ```tsx
    import { Link } from 'expo-router';
    
    // Renders accessibility-friendly link with prefetching enabled
    <Link href="/library/map" prefetch>
      <Text>View Map</Text>
    </Link>
    ```
*   **Dynamic Tab Hiding**: To hide tab routes (such as role-conditional or developer-flagged tabs like `Workforce`) without altering layout composition, set `href: null` in screen options:
    ```tsx
    <Tabs.Screen
      name="workforce"
      options={{
        title: 'Workforce',
        href: isDevelopingWorkforce ? '/workforce' : null,
      }}
    />
    ```
*   **Protected Layouts & Auth Guards**: Declare authorization gates using layout protection slots:
    ```tsx
    import { Tabs } from 'expo-router';
    
    export default function TabLayout() {
      const { session } = useAuth();
      const isLoggedIn = !!session;
      
      return (
        <Tabs>
          <Tabs.Screen name="index" options={{ tabBarLabel: 'Home' }} />
          <Tabs.Protected guard={isLoggedIn}>
            <Tabs.Screen name="profile" options={{ tabBarLabel: 'Profile' }} />
          </Tabs.Protected>
        </Tabs>
    }
    ```

---

### Phase 5: Handling Web vs. Native Splitting
When web and native route behaviors genuinely differ (e.g., split-pane layout on web vs stack on native), split files using the extension mechanism:
*   `MyScreen.tsx` (Targeted for React Native)
*   `MyScreen.web.tsx` (Targeted for Web)

Ensure that both files expose the exact same API and props surface, so the wrapper `app/` files can import them cleanly without platform-conditional hacks.

---

## 🔒 Type Safety and Route Typing
Expo Router offers built-in TypeScript support that statically types all route paths. 

*   **Avoid Custom Param Types**: Do not maintain manual `ParamList` configurations in `packages/core/src/types/navigation.ts`.
*   **Strict Types**: Use typed route templates. Instead of casting inputs as `any`, define typing expectations directly inside hooks:
    ```tsx
    const { resourceId } = useLocalSearchParams<{ resourceId: string }>();
    ```

---

## 🧪 Testing and Mocking Expo Router

Ensure tests do not fail on missing router contexts. Mock the router hooks inside your test files.

*Example mock in Jest:*
```typescript
jest.mock('expo-router', () => {
  return {
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      canGoBack: () => true,
    }),
    useLocalSearchParams: () => ({
      id: 'mock-id-123',
    }),
    Link: 'Link',
  };
});
```

---

## ⚠️ Common Anti-Patterns to Avoid

*   **Swapping Imports and Stopping**: Swapping `useNavigation` to `useRouter` but keeping legacy string-based route naming (e.g., `router.push('ProfileMain')`). Always use absolute or relative file paths (e.g., `router.push('/profile')`).
*   **Leaving Dead Param Schemas**: Leaving obsolete TypeScript navigation interfaces alive. Once a package is migrated, delete its stack types from the central typing file.
*   **Mixing UI Frameworks**: Do not expose Gluestack or older React Navigation UI controls inside new Layouts. Maintain clean Skia-enhanced or custom UI systems.
*   **Web Title Desync**: When creating new web pages, ensure the title is synchronized dynamically using standard document title updates or `<Stack.Screen options={{ title: 'Page Title' }} />`.

---

> [!IMPORTANT]
> **Checklist for Completion**:
> 1. No package-resident screen imports `@react-navigation/native` or `@react-navigation/native-stack`.
> 2. All navigation actions are path-based.
> 3. Complex parameter objects are decoupled and query-backed.
> 4. Separate package typecheck (`npm run tsc` inside `packages/<name>`) passes cleanly.
