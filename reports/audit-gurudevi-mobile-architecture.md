# 🏛️ sovereign_audit:architecture - gurudevi-mobile
> **Timestamp:** 2026-04-30T16:27:23.122Z
> **Target Path:** `C:\Users\Naween\projects\polymath-platform\apps\gurudevi-mobile`
> **Audit Score:** 🔴 ACTION REQUIRED

## 📊 Executive Summary
| Metric | Value |
| :--- | :--- |
| **Total Violations** | 38 |
| **Hygiene Warnings** | 2 |
| **Subpath Exports** | 0 subpaths |

## ⚠️ Hygiene Warnings
- No "exports" map found in package.json. Tree-shaking may be suboptimal.
- A11Y Hint Missing in ./components/web/PWAInstallBanner.web.tsx: Interactive elements with labels should have hints for clarity.

## ❌ Architectural Violations
| Type | File | Issue | Documentation |
| :--- | :--- | :--- | :--- |
| **NATIVE POLLUTION** | `./__tests__/components/WelcomeScreen.test.tsx` | 3:import { fireEvent, render, waitFor } from '@testing-library/react-native'; | N/A |
| **NATIVE POLLUTION** | `./__tests__/components/ProgressIndicator.test.tsx` | 4:import { render } from '@testing-library/react-native'; | N/A |
| **NATIVE POLLUTION** | `./__tests__/components/OnboardingScreen.test.tsx` | 13:import { fireEvent, render, waitFor } from '@testing-library/react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/web/PWAInstallBanner.web.tsx` | 15:import { Download, Share, X } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/web/PWAInstallBanner.web.tsx` | 16:import { SlideInDown, SlideOutDown } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/web/CommandPalette.web.tsx` | 14:import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/school/StepLocation.tsx` | 4:import { ChevronDown, Flag, MapPin } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./navigation/TabNavigator.web.tsx` | 23:} from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./navigation/TabNavigator.tsx` | 24:import { Hammer, Heart, Library, School, User, Users, X } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./navigation/TabNavigator.tsx` | 27:import { useSafeAreaInsets } from 'react-native-safe-area-context'; | N/A |
| **NATIVE POLLUTION** | `./utils/device.ts` | 6:import * as Device from 'expo-device'; | N/A |
| **NATIVE POLLUTION** | `./utils/usePWAInstallPrompt.ts` | 23:import { Platform } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./utils/useWebPageTitle.ts` | 12:import { Platform } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/school/StepDemographics.tsx` | 6:import { Users } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./providers/SanctuaryProvider.tsx` | 16:import { SafeAreaProvider } from 'react-native-safe-area-context'; | N/A |
| **NATIVE POLLUTION** | `./providers/DeepLinkProvider.tsx` | 5:import * as Linking from 'expo-linking'; | N/A |
| **NATIVE POLLUTION** | `./components/school/StepBasicInfo.tsx` | 3:import { Globe, Mail, Phone, School } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./providers/AssetProvider.tsx` | 1:import * as Font from 'expo-font'; | N/A |
| **NATIVE POLLUTION** | `./components/school/StepHierarchy.tsx` | 5:import { Plus } from 'lucide-react-native'; | N/A |
| **STATE DENSITY** | `components/web/CommandPalette.web.tsx` | Has 6 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `utils/usePWAInstallPrompt.ts` | Has 3 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `screens/ErrorMessageDemo.tsx` | Has 4 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `navigation/TabNavigator.web.tsx` | Has 6 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `navigation/TabNavigator.tsx` | Has 4 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STORE DESTRUCTURING** | `./services/FeatureSyncManager.tsx` | Destructuring store state detected. Use atomic selectors to prevent over-subscription. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **STORE DESTRUCTURING** | `./navigation/TabNavigator.tsx` | Destructuring store state detected. Use atomic selectors to prevent over-subscription. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./services/FeatureSyncManager.tsx` | Missing atomic selector in store hook call. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./navigation/TabNavigator.web.tsx` | Missing atomic selector in store hook call. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./navigation/TabNavigator.tsx` | Missing atomic selector in store hook call. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **MEM SINK** | `./components/web/PWAInstallBanner.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/school/StepHierarchy.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/school/StepDemographics.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/school/StepDemographics.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./navigation/TabNavigator.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **A11Y** | `./types/gluestack-ui.d.ts` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **SHIM DEBT** | `./utils/usePWAInstallPrompt.ts` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
| **SHIM DEBT** | `./utils/usePWAInstallPrompt.ts` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
| **SHIM DEBT** | `./utils/usePWAInstallPrompt.ts` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
