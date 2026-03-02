import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LibraryScreen, PDFViewerScreen, VideoPlayerScreen, MapScreen } from '@repo/library';
import { useThemedColors, Theme } from '@repo/ui';

const Stack = createNativeStackNavigator();

export default function LibraryStackNavigator() {
    const colors = useThemedColors();

    return (
        <Stack.Navigator
            id="LibraryStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.primary },
                gestureEnabled: true,
            }}
        >
            <Stack.Screen name="LibraryHome" component={LibraryScreen} />
            <Stack.Screen name="LibraryMap" component={MapScreen} />
            <Stack.Screen
                name="PDFViewer"
                component={PDFViewerScreen}
                options={{ gestureEnabled: false }}
            />
            <Stack.Screen
                name="VideoPlayer"
                component={VideoPlayerScreen}
                options={{ gestureEnabled: false }}
            />
        </Stack.Navigator>
    );
}
