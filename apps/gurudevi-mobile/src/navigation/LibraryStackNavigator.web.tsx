import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { LibraryStackParamList } from '@repo/core';
import { useTheme } from '@repo/ui/primitives';

import React from 'react';
import { StackFallback } from '../components/web/WebScreenShimmer';

// Web-specific screens — lazy loaded for code splitting
// Web-specific screens — lazy loaded for code splitting
const LibraryScreenWeb = React.lazy(() => import('@repo/library/screens/LibraryScreen.web'));

// Package screens (Metro auto-resolves .web.tsx for each)
const PDFViewerScreen = React.lazy(() => import('@repo/library/screens/PDFViewerScreen.web'));
const VideoPlayerScreen = React.lazy(() => import('@repo/library/screens/VideoPlayerScreen.web'));
const MapScreen = React.lazy(() => import('@repo/library/screens/MapScreen.web'));
const CuratorReviewScreen = React.lazy(() => import('@repo/library/screens/CuratorReviewScreen'));

const Stack = createNativeStackNavigator<LibraryStackParamList>();

function ScreenFallback() {
  return <StackFallback variant="cards" />;
}

export default function LibraryStackNavigatorWeb() {
  const { gradientNodes } = useTheme();

  return (
    <React.Suspense fallback={<ScreenFallback />}>
      <Stack.Navigator
        id="LibraryStack"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: gradientNodes[0] },
        }}
      >
        <Stack.Screen name="LibraryHome" component={LibraryScreenWeb} />
        <Stack.Screen name="PDFViewer" component={PDFViewerScreen} />
        <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
        <Stack.Screen name="LibraryMap" component={MapScreen} />
        <Stack.Screen name="CuratorReview" component={CuratorReviewScreen} />
      </Stack.Navigator>
    </React.Suspense>
  );
}
