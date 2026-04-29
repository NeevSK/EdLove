# 🏛️ sovereign_audit:architecture - @repo/library
> **Timestamp:** 2026-04-27T11:53:42.328Z
> **Target Path:** `C:\Users\Naween\projects\polymath-platform\packages\library`
> **Audit Score:** 🔴 ACTION REQUIRED

## 📊 Executive Summary
| Metric | Value |
| :--- | :--- |
| **Total Violations** | 160 |
| **Hygiene Warnings** | 0 |
| **Subpath Exports** | 9 subpaths |

## ❌ Architectural Violations
| Type | File | Issue | Documentation |
| :--- | :--- | :--- | :--- |
| **LOGIC -> UI** | `./utils/externalLinks.ts` | 1:import type { ExternalLinkOpenOptions } from '@repo/ui'; | N/A |
| **LOGIC -> UI** | `./hooks/usePerspectiveLayout.ts` | 10:import { useReality } from '@repo/ui'; | N/A |
| **NATIVE POLLUTION** | `./components/CollectionPickerModal.tsx` | 18:import { ChevronRight, Folder, Lock, X } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/LibraryThumbnailCard.web.tsx` | 14:} from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/LibraryThumbnailCard.tsx` | 24:} from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/LibraryResourceCard.tsx` | 2:import { File, FileText, Heart, Link, Plus, Video } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ResourceActionSheet.tsx` | 18:import { Bookmark, FileText, FolderPlus, PlayCircle, Share2 } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./api/database.ts` | 1:import * as SQLite from 'expo-sqlite'; | N/A |
| **NATIVE POLLUTION** | `./components/ResourceShareQRModal.tsx` | 11:import { Share2 } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ResourceList.tsx` | 24:import { AlertTriangle, ArrowLeftRight, Play, X } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ResourceRow.tsx` | 32:} from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/perspectives/DharmaView.web.tsx` | 3:import { CheckCircle2, Circle } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/perspectives/DharmaView.tsx` | 3:import { CheckCircle2, Circle as CircleIcon, Lock } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/perspectives/DharmaView.tsx` | 5:import { Circle, Path, Svg } from 'react-native-svg'; | N/A |
| **NATIVE POLLUTION** | `./components/modals/StudentAnalysisModal.tsx` | 24:import { BlurView } from 'expo-blur'; | N/A |
| **NATIVE POLLUTION** | `./components/modals/StudentAnalysisModal.tsx` | 25:import { FileCheck, Save, Sparkles, X } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/modals/StudentAnalysisModal.tsx` | 28:import Svg, { Circle, G, Line, Polygon, Text as SvgText } from 'react-native-svg'; | N/A |
| **NATIVE POLLUTION** | `./components/perspectives/JyotiView.web.tsx` | 3:import { Network, Orbit, Route } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/perspectives/AstroView.tsx` | 4:import { Gesture, GestureDetector } from 'react-native-gesture-handler'; | N/A |
| **NATIVE POLLUTION** | `./components/perspectives/AstroView.tsx` | 5:import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/perspectives/AstroView.tsx` | 6:import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg'; | N/A |
| **NATIVE POLLUTION** | `./components/perspectives/UniversalPerspective.tsx` | 13:} from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/perspectives/TerraView.web.tsx` | 3:import { Globe } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/perspectives/VatyaView.tsx` | 4:import { Circle, G, Line, Polygon, Svg, Text as SvgText } from 'react-native-svg'; | N/A |
| **NATIVE POLLUTION** | `./components/perspectives/VastuView.tsx` | 10:} from 'react-native-gesture-handler'; | N/A |
| **NATIVE POLLUTION** | `./components/perspectives/VastuView.tsx` | 11:import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/perspectives/VastuView.tsx` | 12:import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg'; | N/A |
| **NATIVE POLLUTION** | `./components/maps/UnifiedMapView.tsx` | 1:import * as MapLibreGL from '@maplibre/maplibre-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/maps/UnifiedMapView.tsx` | 4:import MapViewRN, { PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps'; | N/A |
| **NATIVE POLLUTION** | `./components/perspectives/JyotiView.tsx` | 14:import { Layers, Network, Orbit, TrendingUp } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/maps/UnifiedMarker.tsx` | 1:import * as MapLibreGL from '@maplibre/maplibre-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/maps/UnifiedMarker.tsx` | 4:import { Marker } from 'react-native-maps'; | N/A |
| **NATIVE POLLUTION** | `./screens/CollectionDetailScreen.tsx` | 15:import { ArrowLeft } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/CuratorReviewScreen.tsx` | 16:import { Check, RefreshCw, Trash2, X } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/CollectionDetailScreen.web.tsx` | 15:import { ArrowLeft, Library, RefreshCw } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/LibraryScreen.tsx` | 54:} from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/MapScreen.tsx` | 24:import { BlurView } from 'expo-blur'; | N/A |
| **NATIVE POLLUTION** | `./screens/MapScreen.tsx` | 25:import { BarChart3, FileCheck, Globe, Network, Orbit, Route, Wind, X } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/MapScreen.tsx` | 28:import { GestureHandlerRootView } from 'react-native-gesture-handler'; | N/A |
| **NATIVE POLLUTION** | `./screens/MapScreen.tsx` | 34:} from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./screens/PDFViewerScreen.tsx` | 12:import * as FileSystem from 'expo-file-system'; | N/A |
| **NATIVE POLLUTION** | `./screens/PDFViewerScreen.tsx` | 13:import * as Sharing from 'expo-sharing'; | N/A |
| **NATIVE POLLUTION** | `./screens/PDFViewerScreen.tsx` | 14:import { Bookmark, Download, ExternalLink, XCircle } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/MapScreen.web.tsx` | 23:import { BarChart3, FileCheck, Globe, Network, Orbit, Route, Wind, X } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/PDFViewerScreen.web.tsx` | 26:import { Bookmark, ExternalLink, RefreshCw } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/LibraryScreen.web.tsx` | 32:} from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/ResourceHubScreen.tsx` | 26:} from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/VideoPlayerScreen.tsx` | 16:import { useVideoPlayer, VideoView } from 'expo-video'; | N/A |
| **NATIVE POLLUTION** | `./screens/VideoPlayerScreen.tsx` | 17:import { Pause, Play, RotateCcw, RotateCw, X } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/VideoPlayerScreen.web.tsx` | 24:import { Maximize, Pause, Play, RotateCcw, RotateCw, X } from 'lucide-react-native'; | N/A |
| **STATE DENSITY** | `hooks/useMappingSync.ts` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useTopologyPulse.ts` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/AddCollectionModal.tsx` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/AddResourceModal.tsx` | Has 6 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/MapScreen.tsx` | Has 6 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/LibraryScreen.web.tsx` | Has 8 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/ResourceList.tsx` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/VideoPlayerScreen.web.tsx` | Has 6 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/PDFViewerScreen.web.tsx` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/PDFViewerScreen.tsx` | Has 6 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/MapScreen.web.tsx` | Has 6 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/VideoPlayerScreen.tsx` | Has 6 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/perspectives/UniversalPerspective.tsx` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **SUBSCRIPTION** | `./screens/CollectionDetailScreen.web.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/CollectionDetailScreen.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/ResourceHubScreen.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/LibraryScreen.web.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **MEM SINK** | `./components/ResourceActionSheet.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/ResourceActionSheet.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/ResourceActionSheet.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/CollectionPickerModal.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/AddResourceModal.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/ResourceList.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/ResourceList.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/perspectives/DharmaView.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/CollectionDetailScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/CollectionDetailScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/CollectionDetailScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/CollectionDetailScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/CollectionDetailScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/CollectionDetailScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/CollectionDetailScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/CollectionDetailScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/CuratorReviewScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/CuratorReviewScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/CuratorReviewScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/CuratorReviewScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/perspectives/TerraView.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/perspectives/VastuView.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/perspectives/UniversalPerspective.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/perspectives/UniversalPerspective.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/perspectives/UniversalPerspective.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/perspectives/UniversalPerspective.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/perspectives/UniversalPerspective.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/LibraryScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/LibraryScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/LibraryScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/LibraryScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/LibraryScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/LibraryScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/LibraryScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/LibraryScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/LibraryScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/LibraryScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/LibraryScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/LibraryScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/LibraryScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/LibraryScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/LibraryScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/LibraryScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/LibraryScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/LibraryScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/MapScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/MapScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/MapScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/PDFViewerScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/PDFViewerScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/MapScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/MapScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/MapScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/PDFViewerScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/PDFViewerScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/ResourceHubScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/ResourceHubScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/ResourceHubScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/ResourceHubScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/ResourceHubScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/ResourceHubScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/VideoPlayerScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/VideoPlayerScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/VideoPlayerScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/VideoPlayerScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/VideoPlayerScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/VideoPlayerScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/VideoPlayerScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/VideoPlayerScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/VideoPlayerScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/VideoPlayerScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/VideoPlayerScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **A11Y** | `./screens/CollectionDetailScreen.web.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/LibraryScreen.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/LibraryScreen.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/MapScreen.web.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/VideoPlayerScreen.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/LibraryResourceCard.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/LibraryResourceCard.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/AddResourceModal.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/AddResourceModal.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/VideoPlayerScreen.web.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/AddCollectionModal.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ResourceShareQRModal.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ResourceRow.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ResourceRow.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ResourceRow.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ResourceRow.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/CollectionPickerModal.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/LibraryThumbnailCard.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ResourceList.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/modals/StudentAnalysisModal.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **WEB OVERFLOW** | `./shims/native-shim.web.ts` | Native-only API used in web file: 14:export const NativeModules = {}; | N/A |
