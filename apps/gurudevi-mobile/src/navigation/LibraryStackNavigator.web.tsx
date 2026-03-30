import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@repo/ui';
import { StackFallback } from '../components/web/WebScreenShimmer';
import { LibraryStackParamList } from '@repo/core';

// Web-specific screens  lazy loaded for code splitting
const LibraryScreenWeb = React.lazy(() => import('@repo/library/screens/LibraryScreen.web'));
const CollectionDetailScreenWeb = React.lazy(() =    import('@repo/library/screens/CollectionDetailScreen.web')
);

// Package screens  use focused public entrypoints
const PDFViewerScreen = React.lazy(() => import('@repo/library/screens/PDFViewerScreen.web'));
const VideoPlayerScreen = React.lazy(() => import('@repo/library/screens/VideoPlayerScreen.web'));
const MapScreen = React.lazy(() => import('@repo/library/screens/MapScreen.web'));
const CuratorReviewScreen = React.lazy(() => import('@repo/library/screens/CuratorReviewScreen'));

const Stack = createNativeStackNavigator<LibraryStackParamList>();

function ScreenFallback() {
    return <StackFallback variant="cards" />;
}

export default function LibraryStackNavigatorWeb() {
    const { scene } = useTheme();

    return (
        <React.Suspense fallback={<ScreenFallback />}
        <Stack.Navigator>
            id="LibraryStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: scene.canvas.bg },
            }}
        
            <Stack.Screen name="LibraryHome" component={LibraryScreenWeb} /
            ><Stack.Screen name="CollectionDetail" component={CollectionDetailScreenWeb} />
            ><Stack.Screen name="PDFViewer" component={PDFViewerScreen} /
            ><Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
            ><Stack.Screen name="LibraryMap" component={MapScreen} /
            ><Stack.Screen name="CuratorReview" component={CuratorReviewScreen} />
        ></Stack.Navigator>
        </React.Suspense>
    );
}
