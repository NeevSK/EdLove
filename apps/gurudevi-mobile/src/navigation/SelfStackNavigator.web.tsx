import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { SelfStackParamList } from "@repo/core/types";
import { useTheme } from "@repo/ui/primitives";

import React from "react";
import { StackFallback } from "../components/web/WebScreenShimmer";

// Web-specific lazy loading
const SelfScreenWeb = React.lazy(
	() => import("@repo/self/screens/SelfScreen.web"),
);
const AIAssistantScreen = React.lazy(
	() => import("@repo/ai/screens/AIAssistantScreen.web"),
);

const Stack = createNativeStackNavigator<SelfStackParamList>();

function ScreenFallback() {
	return <StackFallback variant="full" />;
}

export default function SelfStackNavigatorWeb() {
	const { gradientNodes } = useTheme();

	return (
		<React.Suspense fallback={<ScreenFallback />}>
			<Stack.Navigator
				id="SelfStack"
				screenOptions={{
					headerShown: false,
					contentStyle: {
						backgroundColor: gradientNodes[0],
						overflow: "visible",
						minHeight: "100%",
					},
				}}
			>
				<Stack.Screen name="SelfMain" component={SelfScreenWeb} />
				<Stack.Screen
					name="AIAssistant"
					component={AIAssistantScreen}
					options={{
						presentation: "modal",
						animation: "slide_from_bottom",
					}}
				/>
			</Stack.Navigator>
		</React.Suspense>
	);
}
