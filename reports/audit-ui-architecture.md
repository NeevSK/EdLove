# 🏛️ sovereign_audit:architecture - @repo/ui
> **Timestamp:** 2026-05-01T09:06:51.854Z
> **Target Path:** `C:\Users\Naween\projects\polymath-platform\packages\ui\src\hooks`
> **Audit Score:** 🔴 ACTION REQUIRED

## 📊 Executive Summary
| Metric | Value |
| :--- | :--- |
| **Total Violations** | 486 |
| **Hygiene Warnings** | 16 |
| **Subpath Exports** | 165 subpaths |

## ⚠️ Hygiene Warnings
- Wildcard export in src/index.ts
- Wildcard export in src/utils/index.ts
- Wildcard export in src/hooks/index.ts
- Wildcard export in src/components-native/index.ts
- Wildcard export in src/gluestack/index.tsx
- Wildcard export in src/context/index.ts
- Wildcard export in src/components/index.ts
- Wildcard export in src/components/social/index.ts
- Wildcard export in src/components/workspace/index.ts
- Wildcard export in src/components/maps/index.ts
- Wildcard export in src/providers/index.ts
- Wildcard export in src/components/media/index.ts
- Wildcard export in src/components/visualization/index.ts
- Wildcard export in src/components/ui/index.ts
- Manual loading state detected in ./screens/AuthScreen.web.tsx. Consider upgrading to useActionState for automatic lifecycle management.
- Manual loading state detected in ./components/media/AssetCreationPortal.tsx. Consider upgrading to useActionState for automatic lifecycle management.

## ❌ Architectural Violations
| Type | File | Issue | Documentation |
| :--- | :--- | :--- | :--- |
| **NATIVE POLLUTION** | `./archive/LotusPetalFAB.complex.tsx` | 14:import * as Haptics from 'expo-haptics'; | N/A |
| **NATIVE POLLUTION** | `./archive/LotusPetalFAB.complex.tsx` | 15:import { Edit, Flower2, MessageCircle, Plus, Upload } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./archive/LotusPetalFAB.complex.tsx` | 18:import { Dimensions, Image, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./archive/LotusPetalFAB.complex.tsx` | 30:} from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./gluestack-legacy/index.ts` | 8:} from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./context/CircadianProvider.tsx` | 4:import { View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./context/FidelityProvider.tsx` | 1:import AsyncStorage from '@react-native-async-storage/async-storage'; | N/A |
| **NATIVE POLLUTION** | `./context/ExternalLinkContext.tsx` | 8:} from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./context/LanguageProvider.tsx` | 1:import AsyncStorage from '@react-native-async-storage/async-storage'; | N/A |
| **NATIVE POLLUTION** | `./components-native/TemporalGlass.web.tsx` | 3:import { StyleSheet, View, type ViewStyle } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./context/ThemeProvider.tsx` | 1:import AsyncStorage from '@react-native-async-storage/async-storage'; | N/A |
| **NATIVE POLLUTION** | `./context/ThemeProvider.tsx` | 12:import { useColorScheme } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/BreathingLoader.tsx` | 16:import { StyleSheet, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/BreathingLoader.tsx` | 23:} from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components-native/TemporalGlass.tsx` | 8:} from '@shopify/react-native-skia'; | N/A |
| **NATIVE POLLUTION** | `./components-native/TemporalGlass.tsx` | 10:import { StyleSheet, View, type ViewStyle } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./context/RealityProvider.tsx` | 1:import NetInfo from '@react-native-community/netinfo'; | N/A |
| **NATIVE POLLUTION** | `./context/RealityProvider.tsx` | 12:import { AppState, type AppStateStatus } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/AchievementUnlockOverlay.tsx` | 1:import { Trophy } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/AchievementUnlockOverlay.tsx` | 3:import { Dimensions } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/AchievementUnlockOverlay.tsx` | 10:} from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/BreathAnimation.tsx` | 4:import { View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/BreathAnimation.tsx` | 11:} from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components-native/NoiseOverlay.web.tsx` | 2:import { StyleSheet, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/AdaptiveLayout.tsx` | 2:import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/AccountPinModal.tsx` | 1:import { Lock, Shield, Smartphone } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components-native/NoiseOverlay.tsx` | 1:import { Canvas, ColorMatrix, Paint, Rect, Turbulence } from '@shopify/react-native-skia'; | N/A |
| **NATIVE POLLUTION** | `./components-native/NoiseOverlay.tsx` | 3:import { StyleSheet, useWindowDimensions } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/DeviceAccountManager.tsx` | 2:import { Shield } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/DeviceAccountManager.tsx` | 4:import { Alert, Platform } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ConversationSheet.tsx` | 2:import { Platform } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/CollectionCard.tsx` | 14:import { LinearGradient } from 'expo-linear-gradient'; | N/A |
| **NATIVE POLLUTION** | `./components/CollectionCard.tsx` | 15:import { BadgeCheck, Bookmark, BookOpen } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/CollectionCard.tsx` | 16:import { ImageBackground, Pressable } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components-native/LivingCard.web.tsx` | 2:import { StyleSheet, View, type ViewStyle } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/DeleteAccountModal.tsx` | 1:import { AlertTriangle } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/DailyResonanceCard.tsx` | 1:import type { LucideIcon } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components-native/LivingCard.tsx` | 10:} from '@shopify/react-native-skia'; | N/A |
| **NATIVE POLLUTION** | `./components-native/LivingCard.tsx` | 12:import { StyleSheet, View, type ViewStyle } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ContentComposer.tsx` | 1:import { Platform } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ErrorBoundary.tsx` | 1:import { AlertTriangle, RefreshCw } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ErrorBoundary.tsx` | 3:import { Platform, Text as RNText, StyleSheet, TouchableOpacity, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/FeatureInfoIcon.tsx` | 1:import { Info } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/FeatureInfoIcon.tsx` | 3:import { Pressable } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components-legacy/vstack/index.tsx` | 3:import { View, type ViewProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./__tests__/Toast.test.tsx` | 1:import { act, fireEvent, render } from '@testing-library/react-native'; | N/A |
| **NATIVE POLLUTION** | `./__tests__/Toast.test.tsx` | 2:import { Pressable, Text } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/FeatureDiscoveryModal.tsx` | 1:import { Info } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ErrorMessage.tsx` | 6:import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/EmptyState.tsx` | 1:import type { LucideIcon } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/GuestDataSyncModal.tsx` | 3:import { AlertCircle, AlertTriangle, Check } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./__tests__/Select.test.tsx` | 1:import { fireEvent, render, waitFor } from '@testing-library/react-native'; | N/A |
| **NATIVE POLLUTION** | `./__tests__/Select.test.tsx` | 2:import { ChevronDown } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/HorizontalChipRow.tsx` | 2:import { FlatList, StyleSheet } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/GlassCard.tsx` | 2:import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./__tests__/Radio.test.tsx` | 1:import { fireEvent, render } from '@testing-library/react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/GlobalHeader.tsx` | 12:} from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/GlobalHeader.tsx` | 16:import { Pressable, TouchableOpacity } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/GlobalHeader.tsx` | 17:import { useSafeAreaInsets } from 'react-native-safe-area-context'; | N/A |
| **NATIVE POLLUTION** | `./components/FounderGlow.tsx` | 2:import { View, type ViewStyle } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/HistoryTimeline.tsx` | 4:import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./__tests__/Progress.test.tsx` | 1:import { render } from '@testing-library/react-native'; | N/A |
| **NATIVE POLLUTION** | `./__tests__/Actionsheet.test.tsx` | 1:import { fireEvent, render } from '@testing-library/react-native'; | N/A |
| **NATIVE POLLUTION** | `./__tests__/Modal.test.tsx` | 1:import { render } from '@testing-library/react-native'; | N/A |
| **NATIVE POLLUTION** | `./__tests__/Input.test.tsx` | 1:import { fireEvent, render } from '@testing-library/react-native'; | N/A |
| **NATIVE POLLUTION** | `./__tests__/Input.test.tsx` | 2:import { Search } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./__tests__/Checkbox.test.tsx` | 1:import { fireEvent, render } from '@testing-library/react-native'; | N/A |
| **NATIVE POLLUTION** | `./__tests__/Button.test.tsx` | 1:import { fireEvent, render } from '@testing-library/react-native'; | N/A |
| **NATIVE POLLUTION** | `./__tests__/Button.test.tsx` | 2:import { LogIn } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./index.ts` | 16:} from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./icons.ts` | 11:export * from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./providers/ToastProvider.tsx` | 3:import Animated, { FadeInUp, FadeOutUp, Layout } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components-legacy/view/index.tsx` | 12:} from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components-legacy/hstack/index.tsx` | 3:import { View, type ViewProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./primitives.ts` | 1:export { ActivityIndicator } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components-legacy/text/index.tsx` | 3:import { Text as RNText, type TextProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components-legacy/form-control/index.tsx` | 4:import { Text as RNText, type TextProps, View, type ViewProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/AuthScreen.tsx` | 5:import * as AuthSession from 'expo-auth-session'; | N/A |
| **NATIVE POLLUTION** | `./screens/AuthScreen.tsx` | 6:import * as WebBrowser from 'expo-web-browser'; | N/A |
| **NATIVE POLLUTION** | `./screens/AuthScreen.tsx` | 7:import { Mail } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./hooks/useResponsive.ts` | 1:import { useWindowDimensions } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/AppSettingsScreen.web.tsx` | 12:} from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./hooks/useDemoBridge.ts` | 3:import { Alert, Platform } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/WelcomeScreen.web.tsx` | 23:import { useRouter } from 'expo-router'; | N/A |
| **NATIVE POLLUTION** | `./screens/WelcomeScreen.web.tsx` | 34:} from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components-legacy/divider/index.tsx` | 10:} from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components-legacy/portal/index.tsx` | 2:import { StyleSheet, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./hooks/useAccessibility.ts` | 2:import { AccessibilityInfo } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/WelcomeScreen.tsx` | 5:import { Image } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components-legacy/center/index.tsx` | 3:import { View, type ViewProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components-legacy/overlay/index.tsx` | 2:import type { View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components-legacy/overlay/index.tsx` | 3:import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/IdentityCard.tsx` | 2:import { Briefcase, Crown, GraduationCap, ShieldAlert, User } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/IdentityCard.tsx` | 6:import { Dimensions, Image as RNImage, type StyleProp, type ViewStyle } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/IdentityCard.tsx` | 12:} from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./screens/NotificationsScreen.web.tsx` | 3:import { Bell, CheckCircle2, Inbox, Info, Shield, Sparkles } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./qr/QRShareButton.tsx` | 13:import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./utils/dialogs.ts` | 1:import { Alert } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components-legacy/modal/index.tsx` | 2:import { View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components-legacy/modal/index.tsx` | 3:import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components-legacy/button/index.tsx` | 10:} from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components-legacy/input/index.tsx` | 10:} from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components-legacy/box/index.tsx` | 3:import { View, type ViewProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./utils/shareAction.ts` | 1:import { Share } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components-legacy/image/index.tsx` | 3:import { type ImageProps, Image as RNImage } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryProgressBar.tsx` | 2:import { Animated, StyleSheet, Text, type ViewStyle } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryProgressBar.tsx` | 9:} from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryBackground.tsx` | 13:import { LinearGradient } from 'expo-linear-gradient'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryBackground.tsx` | 15:import { Animated, StyleSheet, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryNudge.tsx` | 1:import { BlurView } from 'expo-blur'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryNudge.tsx` | 3:import { StyleSheet, Text, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryNudge.tsx` | 4:import Animated, { FadeInUp } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/LivingGlow.tsx` | 3:import type { ViewProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/LivingGlow.tsx` | 11:} from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/ResonantHeatmap.tsx` | 2:import { ScrollView } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryModal.web.tsx` | 1:import { X } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryModal.web.tsx` | 3:import { Dimensions, Pressable } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/OnboardingScreen.web.tsx` | 18:import AsyncStorage from '@react-native-async-storage/async-storage'; | N/A |
| **NATIVE POLLUTION** | `./screens/OnboardingScreen.web.tsx` | 25:import { useWindowDimensions } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/QRCodeGenerator.tsx` | 16:import { StyleSheet, Text, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/QRCodeGenerator.tsx` | 17:import Svg, { Circle, G, Rect, Text as SvgText } from 'react-native-svg'; | N/A |
| **NATIVE POLLUTION** | `./components/JourneyHistoryCard.tsx` | 12:} from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/JourneyHistoryCard.tsx` | 15:import { Pressable } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryFlashList.tsx` | 2:import { BookOpen } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryFlashList.tsx` | 4:import { RefreshControl, type StyleProp, type ViewStyle } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryModal.tsx` | 1:import { X } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryModal.tsx` | 3:import { Pressable } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryChip.tsx` | 2:import { Pressable } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/InternalBrowser.web.tsx` | 1:import { ChevronLeft, ChevronRight, ExternalLink, RotateCcw, Share2, X } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/InternalBrowser.web.tsx` | 3:import { StyleSheet, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryCarousel.tsx` | 2:import { FlatList, StyleSheet, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryInput.tsx` | 1:import { AlertCircle } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/InternalBrowser.tsx` | 1:import * as WebBrowser from 'expo-web-browser'; | N/A |
| **NATIVE POLLUTION** | `./components/InternalBrowser.tsx` | 2:import { ChevronLeft, ChevronRight, ExternalLink, RotateCcw, Share2, X } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/InternalBrowser.tsx` | 5:import { ActivityIndicator, Linking, Share, StyleSheet } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/InternalBrowser.tsx` | 6:import { WebView, type WebViewNavigation } from 'react-native-webview'; | N/A |
| **NATIVE POLLUTION** | `./components/PositiveInvitation.tsx` | 1:import { LogIn, Plus, Sparkles } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryCard.tsx` | 13:import { Platform } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryCard.tsx` | 14:import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryFlashList.web.tsx` | 13:import { BookOpen } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryFlashList.web.tsx` | 15:import { FlatList, RefreshControl, type StyleProp, type ViewStyle } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/PollWidget.tsx` | 2:import { Animated } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/TemporalPilot.tsx` | 2:import { Calendar, Layout as LayoutIcon, Search, Wifi, WifiOff, Zap } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/TemporalPilot.tsx` | 5:import { Modal, Pressable } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/NotificationDrawer.tsx` | 1:import { Bell, BookOpen, Check, CheckCircle, Info, Users, X } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/NotificationDrawer.tsx` | 2:import { Dimensions, ScrollView } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/NotificationDrawer.tsx` | 3:import Animated, { Easing, SlideInLeft, SlideOutLeft } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/NotificationDrawer.tsx` | 4:import { useSafeAreaInsets } from 'react-native-safe-area-context'; | N/A |
| **NATIVE POLLUTION** | `./components/TemporalNavigator.tsx` | 2:import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/TemporalNavigator.tsx` | 3:import { Pressable } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/TemporalNavigator.tsx` | 4:import Animated, { FadeIn, Layout } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryGlobalStyles.tsx` | 2:import { Platform } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/NetworkStatusBanner.tsx` | 2:import { WifiOff } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/NetworkStatusBanner.tsx` | 3:import { Platform } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/NetworkStatusBanner.tsx` | 4:import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/NetworkStatusBanner.tsx` | 5:import { useSafeAreaInsets } from 'react-native-safe-area-context'; | N/A |
| **NATIVE POLLUTION** | `./components/UserAvatar.tsx` | 2:import { Image, StyleSheet, Text, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/LotusLoader.tsx` | 1:import { Flower } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/LotusLoader.tsx` | 3:import { ActivityIndicator } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/LotusLoader.tsx` | 11:} from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./screens/OnboardingScreen.tsx` | 1:import AsyncStorage from '@react-native-async-storage/async-storage'; | N/A |
| **NATIVE POLLUTION** | `./components/UniversalModal.web.tsx` | 2:import { Pressable, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/LotusPetalFAB.tsx` | 1:import { Wind } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/LotusPetalFAB.tsx` | 4:import { Dimensions, PanResponder, Platform, Pressable } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/LotusPetalFAB.tsx` | 14:} from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/LotusDropdown.tsx` | 1:import { AlertCircle, ChevronDown } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/LotusDropdown.tsx` | 3:import { Pressable } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ScreenWrapper.tsx` | 2:import { Platform, StatusBar, StyleSheet } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ScreenWrapper.tsx` | 3:import { useSafeAreaInsets } from 'react-native-safe-area-context'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryToast.tsx` | 1:import { AlertCircle, CheckCircle, Info, X } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryToast.tsx` | 3:import { Pressable } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryToast.tsx` | 10:} from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/UniversalModal.tsx` | 2:import { Modal } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/LogoutModal.tsx` | 1:import { LogOut } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SandboxBanner.tsx` | 2:import { X, Zap } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SanctuaryStatsCard.tsx` | 1:import { Trophy } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/workspace/shared.tsx` | 6:import { LayoutGrid, Pin } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/workspace/shared.tsx` | 8:import { StyleSheet, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SmartShelf.tsx` | 14:import { ChevronRight } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SmartShelf.tsx` | 16:import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/media/AssetCollectionPicker.tsx` | 1:import { ChevronRight, Folder, Lock, X } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/workspace/ResponsiveWorkspaceCanvas.tsx` | 2:import { Platform, useWindowDimensions } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/SkeletonLoader.tsx` | 9:} from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/media/AssetShareModal.tsx` | 2:import { Share2 } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ScreenWrapper.web.tsx` | 2:import { ScrollView, StyleSheet, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/media/PdfViewer.tsx` | 2:import { Bookmark, Download, ExternalLink, XCircle } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/media/ResourceActionSheet.tsx` | 2:import { Bookmark, FileText, FolderPlus, Info, PlayCircle, Share2 } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/media/ResourceCard.tsx` | 2:import { File, FileText, Heart, Info, Link, Map, Plus, Video } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/social/CommunityPresence.tsx` | 16:} from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/media/UniversalDocumentPortal.tsx` | 2:import { AlertCircle, Download, ExternalLink, FileText, Info, Sparkles } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/TemporalProvider.tsx` | 4:import { StyleSheet, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/media/VideoPlayer.tsx` | 2:import { useVideoPlayer, VideoView } from 'expo-video'; | N/A |
| **NATIVE POLLUTION** | `./components/media/VideoPlayer.tsx` | 3:import { Pause, Play, RotateCcw, RotateCw, X } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/media/VideoPlayer.tsx` | 5:import { Pressable } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/media/VideoPlayer.tsx` | 6:import Animated, { FadeInUp } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/TemporalShield.tsx` | 2:import { Shield } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/TemporalShield.tsx` | 4:import { StyleSheet, Text, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/TemporalScrubber.tsx` | 3:import { Animated, Dimensions, PanResponder } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/media/VideoPlayer.web.tsx` | 2:import { Pause, Play, RotateCcw, RotateCw, X } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/media/VideoPlayer.web.tsx` | 5:import { Pressable } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/workspace/CanvasZoneColumn.tsx` | 3:import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/workspace/renderers/WebWorkspaceCanvas.tsx` | 2:import { ScrollView, StyleSheet, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/workspace/CanvasSurfaceCard.tsx` | 2:import { EyeOff, Info, MoveDiagonal2, Pin, Sparkles } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/workspace/CanvasSurfaceCard.tsx` | 4:import { Pressable, StyleSheet, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/workspace/renderers/TabletWorkspaceCanvas.tsx` | 2:import { StyleSheet, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/workspace/renderers/MobileWorkspaceCanvas.tsx` | 2:import { StyleSheet, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/avatar/index.tsx` | 4:import { Text, View, type ViewProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/badge/index.tsx` | 3:import { Text, type TextProps, View, type ViewProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/box/index.tsx` | 3:import { type StyleProp, View, type ViewProps, type ViewStyle } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/actionsheet/index.tsx` | 4:import { Pressable, View, type ViewProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/actionsheet/index.tsx` | 5:import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/visualization/DharmaView.tsx` | 2:import { CheckCircle2, Circle as CircleIcon, Lock } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/button/index.tsx` | 12:} from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/visualization/AstroView.tsx` | 3:import { Gesture, GestureDetector } from 'react-native-gesture-handler'; | N/A |
| **NATIVE POLLUTION** | `./components/visualization/AstroView.tsx` | 4:import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/visualization/AstroView.tsx` | 5:import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/center/index.tsx` | 2:import { View, type ViewProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/visualization/JyotiView.tsx` | 2:import { Layers, Network, Orbit, TrendingUp } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/visualization/VastuView.tsx` | 2:import { Canvas, Circle, Line } from '@shopify/react-native-skia'; | N/A |
| **NATIVE POLLUTION** | `./components/visualization/VatyaView.tsx` | 3:import { Circle, Path, Svg } from 'react-native-svg'; | N/A |
| **NATIVE POLLUTION** | `./components/InteractiveRadarChart.tsx` | 3:import { StyleSheet, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/InteractiveRadarChart.tsx` | 4:import Svg, { Circle, G, Line, Polygon, Text as SvgText } from 'react-native-svg'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/checkbox/index.tsx` | 1:import { Check } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/checkbox/index.tsx` | 5:import { Pressable, Text, View, type ViewProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/fab/index.tsx` | 4:import { Pressable, type ViewProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/divider/index.tsx` | 3:import { View, type ViewProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/list/index.tsx` | 8:} from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/input/index.tsx` | 10:} from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/link/index.tsx` | 1:import { Platform, Pressable, Text } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/image-background/index.tsx` | 3:import { type ImageBackgroundProps, ImageBackground as RNImageBackground } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/hstack/index.tsx` | 2:import { type StyleProp, View, type ViewProps, type ViewStyle } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/icon/index.tsx` | 3:import type { View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/icon/index.tsx` | 4:import { Svg } from 'react-native-svg'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/linear-gradient/index.tsx` | 4:} from 'expo-linear-gradient'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/image/index.tsx` | 3:import { type ImageProps, Image as RNImage } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/slider/index.tsx` | 1:import RNSlider, { type SliderProps as RNSliderProps } from '@react-native-community/slider'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/spinner/index.tsx` | 3:import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/portal/index.tsx` | 2:import { StyleSheet, View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/radio/index.tsx` | 4:import { Pressable, Text, View, type ViewProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/select/index.tsx` | 3:import { Pressable, type PressableProps, Text, View, type ViewProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/select/index.tsx` | 4:import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/modal/index.tsx` | 4:import { View, type ViewProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/modal/index.tsx` | 5:import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/overlay/index.tsx` | 2:import type { View } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/overlay/index.tsx` | 3:import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/text/index.tsx` | 3:import { Text as RNText, type StyleProp, type TextProps, type TextStyle } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/scroll-view/index.tsx` | 3:import { ScrollView as RNScrollView, type ScrollViewProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/pressable/index.tsx` | 3:import { type PressableProps, Pressable as RNPressable } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/switch/index.tsx` | 1:import { Platform, Switch as RNSwitch, type SwitchProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/textarea/index.tsx` | 3:import { TextInput, type TextInputProps, View, type ViewProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/text-input/index.tsx` | 3:import { TextInput as RNTextInput, type TextInputProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/progress/index.tsx` | 3:import { View, type ViewProps } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/view/index.tsx` | 16:} from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/view/index.tsx` | 17:import Animated from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/vstack/index.tsx` | 2:import { type StyleProp, View, type ViewProps, type ViewStyle } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ui/toast/index.tsx` | 4:import { View, type ViewProps } from 'react-native'; | N/A |
| **STATE DENSITY** | `archive/LotusPetalFAB.complex.tsx` | Has 3 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `components/AccountPinModal.tsx` | Has 5 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `context/ThemeProvider.tsx` | Has 4 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `components-legacy/portal/index.tsx` | Has 3 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `components/ConversationSheet.tsx` | Has 3 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `components/DeviceAccountManager.tsx` | Has 4 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `context/ExternalLinkContext.tsx` | Has 4 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `components/HistoryTimeline.tsx` | Has 4 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `components/GlobalHeader.tsx` | Has 4 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `hooks/useAccessibility.ts` | Has 3 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `components/InternalBrowser.tsx` | Has 6 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `components/media/AssetCreationPortal.tsx` | Has 5 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `screens/ErrorMessageDemo.tsx` | Has 4 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `screens/AuthScreen.web.tsx` | Has 7 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `screens/WorkspaceCanvasDemo.tsx` | Has 4 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `screens/AppSettingsScreen.web.tsx` | Has 4 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `screens/WelcomeScreen.web.tsx` | Has 5 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `screens/OnboardingScreen.web.tsx` | Has 6 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `screens/OnboardingScreen.tsx` | Has 5 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `screens/WelcomeScreen.tsx` | Has 3 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STATE DENSITY** | `components/ui/portal/index.tsx` | Has 3 useState hooks. Maximum recommended is 2. Refactor to useReducer or a state machine. | [Guide](packages/ui/docs/state-management-guide.md#21-complex-local-state) |
| **STORE DESTRUCTURING** | `./hooks/useDemoBridge.ts` | Destructuring store state detected. Use atomic selectors to prevent over-subscription. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **STORE DESTRUCTURING** | `./screens/NotificationsScreen.web.tsx` | Destructuring store state detected. Use atomic selectors to prevent over-subscription. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **STORE DESTRUCTURING** | `./components/debug/FeatureOverridesPanel.tsx` | Destructuring store state detected. Use atomic selectors to prevent over-subscription. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **STORE DESTRUCTURING** | `./components/debug/FeatureOverridesPanel.tsx` | Destructuring store state detected. Use atomic selectors to prevent over-subscription. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **STORE DESTRUCTURING** | `./components/SandboxBanner.tsx` | Destructuring store state detected. Use atomic selectors to prevent over-subscription. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **STORE DESTRUCTURING** | `./components/TemporalNavigator.tsx` | Destructuring store state detected. Use atomic selectors to prevent over-subscription. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **STORE DESTRUCTURING** | `./components/TemporalProvider.tsx` | Destructuring store state detected. Use atomic selectors to prevent over-subscription. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **STORE DESTRUCTURING** | `./components/TemporalProvider.web.tsx` | Destructuring store state detected. Use atomic selectors to prevent over-subscription. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **STORE DESTRUCTURING** | `./components/TemporalShield.tsx` | Destructuring store state detected. Use atomic selectors to prevent over-subscription. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **STORE DESTRUCTURING** | `./components/TemporalScrubber.tsx` | Destructuring store state detected. Use atomic selectors to prevent over-subscription. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **STORE DESTRUCTURING** | `./components/WebScreenHeader.web.tsx` | Destructuring store state detected. Use atomic selectors to prevent over-subscription. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./hooks/useDemoBridge.ts` | Missing atomic selector in store hook call. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./components/debug/FeatureOverridesPanel.tsx` | Missing atomic selector in store hook call. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./components/debug/FeatureOverridesPanel.tsx` | Missing atomic selector in store hook call. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/NotificationsScreen.web.tsx` | Missing atomic selector in store hook call. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./components/SandboxBanner.tsx` | Missing atomic selector in store hook call. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./components/TemporalShield.tsx` | Missing atomic selector in store hook call. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./components/TemporalScrubber.tsx` | Missing atomic selector in store hook call. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./components/TemporalProvider.web.tsx` | Missing atomic selector in store hook call. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./components/TemporalProvider.tsx` | Missing atomic selector in store hook call. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./components/TemporalNavigator.tsx` | Missing atomic selector in store hook call. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./components/WebScreenHeader.web.tsx` | Missing atomic selector in store hook call. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **MEM SINK** | `./archive/LotusPetalFAB.complex.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./__tests__/Toast.test.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./context/ExternalLinkContext.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./context/ExternalLinkContext.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./context/ExternalLinkContext.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./context/ExternalLinkContext.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./context/ExternalLinkContext.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/AppSettingsScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/AppSettingsScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/AppSettingsScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/AppSettingsScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/AppSettingsScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/AppSettingsScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/AppSettingsScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/AppSettingsScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/WorkspaceCanvasDemo.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/AuthScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/AuthScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/AuthScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/AuthScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/WelcomeScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/WelcomeScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/WelcomeScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/AuthScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/AuthScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/AuthScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/AuthScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/AuthScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/OnboardingScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/OnboardingScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/EntityModal.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/CollectionCard.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/HorizontalChipRow.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/CapabilityGuard.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/GuestDataSyncModal.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/GlobalHeader.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/GlobalHeader.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/GlobalHeader.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/GlobalHeader.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/GlobalHeader.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/FeatureInfoIcon.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/ConversationSheet.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/ConversationSheet.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/ConversationSheet.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/ConversationSheet.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/ContentComposer.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/ContentComposer.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/ContentComposer.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/ContentComposer.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/TemporalPilot.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/TemporalPilot.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/TemporalPilot.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/TemporalPilot.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/TemporalPilot.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/TemporalPilot.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/TemporalNavigator.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/TemporalNavigator.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/TemporalNavigator.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/LotusDropdown.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/LotusDropdown.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/PositiveInvitation.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/InternalBrowser.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/JourneyHistoryCard.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/PollWidget.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/NotificationDrawer.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/NotificationDrawer.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/NotificationDrawer.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/NotificationDrawer.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/SandboxBanner.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/LotusPetalFAB.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/LotusPetalFAB.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/LotusPetalFAB.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/workspace/CanvasSurfaceCard.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/workspace/CanvasSurfaceCard.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/workspace/CanvasSurfaceCard.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/ui/actionsheet/index.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/media/AssetCollectionPicker.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/visualization/UniversalPerspective.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/visualization/TerraView.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/media/ResourceActionSheet.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/media/ResourceActionSheet.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/media/ResourceActionSheet.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/media/ResourceActionSheet.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/media/VideoPlayer.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/media/VideoPlayer.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/ui/select/index.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/ui/select/index.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/ui/select/index.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/ui/select/index.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/ui/modal/index.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/DeviceAccountManager.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/DeviceAccountManager.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/DeviceAccountManager.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **A11Y** | `./components-legacy/image/index.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components-legacy/image/index.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./__tests__/Toast.test.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./__tests__/Button.test.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./__tests__/Button.test.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./qr/QRShareButton.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./qr/QRShareButton.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/AuthScreen.web.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/AuthScreen.web.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/WelcomeScreen.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/WelcomeScreen.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/AuthScreen.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/OnboardingScreen.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/OnboardingScreen.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/OnboardingScreen.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/OnboardingScreen.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/OnboardingScreen.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/AppSettingsScreen.web.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/AppSettingsScreen.web.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/GlobalHeader.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ErrorMessage.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/LogoutModal.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/PostCard.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/PostCard.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/PostCard.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/PostCard.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./gluestack-legacy/index.ts` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./gluestack-legacy/index.ts` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./gluestack-legacy/index.ts` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/InternalBrowser.web.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/InternalBrowser.web.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/InternalBrowser.web.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/InternalBrowser.web.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/SanctuaryToast.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/EmptyState.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/SanctuaryNudge.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/DeleteAccountModal.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/DeleteAccountModal.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/media/VideoPlayer.web.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/media/AssetShareModal.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ConversationSheet.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ConversationSheet.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/media/VideoPlayer.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/media/UniversalDocumentPortal.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/media/AssetCreationPortal.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/media/AssetCreationPortal.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/media/AssetCreationPortal.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/media/AssetCreationPortal.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ContentComposer.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ContentComposer.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ContentComposer.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ContentComposer.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ContentComposer.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/media/ResourceCard.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/CollectionCard.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/CollectionCard.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/IdentityCard.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/InternalBrowser.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/InternalBrowser.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/InternalBrowser.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/InternalBrowser.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/UserAvatar.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/UserAvatar.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ui/avatar/index.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ui/avatar/index.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ui/avatar/index.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ui/avatar/index.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./archive/LotusPetalFAB.complex.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./archive/LotusPetalFAB.complex.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./archive/LotusPetalFAB.complex.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ui/image/index.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ui/image/index.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ui/image/index.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **PLATFORM LEAK** | `./button.tsx` | HTML tag leakage detected in mobile component: 13:    <button | N/A |
| **PLATFORM LEAK** | `./card.tsx` | HTML tag leakage detected in mobile component: 15:    <a | N/A |
| **PLATFORM LEAK** | `./card.tsx` | HTML tag leakage detected in mobile component: 22:        {title} <span>-&gt;</span> | N/A |
| **PLATFORM LEAK** | `./card.tsx` | HTML tag leakage detected in mobile component: 24:      <p>{children}</p> | N/A |
| **SHIM DEBT** | `./components/ConversationSheet.tsx` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
| **SHIM DEBT** | `./components/ConversationSheet.tsx` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
| **SHIM DEBT** | `./components/ContentComposer.tsx` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
| **SHIM DEBT** | `./components/ContentComposer.tsx` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
| **SHIM DEBT** | `./components/DeviceAccountManager.tsx` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
| **SHIM DEBT** | `./hooks/useDemoBridge.ts` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
| **SHIM DEBT** | `./components/LotusPetalFAB.tsx` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
| **SHIM DEBT** | `./components/SanctuaryCard.tsx` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
| **SHIM DEBT** | `./components/SanctuaryCard.tsx` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
| **SHIM DEBT** | `./components/SanctuaryCard.tsx` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
| **SHIM DEBT** | `./components/ScreenWrapper.tsx` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
| **SHIM DEBT** | `./components/ScreenWrapper.tsx` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
| **SHIM DEBT** | `./components/workspace/ResponsiveWorkspaceCanvas.tsx` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
| **SHIM DEBT** | `./components/ui/link/index.tsx` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
| **SHIM DEBT** | `./components/ui/switch/index.tsx` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
| **SHIM DEBT** | `./components/ui/switch/index.tsx` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
| **SHIM DEBT** | `./components/ui/switch/index.tsx` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
